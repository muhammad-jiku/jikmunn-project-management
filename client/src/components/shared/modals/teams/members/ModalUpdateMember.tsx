/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from '@/components/shared/modals/Modal';
import {
  useGetTeamMemberQuery,
  useUpdateTeamMemberMutation,
} from '@/state/api/teamMembersApi';
import { TeamMember } from '@/state/types';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // teamId: number;
  id: number | null;
};

const ModalUpdateMember = ({ isOpen, onClose, id }: Props) => {
  const [userId, setUserId] = useState<string>('');
  const [teamId, setTeamId] = useState<number>();

  const { data: member, isLoading: isLoadingMember } = useGetTeamMemberQuery(
    id as number,
    {
      skip: !isOpen || id === null,
    }
  );

  const [updateTeamMember, { isLoading: isUpdating }] =
    useUpdateTeamMemberMutation();

  useEffect(() => {
    if (member) {
      setUserId(member?.data?.userId);
      setTeamId(member?.data?.teamId);
    }
  }, [member]);

  const handleSubmit = async () => {
    if (!userId || !teamId) return;

    // Construct the payload
    const updatedTeamMemberPayload: Partial<TeamMember> = {
      userId,
      teamId,
    };

    try {
      const result: any = await updateTeamMember({
        id: teamId,
        data: updatedTeamMemberPayload,
      }).unwrap();

      if (result.success) {
        // Close the modal if updation was successful
        toast.success(result?.message || 'Member data updated successfully!');
        onClose();
      } else {
        toast.error('Something went wrong, Please try again!');
      }
    } catch (error) {
      console.error('Failed to update project:', error); // debugging log
    }
  };

  const isFormValid = () => {
    return Boolean(userId && teamId);
  };

  const inputStyles =
    'w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Update Team Member'>
      {isLoadingMember ? (
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
            placeholder='User ID'
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            type='text'
            className={inputStyles}
            placeholder='Team ID'
            value={teamId}
            disabled={true}
            // onChange={(e) => setTeamId(Number(e.target.value))}
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
            {isUpdating ? 'Updating...' : 'Update Member'}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default ModalUpdateMember;
