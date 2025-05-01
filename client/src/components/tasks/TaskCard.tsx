import { Task } from '@/state/types';
import { format } from 'date-fns';
import Image from 'next/image';
import i1 from '../../../public/images/i1.jpg';

type Props = {
  task: Task;
};

// Status color mapping
const statusColor: Record<string, string> = {
  TO_DO: '#2563EB',
  WORK_IN_PROGRESS: '#059669',
  UNDER_REVIEW: '#D97706',
  COMPLETED: '#00ff0d',
};

// Priority color mapping
const priorityColor: Record<string, string> = {
  Backlog: '#6B7280', // Gray
  Low: '#3B82F6', // Blue
  Medium: '#FBBF24', // Amber
  High: '#F59E0B', // Orange
  Urgent: '#EF4444', // Red
};

const TaskCard = ({ task }: Props) => {
  // Make sure status is not undefined before using it as an index
  const status = task?.status || 'TO_DO'; // Default to 'TO_DO' if status is undefined
  const statusColorValue = statusColor[status] || '#2563EB'; // Default to blue if status is not in our map

  // Make sure priority is not undefined before using it as an index
  const priority = task?.priority || 'Medium'; // Default to 'Medium' if priority is undefined
  const priorityColorValue = priorityColor[priority] || '#FBBF24'; // Default to amber if priority is not in our map

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'TO_DO':
        return 'To Do';
      case 'WORK_IN_PROGRESS':
        return 'Work In Progress';
      case 'UNDER_REVIEW':
        return 'Under Review';
      default:
        return 'Completed';
    }
  };

  return (
    <div className='mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white'>
      {task?.attachments && task?.attachments.length > 0 && (
        <div>
          <strong>Attachments:</strong>
          <div className='flex flex-wrap'>
            {task.attachments && task.attachments.length > 0 && (
              <Image
                src={i1}
                alt={task.attachments[0].fileName}
                width={400}
                height={200}
                className='rounded-md'
              />
            )}
          </div>
        </div>
      )}
      <p>
        <strong>ID:</strong> {task.id}
      </p>
      <p>
        <strong>Title:</strong> {task.title}
      </p>
      <p>
        <strong>Description:</strong>{' '}
        {task.description || 'No description provided'}
      </p>
      <p>
        <strong>Status:</strong>{' '}
        <span style={{ color: statusColorValue }}>
          {getStatusLabel(status)}
        </span>
      </p>
      <p>
        <strong>Priority:</strong>{' '}
        <span style={{ color: priorityColorValue }}>{priority}</span>
      </p>
      <p>
        <strong>Tags:</strong> {task.tags || 'No tags'}
      </p>
      <p>
        <strong>Start Date:</strong>{' '}
        {task.startDate ? format(new Date(task.startDate), 'P') : 'Not set'}
      </p>
      <p>
        <strong>Due Date:</strong>{' '}
        {task.dueDate ? format(new Date(task.dueDate), 'P') : 'Not set'}
      </p>
      <p>
        <strong>Author:</strong> {task?.author ? `${task?.author}` : 'Unknown'}
      </p>
      <p>
        <strong>Assignee:</strong>{' '}
        {task?.assignee ? `${task?.assignee}` : 'Unassigned'}
      </p>
    </div>
  );
};

export default TaskCard;
