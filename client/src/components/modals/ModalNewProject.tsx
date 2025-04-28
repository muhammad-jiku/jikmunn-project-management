import { useCreateProjectMutation } from '@/state/api/projectsApi';
import { NewProject } from '@/state/types'; // Import the new type
import { useAppSelector } from '@/store';
import { formatISO } from 'date-fns';
import { useState } from 'react';
import Modal from './Modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const ModalNewProject = ({ isOpen, onClose }: Props) => {
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const globalUser = useAppSelector((state) => state?.global?.user?.data);
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const handleSubmit = async () => {
    if (!projectTitle || !startDate || !endDate) return;

    const formattedStartDate = formatISO(new Date(startDate), {
      representation: 'complete',
    });
    const formattedEndDate = formatISO(new Date(endDate), {
      representation: 'complete',
    });

    // Construct the payload without id, createdAt, updatedAt
    const newProjectPayload: NewProject = {
      title: projectTitle,
      description,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      projectOwnerId: globalUser?.userId as string,
    };

    console.log('Creating project with payload:', newProjectPayload);
    await createProject(newProjectPayload);
  };

  const isFormValid = () => {
    return projectTitle && description && startDate && endDate;
  };

  const inputStyles =
    'w-full rounded border border-gray-300 p-2 shadow-sm dark:border-dark-tertiary dark:bg-dark-tertiary dark:text-white dark:focus:outline-none';

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Create New Project'>
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
            !isFormValid() || isLoading ? 'cursor-not-allowed opacity-50' : ''
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewProject;
