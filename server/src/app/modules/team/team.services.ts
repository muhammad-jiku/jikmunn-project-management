import { Team } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../lib/prisma';
import {
  executeSafeQuery,
  executeSafeTransaction,
} from '../../../lib/transactionManager';

interface TeamCreatePayload extends Team {
  members?: { userId: string }[];
  projects?: { projectId: number }[];
}

const insertIntoDB = async (payload: TeamCreatePayload): Promise<Team> => {
  // Extract members and projects for later use
  const { members, projects, ...teamData } = payload;

  return await executeSafeTransaction(async (tx) => {
    // Check if project owner exists and is a manager
    const ownerExists = await tx.user.findUnique({
      where: {
        userId: teamData.teamOwnerId,
        role: 'MANAGER',
      },
    });

    if (!ownerExists) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        'Team owner must be a manager and must exist!'
      );
    }

    // Ensure the auto-increment sequence for tblteam is set correctly
    await tx.$executeRaw`
      SELECT setval(
        pg_get_serial_sequence('tblteam', 'id'),
        (SELECT COALESCE(MAX(id), 0) FROM tblteam) + 1
      )
    `;

    // Create the team
    const team = await tx.team.create({
      data: teamData,
    });

    // If members are provided, create team members
    if (members && members.length > 0) {
      // Verify all users exist before creating members
      for (const member of members) {
        const userExists = await tx.user.findUnique({
          where: { userId: member.userId },
        });

        if (!userExists) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `User with ID ${member.userId} not found!`
          );
        }
      }

      // Ensure the auto-increment sequence for tblteammember is set correctly
      await tx.$executeRaw`
        SELECT setval(
          pg_get_serial_sequence('tblteammember', 'id'),
          (SELECT COALESCE(MAX(id), 0) FROM tblteammember) + 1
        )
      `;

      // Create team members
      await Promise.all(
        members.map((member) =>
          tx.teamMember.create({
            data: {
              teamId: team.id,
              userId: member.userId,
            },
          })
        )
      );
    }

    // Add team owner as a member if not already included
    const ownerAlreadyMember = members?.some(
      (m) => m.userId === teamData.teamOwnerId
    );

    if (!ownerAlreadyMember) {
      // Ensure the auto-increment sequence for tblteammember is set correctly
      await tx.$executeRaw`
        SELECT setval(
          pg_get_serial_sequence('tblteammember', 'id'),
          (SELECT COALESCE(MAX(id), 0) FROM tblteammember) + 1
        )
      `;

      await tx.teamMember.create({
        data: {
          teamId: team.id,
          userId: teamData.teamOwnerId,
        },
      });
    }

    // If projects are provided, create project teams
    if (projects && projects.length > 0) {
      // Verify all projects exist before creating associations
      for (const project of projects) {
        const projectExists = await tx.project.findUnique({
          where: { id: project.projectId },
        });

        if (!projectExists) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Project with ID ${project.projectId} not found!`
          );
        }
      }

      // Ensure the auto-increment sequence for tblprojectteam is set correctly
      await tx.$executeRaw`
        SELECT setval(
          pg_get_serial_sequence('tblprojectteam', 'id'),
          (SELECT COALESCE(MAX(id), 0) FROM tblprojectteam) + 1
        )
      `;

      // Create project teams
      await Promise.all(
        projects.map((project) =>
          tx.projectTeam.create({
            data: {
              teamId: team.id,
              projectId: project.projectId,
            },
          })
        )
      );
    }

    // Return the created team with all relationships included
    return (await tx.team.findUnique({
      where: { id: team.id },
      include: {
        owner: {
          include: {
            manager: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
        projectTeams: {
          include: {
            project: true,
          },
        },
      },
    })) as Team;
  });
};

const getAllFromDB = async (
  options: IPaginationOptions
): Promise<IGenericResponse<Team[]>> => {
  const { limit, page, skip } = paginationHelpers.calculatePagination(options);

  // Use safe query wrapper for both data fetch and count
  const [teams, total] = await Promise.all([
    executeSafeQuery(() =>
      prisma.team.findMany({
        skip,
        take: limit,
        include: {
          owner: {
            include: {
              manager: true,
            },
          },
          members: {
            include: {
              user: true,
            },
          },
          projectTeams: {
            include: {
              project: true,
            },
          },
        },
      })
    ),
    executeSafeQuery(() => prisma.team.count()),
  ]);

  return {
    meta: { total, page, limit },
    data: teams,
  };
};

const getByIdFromDB = async (id: number): Promise<Team | null> => {
  const team = await executeSafeQuery(() =>
    prisma.team.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            manager: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
        projectTeams: {
          include: {
            project: true,
          },
        },
      },
    })
  );

  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found!');
  }

  return team;
};

interface TeamUpdatePayload extends Partial<Team> {
  members?: { userId: string; action: 'add' | 'remove' }[];
  projects?: { projectId: number; action: 'add' | 'remove' }[];
}

const updateOneInDB = async (
  id: number,
  payload: TeamUpdatePayload
): Promise<Team> => {
  // Extract members and projects for later use
  const { members, projects, ...teamData } = payload;

  return await executeSafeTransaction(async (tx) => {
    // Check if team exists
    const existingTeam = await tx.team.findUnique({
      where: { id },
      include: {
        members: true,
        projectTeams: true,
      },
    });

    if (!existingTeam) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found!');
    }

    // If updating owner, verify new owner exists and is a manager
    if (teamData.teamOwnerId) {
      const ownerExists = await tx.user.findUnique({
        where: {
          userId: teamData.teamOwnerId,
          role: 'MANAGER',
        },
      });

      if (!ownerExists) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'New team owner must be a manager and must exist!'
        );
      }
    }

    // Update team data if provided
    let updatedTeam = existingTeam as Team;
    if (Object.keys(teamData).length > 0) {
      updatedTeam = await tx.team.update({
        where: { id },
        data: teamData,
      });
    }

    // Update team members if provided
    if (members && members.length > 0) {
      for (const member of members) {
        // Check if user exists
        const userExists = await tx.user.findUnique({
          where: { userId: member.userId },
        });

        if (!userExists) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `User with ID ${member.userId} not found!`
          );
        }

        if (member.action === 'add') {
          // Check if member already exists
          const existingMember = await tx.teamMember.findFirst({
            where: {
              teamId: id,
              userId: member.userId,
            },
          });

          if (!existingMember) {
            // Ensure the auto-increment sequence for tblteammember is set correctly
            await tx.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('tblteammember', 'id'),
      (SELECT COALESCE(MAX(id), 0) FROM tblteammember) + 1
    )
  `;

            // Add new member
            await tx.teamMember.create({
              data: {
                teamId: id,
                userId: member.userId,
              },
            });
          }
        } else if (member.action === 'remove') {
          // Don't allow removing the team owner
          if (member.userId === updatedTeam.teamOwnerId) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              'Cannot remove team owner from the team!'
            );
          }

          // Remove member
          await tx.teamMember.deleteMany({
            where: {
              teamId: id,
              userId: member.userId,
            },
          });
        }
      }
    }

    // Update project teams if provided
    if (projects && projects.length > 0) {
      for (const project of projects) {
        // Check if project exists
        const projectExists = await tx.project.findUnique({
          where: { id: project.projectId },
        });

        if (!projectExists) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            `Project with ID ${project.projectId} not found!`
          );
        }

        if (project.action === 'add') {
          // Check if project team already exists
          const existingProjectTeam = await tx.projectTeam.findFirst({
            where: {
              teamId: id,
              projectId: project.projectId,
            },
          });

          if (!existingProjectTeam) {
            // Ensure the auto-increment sequence for tblprojectteam is set correctly
            await tx.$executeRaw`
    SELECT setval(
      pg_get_serial_sequence('tblprojectteam', 'id'),
      (SELECT COALESCE(MAX(id), 0) FROM tblprojectteam) + 1
    )
  `;
            // Add new project team
            await tx.projectTeam.create({
              data: {
                teamId: id,
                projectId: project.projectId,
              },
            });
          }
        } else if (project.action === 'remove') {
          // Remove project team
          await tx.projectTeam.deleteMany({
            where: {
              teamId: id,
              projectId: project.projectId,
            },
          });
        }
      }
    }

    // If the team owner has changed, ensure the new owner is a member of the team
    if (
      teamData.teamOwnerId &&
      teamData.teamOwnerId !== existingTeam.teamOwnerId
    ) {
      // Check if new owner is already a member
      const ownerIsMember = await tx.teamMember.findFirst({
        where: {
          teamId: id,
          userId: teamData.teamOwnerId,
        },
      });

      if (!ownerIsMember) {
        // Ensure the auto-increment sequence for tblteammember is set correctly
        await tx.$executeRaw`
          SELECT setval(
              pg_get_serial_sequence('tblteammember', 'id'),
              (SELECT COALESCE(MAX(id), 0) FROM tblteammember) + 1
          )
        `;

        // Add new owner as a member
        await tx.teamMember.create({
          data: {
            teamId: id,
            userId: teamData.teamOwnerId,
          },
        });
      }
    }

    // Return the updated team with all relationships included
    return (await tx.team.findUnique({
      where: { id },
      include: {
        owner: {
          include: {
            manager: true,
          },
        },
        members: {
          include: {
            user: true,
          },
        },
        projectTeams: {
          include: {
            project: true,
          },
        },
      },
    })) as Team;
  });
};

const deleteByIdFromDB = async (id: number): Promise<Team | null> => {
  return await executeSafeTransaction(async (tx) => {
    // Check if team exists
    const team = await tx.team.findUnique({
      where: { id },
    });

    if (!team) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Team not found!');
    }

    // Delete associated team members
    await tx.teamMember.deleteMany({
      where: { teamId: id },
    });

    // Delete associated project teams
    await tx.projectTeam.deleteMany({
      where: { teamId: id },
    });

    // Delete the team
    return await tx.team.delete({
      where: { id },
    });
  });
};

export const TeamServices = {
  insertIntoDB,
  getAllFromDB,
  getByIdFromDB,
  updateOneInDB,
  deleteByIdFromDB,
};
