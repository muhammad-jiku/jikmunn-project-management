/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from '@/components/shared/modals/Modal';
import { useDeleteAdminMutation } from '@/state/api/adminsApi';
import toast from 'react-hot-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  adminId: string;
};

const ModalDeleteAdmin = ({ isOpen, onClose, adminId }: Props) => {
  const [deleteAdmin, { isLoading: isDeleting }] = useDeleteAdminMutation();

  const handleDelete = async () => {
    if (!adminId) return;

    try {
      const result: any = await deleteAdmin(adminId).unwrap();

      if (result.success) {
        // Close the modal if deletion was successful
        toast.success(result?.message || 'Admin data deleted successfully!');
        onClose();
      } else {
        toast.error('Something went wrong, Please try again!');
      }
    } catch (error) {
      console.error('Failed to delete Admin:', error); // debugging log
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Delete Admin'>
      <div className='mt-4 space-y-6'>
        <p className='text-center dark:text-white'>
          Are you sure you want to delete admin:
          <span className='font-bold ml-1'>{adminId}</span>?
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

export default ModalDeleteAdmin;
