/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from '@/components/shared/modals/Modal';
import { useGetTeamQuery, useUpdateTeamMutation } from '@/state/api/teamsApi';
import { Team } from '@/state/types';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  teamId: number | null;
};

const ModalUpdateTeam = ({ isOpen, onClose, teamId }: Props) => {
  const [name, setName] = useState<string>('');
  const [teamOwnerId, setTeamOwnerId] = useState<string>('');

  const { data: team, isLoading: isLoadingTeam } = useGetTeamQuery(
    teamId as number,
    {
      skip: !isOpen || teamId === null,
    }
  );

  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();

  useEffect(() => {
    if (team) {
      setName(team?.data?.name);
      setTeamOwnerId(team?.data?.teamOwnerId);
    }
  }, [team]);

  const handleSubmit = async () => {
    if (!name || !teamId) return;

    // Construct the payload
    const updatedTeamPayload: Partial<Team> = {
      name,
      teamOwnerId,
    };

    try {
      const result: any = await updateTeam({
        id: teamId,
        data: updatedTeamPayload,
      }).unwrap();

      if (result.success) {
        // Close the modal if updation was successful
        toast.success(result?.message || 'Team data updated successfully!');
        onClose();
      } else {
        toast.error('Something went wrong, Please try again!');
      }
    } catch (error) {
      console.error('Failed to update project:', error); // debugging log
    }
  };

  const isFormValid = () => {
    return Boolean(name && teamOwnerId);
  };

  const inputStyles =
    'w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Update Team'>
      {isLoadingTeam ? (
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
            placeholder='Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type='text'
            className={inputStyles}
            placeholder='Owner ID'
            value={teamOwnerId}
            disabled={true}
            // onChange={(e) => setTeamOwnerId(Number(e.target.value))}
          />
          <button
            type='submit'
            className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              !isFormValid() || isUpdating
                ? 'cursor-not-allowed opacity-50'
                : ''
            }`}
            disabled={!isFormValid() || isUpdating}
          >
            {isUpdating ? 'Updating...' : 'Update Team'}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default ModalUpdateTeam;
