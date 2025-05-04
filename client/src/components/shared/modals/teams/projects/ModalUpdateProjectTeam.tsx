/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from '@/components/shared/modals/Modal';
import {
  useGetProjectTeamQuery,
  useUpdateProjectTeamMutation,
} from '@/state/api/projectTeamsApi';
import { ProjectTeam } from '@/state/types';
import { useEffect, useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  // teamId: number;
  id: number;
};

const ModalUpdateProjectTeam = ({ isOpen, onClose, id }: Props) => {
  const [projectId, setProjectId] = useState<number>();
  const [teamId, setTeamId] = useState<number>();

  const { data: projectTeam, isLoading: isLoadingProjectTeam } =
    useGetProjectTeamQuery(id as number, {
      skip: !isOpen || id === null,
    });

  console.log('project team update modal...', projectTeam);

  const [updateProjectTeam, { isLoading: isUpdating }] =
    useUpdateProjectTeamMutation();

  useEffect(() => {
    if (projectTeam) {
      setProjectId(projectTeam?.data?.ProjectId);
      setTeamId(projectTeam?.data?.teamId);
    }
  }, [projectTeam]);

  const handleSubmit = async () => {
    if (!projectId || !teamId) return;

    // Construct the payload
    const updatedProjectTeamPayload: Partial<ProjectTeam> = {
      projectId,
      teamId,
    };

    try {
      const result: any = await updateProjectTeam({
        id: teamId,
        data: updatedProjectTeamPayload,
      }).unwrap();

      console.log('Project team updated successfully:', result);
      if (result.success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const isFormValid = () => {
    return Boolean(projectId && teamId);
  };

  const inputStyles =
    'w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Update Team'>
      {isLoadingProjectTeam ? (
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
            placeholder='Project ID'
            value={projectId}
            onChange={(e) => setProjectId(Number(e.target.value))}
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
            {isUpdating ? 'Updating...' : 'Update Team'}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default ModalUpdateProjectTeam;
