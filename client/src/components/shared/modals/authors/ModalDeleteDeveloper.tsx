/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from '@/components/shared/modals/Modal';
import { useDeleteDeveloperMutation } from '@/state/api/developersApi';
import toast from 'react-hot-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  developerId: string;
};

const ModalDeleteDeveloper = ({ isOpen, onClose, developerId }: Props) => {
  const [deleteDeveloper, { isLoading: isDeleting }] =
    useDeleteDeveloperMutation();

  const handleDelete = async () => {
    if (!developerId) return;

    try {
      const result: any = await deleteDeveloper(developerId).unwrap();

      if (result.success) {
        // Close the modal if deletion was successful
        toast.success(
          result?.message || 'Developer data deleted successfully!'
        );
        onClose();
      } else {
        toast.error('Something went wrong, Please try again!');
      }
    } catch (error) {
      console.error('Failed to delete developer:', error); // debugging log
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Delete Developer'>
      <div className='mt-4 space-y-6'>
        <p className='text-center dark:text-white'>
          Are you sure you want to delete developer:
          <span className='font-bold ml-1'>{developerId}</span>?
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
    </Modal>
  );
};

export default ModalDeleteDeveloper;
