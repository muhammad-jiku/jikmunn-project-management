/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from '@/components/shared/modals/Modal';
import { useCreateProjectTeamMutation } from '@/state/api/projectTeamsApi';
import { NewProjectTeam } from '@/state/types';
import { useState } from 'react';
import toast from 'react-hot-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // teamId: number;
  id?: number | null;
};

const ModalNewProjectTeam = ({ isOpen, onClose, id = null }: Props) => {
  const [projectId, setProjectId] = useState<number>();
  const [teamId, setTeamId] = useState<number>();

  const [createProjectTeam, { isLoading }] = useCreateProjectTeamMutation();

  const handleSubmit = async () => {
    if (!projectId || !(id !== null || teamId)) return;

    // Build the payload as a NewProjectTeam (which omits id, createdAt, and updatedAt)
    const newProjectTeamPayload: NewProjectTeam = {
      projectId,
      teamId: id !== null ? Number(id) : Number(teamId),
    };

    // Remove any accidental keys (like id) from the payload.
    // This ensures we send only the expected fields.
    console.log('Creating project team with payload:', newProjectTeamPayload);
    const newProjectTeamData: any = await createProjectTeam(
      newProjectTeamPayload
    );
    console.log('Project team creation response check:', newProjectTeamData);
    if (newProjectTeamData?.data?.success) {
      // Close the modal if creation was successful
      toast.success(
        newProjectTeamData?.data?.message ||
          'New project team added successfully!'
      );
      resetForm();
      onClose();
    } else {
      toast.error(
        newProjectTeamData?.error?.message ||
          'Something went wrong, Please try again!'
      );
    }
  };

  const resetForm = () => {
    setProjectId(undefined);
    setTeamId(undefined);
    // setError(null);
  };

  // Updated validation logic:
  // If id is provided, only projectId and teamId are required.
  const isFormValid = () => {
    return Boolean(projectId && teamId);
  };

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
          placeholder='Project ID'
          value={projectId}
          onChange={(e) => setProjectId(Number(e.target.value))}
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
          {isLoading ? 'Creating...' : 'Create Project Team'}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewProjectTeam;
