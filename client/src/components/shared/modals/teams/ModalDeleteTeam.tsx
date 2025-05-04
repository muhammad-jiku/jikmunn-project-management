/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from '@/components/shared/modals/Modal';
import { useDeleteTeamMutation, useGetTeamQuery } from '@/state/api/teamsApi';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  teamId: number | null;
};

const ModalDeleteTeam = ({ isOpen, onClose, teamId }: Props) => {
  const { data: team, isLoading: isLoadingTeam } = useGetTeamQuery(
    teamId as number,
    {
      skip: !isOpen || teamId === null,
    }
  );

  console.log('team delete modal...', team);

  const [deleteTeam, { isLoading: isDeleting }] = useDeleteTeamMutation();

  const handleDelete = async () => {
    if (!teamId) return;

    try {
      const result: any = await deleteTeam(teamId).unwrap();
      console.log('Team deleted successfully:', result);
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete team:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Delete Team'>
      {isLoadingTeam ? (
        <div className='flex justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-primary'></div>
        </div>
      ) : (
        <div className='mt-4 space-y-6'>
          <p className='text-center dark:text-white'>
            Are you sure you want to delete team:
            <span className='font-bold ml-1'>{team?.data?.name}</span>?
          </p>
          <p className='text-center text-sm text-gray-500 dark:text-gray-400'>
            This action cannot be undone.
          </p>
          <div className='flex justify-end space-x-4 mt-6'>
            <button
              className='px-4 py-2 rounded-md border border-gray-300 dark:border-dark-tertiary dark:text-white'
              onClick={onClose}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className='px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600'
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ModalDeleteTeam;
