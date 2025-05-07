/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from '@/components/shared/modals/Modal';
import { useCreateTeamMemberMutation } from '@/state/api/teamMembersApi';
import { NewTeamMember } from '@/state/types';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // teamId: number;
  id?: number | null;
};

const ModalNewMember = ({ isOpen, onClose, id = null }: Props) => {
  const [teamId, setTeamId] = useState<number>();
  const [userId, setUserId] = useState<string>('');

  const [createTeamMember, { isLoading }] = useCreateTeamMemberMutation();

  console.log('ids...', userId, id, teamId);

  const handleSubmit = async () => {
    if (!userId || !(id !== null || teamId)) return;

    // Build the payload as a NewTeamMember (which omits id, createdAt, and updatedAt)
    const newTeamMemberPayload: NewTeamMember = {
      userId,
      teamId: id !== null ? Number(id) : Number(teamId),
    };

    // Remove any accidental keys (like id) from the payload.
    // This ensures we send only the expected fields.

    console.log('Creating team member with payload:', newTeamMemberPayload);
    const newTeamMemberData: any = await createTeamMember(newTeamMemberPayload);
    console.log('Team member creation response check:', newTeamMemberData);
    if (newTeamMemberData?.data?.success) {
      // Close the modal if creation was successful
      toast.success(
        newTeamMemberData?.data?.message ||
          'New team member added successfully!'
      );
      resetForm();
      onClose();
    } else {
      toast.error(
        newTeamMemberData?.error?.message ||
          'Something went wrong, Please try again!'
      );
    }
  };

  const resetForm = () => {
    setUserId('');
    setTeamId(undefined);
    // setError(null);
  };

  // Updated validation logic:
  // If id is provided, only userId and teamId are required.
  const isFormValid = () => {
    return Boolean(userId && (id || teamId));
  };

  const inputStyles =
    'w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Add New Member'>
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
        {id === null && (
          <input
            type='text'
            className={inputStyles}
            placeholder='Team ID'
            value={teamId}
            disabled={true}
            onChange={(e) => setTeamId(Number(e.target.value))}
          />
        )}
        <button
          type='submit'
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            !isFormValid() || isLoading ? 'cursor-not-allowed opacity-50' : ''
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Team Member'}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewMember;
