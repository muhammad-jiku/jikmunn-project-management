/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useGetProjectQuery,
  useUpdateProjectMutation,
} from '@/state/api/projectsApi';
import { Project } from '@/state/types';
import { formatISO, parseISO } from 'date-fns';
import { useEffect, useState } from 'react';
import Modal from '../Modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  projectId: number | null;
};

const ModalUpdateProject = ({ isOpen, onClose, projectId }: Props) => {
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Only fetch project data when the modal is open and we have a projectId
  const { data: project, isLoading: isProjectLoading } = useGetProjectQuery(
    projectId as number,
    {
      skip: !isOpen || projectId === null,
    }
  );

  const [updateProject, { isLoading: isUpdateLoading }] =
    useUpdateProjectMutation();

  // Set form data when project data is loaded
  useEffect(() => {
    if (project) {
      setProjectTitle(project?.data?.title);
      setDescription(project?.data?.description || '');

      // Format dates for the date input (YYYY-MM-DD)
      if (project?.data?.startDate) {
        const formattedStartDate = parseISO(project?.data?.startDate)
          .toISOString()
          .split('T')[0];
        setStartDate(formattedStartDate);
      }

      if (project?.data?.endDate) {
        const formattedEndDate = parseISO(project?.data?.endDate)
          .toISOString()
          .split('T')[0];
        setEndDate(formattedEndDate);
      }
    }
  }, [project]);

  const handleSubmit = async () => {
    if (!projectTitle || !startDate || !endDate || !projectId) return;

    const formattedStartDate = formatISO(new Date(startDate));
    const formattedEndDate = formatISO(new Date(endDate));

    // Construct the payload
    const updatedProjectPayload: Partial<Project> = {
      title: projectTitle,
      description,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
    };

    try {
      const result: any = await updateProject({
        id: projectId,
        data: updatedProjectPayload,
      }).unwrap();

      console.log('Project updated successfully:', result);
      if (result.success) {
        // resetForm();
        onClose();
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const resetForm = () => {
    setProjectTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
  };

  const isFormValid = () => {
    return projectTitle && startDate && endDate;
  };

  const inputStyles =
    'w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Update Project'>
      {isProjectLoading ? (
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
            placeholder='Project Title'
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
          />
          <textarea
            className={inputStyles}
            placeholder='Description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2'>
            <input
              type='date'
              className={inputStyles}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <input
              type='date'
              className={inputStyles}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            type='submit'
            className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${
              !isFormValid() || isUpdateLoading
                ? 'cursor-not-allowed opacity-50'
                : ''
            }`}
            disabled={!isFormValid() || isUpdateLoading}
          >
            {isUpdateLoading ? 'Updating...' : 'Update Project'}
          </button>
        </form>
      )}
    </Modal>
  );
};

export default ModalUpdateProject;
