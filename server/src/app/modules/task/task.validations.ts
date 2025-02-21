import { TaskStatus } from '@prisma/client';
import { z } from 'zod';

const createTask = z.object({
  body: z
    .object({
      title: z.string({
        required_error: 'Title is required',
      }),
      description: z.string().optional(),
      status: z.nativeEnum(TaskStatus).optional(),
      priority: z.string().optional(),
      tags: z.string().optional(),
      startDate: z
        .string({
          required_error: 'Start date must be a valid date string',
        })
        .optional(),
      dueDate: z
        .string({
          required_error: 'Due date must be a valid date string',
        })
        .optional(),
      points: z.number().optional(),
      projectId: z.number({
        required_error: 'Project ID is required',
      }),
      authorUserId: z.string({
        required_error: 'Author User ID is required',
      }),
      assignedUserId: z.string().optional(),
    })
    .strict()
    .refine(
      (data) => {
        if (data.startDate && data.dueDate) {
          return new Date(data.startDate) < new Date(data.dueDate);
        }
        return true;
      },
      {
        message: 'Due date must be after start date',
      }
    ),
});

const updateTask = z.object({
  body: z
    .object({
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
    })
    .strict()
    .refine(
      (data) => {
        if (data.startDate && data.dueDate) {
          return new Date(data.startDate) < new Date(data.dueDate);
        }
        return true;
      },
      {
        message: 'Due date must be after start date',
      }
    )
    .optional(),
});

export const TaskValidations = {
  createTask,
  updateTask,
};
