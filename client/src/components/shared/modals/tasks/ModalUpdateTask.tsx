/* eslint-disable @typescript-eslint/no-explicit-any */

import { useGetTaskQuery, useUpdateTaskMutation } from '@/state/api/tasksApi';
import { Priority, Status, Task } from '@/state/types';
import { formatISO, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../Modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  taskId: number | null;
};

const ModalUpdateTask = ({ isOpen, onClose, taskId }: Props) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [status, setStatus] = useState<Status>(Status.TO_DO);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState<string>('');
  const [points, setPoints] = useState<number>();
  const [startDate, setStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [projectId, setProjectId] = useState<number>();
  const [authorUserId, setAuthorUserId] = useState<string>('');
  const [assignedUserId, setAssignedUserId] = useState<string>('');

  // Only fetch task data when the modal is open and we have a taskId
  const { data: task, isLoading: isTaskLoading } = useGetTaskQuery(
    taskId as number,
    {
      skip: !isOpen || taskId === null,
    }
  );

  const [updateTask, { isLoading: isUpdateLoading }] = useUpdateTaskMutation();

  // Set form data when task data is loaded
  useEffect(() => {
    if (task) {
      setTitle(task?.data?.title);
      setDescription(task?.data?.description);
      setStatus(task?.data?.status);
      setPriority(task?.data?.priority);
      setTags(task?.data?.tags);
      setPoints(task?.data?.points);
      setProjectId(task?.data?.projectId);
      setAuthorUserId(task?.data?.authorUserId);
      setAssignedUserId(task?.data?.assignedUserId);

      // Format dates for the date input (YYYY-MM-DD)
      if (task?.data?.startDate) {
        const formattedStartDate = parseISO(task?.data?.startDate)
          .toISOString()
          .split('T')[0];
        setStartDate(formattedStartDate);
      }

      if (task?.data?.dueDate) {
        const formattedDueDate = parseISO(task?.data?.dueDate)
          .toISOString()
          .split('T')[0];
        setDueDate(formattedDueDate);
      }
    }
  }, [task]);

  const handleSubmit = async () => {
    if (!title || !startDate || !dueDate || !taskId) return;

    const formattedStartDate = formatISO(new Date(startDate));
    const formattedDueDate = formatISO(new Date(dueDate));

    // Construct the payload
    const updatedTaskPayload: Partial<Task> = {
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
    };

    try {
      const result: any = await updateTask({
        id: taskId,
        data: updatedTaskPayload,
      }).unwrap();

      if (result.success) {
        // Close the modal if updation was successful
        toast.success(result?.message || 'Task data updated successfully!');
        onClose();
      } else {
        toast.error('Something went wrong, Please try again!');
      }
    } catch (error) {
      console.error('Failed to update project:', error); // debugging log
    }
  };

  const isFormValid = () => {
    if (taskId !== null) {
      return Boolean(title && authorUserId);
    }
    return Boolean(title && authorUserId && assignedUserId);
  };

  const selectStyles =
    'mb-4 block w-full rounded border border-gray-300 px-3 py-2 dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  const inputStyles =
    'w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Update Task'>
      {isTaskLoading ? (
        <div className='flex justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-primary'></div>
        </div>
      ) : (
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

          <input
            type='text'
            className={inputStyles}
            placeholder='Project Id'
            value={projectId}
            disabled={true}
            // onChange={(e) => setProjectId(Number(e.target.value))}
          />
          <button
            type='submit'
            className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              !isFormValid() || isUpdateLoading
                ? 'cursor-not-allowed opacity-50'
                : ''
            }`}
            disabled={!isFormValid() || isUpdateLoading}
          >
            {isUpdateLoading ? 'Updating...' : 'Update Task'}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default ModalUpdateTask;
