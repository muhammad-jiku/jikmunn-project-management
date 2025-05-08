/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from '@/components/shared/modals/Modal';
import { useCreateTeamMutation } from '@/state/api/teamsApi';
import { NewTeam } from '@/state/types';
import { useAppSelector } from '@/store';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ModalNewTeam = ({ isOpen, onClose }: Props) => {
  const globalUser = useAppSelector((state) => state?.global?.user?.data);

  const [name, setName] = useState<string>('');
  const [teamOwnerId, setTeamOwnerId] = useState<string>(
    (globalUser?.data?.userId as string) || ''
  );

  const [createTeam, { isLoading }] = useCreateTeamMutation();

  const handleSubmit = async () => {
    if (!name || !teamOwnerId) return;

    // Build the payload as a NewTeam(which omits id, createdAt, and updatedAt)
    const newTeamPayload: NewTeam = {
      name,
      teamOwnerId,
    };

    // Remove any accidental keys (like id) from the payload.
    // This ensures we send only the expected fields.

    const newTeamData: any = await createTeam(newTeamPayload);

    if (newTeamData?.data?.success) {
      // Close the modal if creation was successful
      toast.success(
        newTeamData?.data?.message || 'New team created successfully!'
      );
      resetForm();
      onClose();
    } else {
      toast.error(
        newTeamData?.error?.message || 'Something went wrong, Please try again!'
      );
    }
  };

  const resetForm = () => {
    setName('');
    setTeamOwnerId('');
    // setError(null);
  };

  // Updated validation logic:
  // If id is provided, only name and ownerId are required.
  const isFormValid = () => {
    return Boolean(name && teamOwnerId);
  };

  const inputStyles =
    'w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Create New Team'>
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
          onChange={(e) => setTeamOwnerId(e.target.value)}
        />
        <button
          type='submit'
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
            !isFormValid() || isLoading ? 'cursor-not-allowed opacity-50' : ''
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Team'}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTeam;
