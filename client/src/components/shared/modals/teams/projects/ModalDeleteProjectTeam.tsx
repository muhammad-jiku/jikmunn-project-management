/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from '@/components/shared/modals/Modal';
import {
  useDeleteProjectTeamMutation,
  useGetProjectTeamQuery,
} from '@/state/api/projectTeamsApi';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id: number;
};

const ModalDeleteProjectTeam = ({ isOpen, onClose, id }: Props) => {
  const { data: projectTeam, isLoading: isLoadingProjectTeam } =
    useGetProjectTeamQuery(id as number, {
      skip: !isOpen || id === null,
    });

  console.log('project team delete modal...', projectTeam);

  const [deleteProjectTeam, { isLoading: isDeleteLoading }] =
    useDeleteProjectTeamMutation();

  const handleDelete = async () => {
    if (!id) return;

    try {
      const result: any = await deleteProjectTeam(id).unwrap();

      console.log('Project team deleted successfully:', result);
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Delete Project Team'>
      {isLoadingProjectTeam ? (
        <div className='flex justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-primary'></div>
        </div>
      ) : (
        <div className='mt-4 space-y-6'>
          <p className='text-center dark:text-white'>
            Are you sure you want to delete team member with the id of
            <span className='font-bold ml-1'>{projectTeam?.data?.id}</span>?
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

export default ModalDeleteProjectTeam;
