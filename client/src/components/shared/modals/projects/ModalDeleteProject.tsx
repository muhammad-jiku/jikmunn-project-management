/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useDeleteProjectMutation,
  useGetProjectQuery,
} from '@/state/api/projectsApi';
import toast from 'react-hot-toast';
import Modal from '../Modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: number | null;
};

const ModalDeleteProject = ({ isOpen, onClose, projectId }: Props) => {
  // Only fetch project data when the modal is open and we have a projectId
  const { data: project, isLoading: isProjectLoading } = useGetProjectQuery(
    projectId as number,
    {
      skip: !isOpen || projectId === null,
    }
  );

  const [deleteProject, { isLoading: isDeleteLoading }] =
    useDeleteProjectMutation();

  const handleDelete = async () => {
    if (!projectId) return;

    try {
      const result: any = await deleteProject(projectId).unwrap();

      if (result.success) {
        // Close the modal if deletion was successful
        toast.success(result?.message || 'Project data deleted successfully!');
        onClose();
      } else {
        toast.error('Something went wrong, Please try again!');
      }
    } catch (error) {
      console.error('Failed to delete project:', error); // debugging log
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Delete Project'>
      {isProjectLoading ? (
        <div className='flex justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-primary'></div>
        </div>
      ) : (
        <div className='mt-4 space-y-6'>
          <p className='text-center dark:text-white'>
            Are you sure you want to delete project:
            <span className='font-bold ml-1'>{project?.data?.title}</span>?
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

export default ModalDeleteProject;
