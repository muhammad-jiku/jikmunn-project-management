import { useCreateTaskMutation } from '@/state/api/tasksApi';
import { NewTask, Priority, Status } from '@/state/types';
import { useAppSelector } from '@/store';
import { formatISO } from 'date-fns';
import { useState } from 'react';
import Modal from './Modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null;
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<Status>(Status.TO_DO);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState<string>('');
  const [points, setPoints] = useState<number>();
  const [startDate, setStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [projectId, setProjectId] = useState<number>();
  const [assignedUserId, setAssignedUserId] = useState<string>('');

  const globalUser = useAppSelector((state) => state?.global?.user?.data);
  const [createTask, { isLoading }] = useCreateTaskMutation();

  const authorUserId = globalUser?.userId as string;

  const handleSubmit = async () => {
    if (!title || !authorUserId || !(id !== null || projectId)) return;

    const formattedStartDate = formatISO(new Date(startDate), {
      representation: 'complete',
    });
    const formattedDueDate = formatISO(new Date(dueDate), {
      representation: 'complete',
    });

    // Build the payload as a NewTask (which omits id, createdAt, and updatedAt)
    const newTaskPayload: NewTask = {
      title,
      description,
      status,
      priority,
      tags,
      points,
      startDate: formattedStartDate,
      dueDate: formattedDueDate,
      authorUserId,
      assignedUserId,
      projectId: id !== null ? Number(id) : Number(projectId),
    };

    // Remove any accidental keys (like id) from the payload.
    // This ensures we send only the expected fields.

    console.log('Creating task with payload:', newTaskPayload);

    await createTask(newTaskPayload);
  };

  // Updated validation logic:
  // If id is provided, only title and author are required.
  // Otherwise, projectId is also required.
  const isFormValid = () => {
    if (id !== null) {
      return Boolean(title && authorUserId);
    }
    return Boolean(title && authorUserId && projectId);
  };

  const selectStyles =
    'mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  const inputStyles =
    'w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Create New Task'>
      <form
        className='mt-4 space-y-6'
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type='text'
          className={inputStyles}
          placeholder='Title'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className={inputStyles}
          placeholder='Description'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2'>
          <select
            className={selectStyles}
            value={status}
            onChange={(e) =>
              setStatus(Status[e.target.value as keyof typeof Status])
            }
          >
            <option value=''>Select Status</option>
            <option value={Status.TO_DO}>To Do</option>
            <option value={Status.WORK_IN_PROGRESS}>Work In Progress</option>
            <option value={Status.UNDER_REVIEW}>Under Review</option>
            <option value={Status.COMPLETED}>Completed</option>
          </select>
          <select
            className={selectStyles}
            value={priority}
            onChange={(e) =>
              setPriority(Priority[e.target.value as keyof typeof Priority])
            }
          >
            <option value=''>Select Priority</option>
            <option value={Priority.Urgent}>Urgent</option>
            <option value={Priority.High}>High</option>
            <option value={Priority.Medium}>Medium</option>
            <option value={Priority.Low}>Low</option>
            <option value={Priority.Backlog}>Backlog</option>
          </select>
        </div>
        <input
          type='text'
          className={inputStyles}
          placeholder='Tags (comma separated)'
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <input
          type='text'
          className={inputStyles}
          placeholder='Points'
          value={points}
          onChange={(e) => setPoints(Number(e.target.value))}
        />
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2'>
          <input
            type='date'
            className={inputStyles}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type='date'
            className={inputStyles}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <input
          type='text'
          className={inputStyles}
          placeholder='Assigned User ID'
          value={assignedUserId}
          onChange={(e) => setAssignedUserId(e.target.value)}
        />
        {id === null && (
          <input
            type='text'
            className={inputStyles}
            placeholder='Project Id'
            value={projectId}
            onChange={(e) => setProjectId(Number(e.target.value))}
          />
        )}
        <button
          type='submit'
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            !isFormValid() || isLoading ? 'cursor-not-allowed opacity-50' : ''
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Task'}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;
