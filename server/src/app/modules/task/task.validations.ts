import { z } from 'zod';

const createTask = z.object({
  body: z
    .object({
      title: z.string({
        required_error: 'Title is required',
      }),
      description: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      tags: z.string().optional(),
      startDate: z.string().optional(),
      dueDate: z.string().optional(),
      points: z.number().optional(),
      projectId: z.number({
        required_error: 'Project ID is required',
      }),
      authorUserId: z.number({
        required_error: 'Author User ID is required',
      }),
      assignedUserId: z.number().optional(),
    })
    .strict(),
});

const updateTask = z.object({
  body: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      priority: z.string().optional(),
      tags: z.string().optional(),
      startDate: z.string().optional(),
      dueDate: z.string().optional(),
      points: z.number().optional(),
      projectId: z.number().optional(),
      authorUserId: z.number().optional(),
      assignedUserId: z.number().optional(),
    })
    .strict()
    .optional(),
});

export const TaskValidations = {
  createTask,
  updateTask,
};
