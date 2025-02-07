import { z } from 'zod';

const createProject = z.object({
  body: z
    .object({
      title: z.string({
        required_error: 'Title is required',
      }),
      description: z
        .string({
          required_error: 'Description is required',
        })
        .optional(),
      startDate: z
        .string({
          required_error: 'Start date must be a valid date string',
        })
        .optional(),
      endDate: z
        .string({
          required_error: 'End date must be a valid date string',
        })
        .optional(),
      projectOwnerId: z.string({
        required_error: 'Project owner ID is required',
      }),
      projectTeams: z
        .array(
          z.object({
            teamId: z.number({
              required_error: 'Team ID is required',
            }),
          })
        )
        .optional(),
    })
    .strict()
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return new Date(data.startDate) < new Date(data.endDate);
        }
        return true;
      },
      {
        message: 'End date must be after start date',
      }
    ),
});

const updateProject = z.object({
  body: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      projectOwnerId: z.string().optional(),
      projectTeams: z
        .array(
          z.object({
            teamId: z.number(),
          })
        )
        .optional(),
    })
    .strict()
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return new Date(data.startDate) < new Date(data.endDate);
        }
        return true;
      },
      {
        message: 'End date must be after start date',
      }
    )
    .optional(),
});

// Validation for adding/removing teams to/from a project
const updateProjectTeams = z.object({
  body: z
    .object({
      projectId: z.number({
        required_error: 'Project ID is required',
      }),
      teamIds: z.array(
        z.number({
          required_error: 'Team IDs are required',
        })
      ),
    })
    .strict(),
});

export const ProjectValidations = {
  createProject,
  updateProject,
  updateProjectTeams,
};
