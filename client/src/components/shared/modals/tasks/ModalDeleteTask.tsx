/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDeleteTaskMutation, useGetTaskQuery } from '@/state/api/tasksApi';
import Modal from '../Modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  taskId: number | null;
};

const ModalDeleteTask = ({ isOpen, onClose, taskId }: Props) => {
  // Only fetch task data when the modal is open and we have a taskId
  const { data: task, isLoading: isTaskLoading } = useGetTaskQuery(
    taskId as number,
    {
      skip: !isOpen || taskId === null,
    }
  );

  console.log('task delete modal...', task);

  const [deleteTask, { isLoading: isDeleteLoading }] = useDeleteTaskMutation();

  const handleDelete = async () => {
    if (!taskId) return;

    try {
      const result: any = await deleteTask(taskId).unwrap();
      console.log('Task deleted successfully:', result);
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Delete Task'>
      {isTaskLoading ? (
        <div className='flex justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-primary'></div>
        </div>
      ) : (
        <div className='mt-4 space-y-6'>
          <p className='text-center dark:text-white'>
            Are you sure you want to delete task:
            <span className='font-bold ml-1'>{task?.data?.title}</span>?
          </p>
          <p className='text-center text-sm text-gray-500 dark:text-gray-400'>
            This action cannot be undone.
          </p>
          <div className='flex justify-end space-x-4 mt-6'>
            <button
              className='px-4 py-2 rounded-md border border-gray-300 dark:border-dark-tertiary dark:text-white'
              onClick={onClose}
              disabled={isDeleteLoading}
            >
              Cancel
            </button>
            <button
              className='px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600'
              onClick={handleDelete}
              disabled={isDeleteLoading}
            >
              {isDeleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ModalDeleteTask;
