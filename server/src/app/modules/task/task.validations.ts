import { TaskStatus } from '@prisma/client';
import { z } from 'zod';

const createTask = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.string().optional(),
    tags: z.string().optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    points: z.number().optional(),
    projectId: z.number({
      required_error: 'Project ID is required',
    }),
    authorUserId: z.string({
      required_error: 'Author User ID is required',
    }),
    assignedUserId: z.string().optional(),
  }),
});

const updateTask = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus).optional(),
    priority: z.string().optional(),
    tags: z.string().optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    points: z.number().optional(),
    projectId: z.number().optional(),
    authorUserId: z.string().optional(),
    assignedUserId: z.string().optional(),
  }),
});

export const TaskValidations = {
  createTask,
  updateTask,
};
