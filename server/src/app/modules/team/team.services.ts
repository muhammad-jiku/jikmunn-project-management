import { Team } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../../../errors/handleApiError';
import { paginationHelpers } from '../../../helpers/pagination';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { prisma } from '../../../shared/prisma';

interface TeamCreatePayload extends Team {
  members?: { userId: string }[];
  projects?: { projectId: number }[];
}

const insertIntoDB = async (payload: TeamCreatePayload): Promise<Team> => {
  console.log('creating team with payload:', payload);

  // Extract members and projects for later use
  const { members, projects, ...teamData } = payload;

  return await prisma.$transaction(async (tx) => {
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

  const teams = await prisma.team.findMany({
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
  });

  const total = await prisma.team.count();

  return {
    meta: { total, page, limit },
    data: teams,
  };
};

const getByIdFromDB = async (id: number): Promise<Team | null> => {
  const team = await prisma.team.findUnique({
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
  });

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

  return await prisma.$transaction(async (tx) => {
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
  return await prisma.$transaction(async (tx) => {
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
