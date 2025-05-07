/* eslint-disable @typescript-eslint/no-explicit-any */
import Modal from '@/components/shared/modals/Modal';
import { useDeleteSuperAdminMutation } from '@/state/api/superAdminsApi';
import toast from 'react-hot-toast';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  superAdminId: string;
};

const ModalDeleteSuperAdmin = ({ isOpen, onClose, superAdminId }: Props) => {
  const [deleteSuperAdmin, { isLoading: isDeleting }] =
    useDeleteSuperAdminMutation();

  const handleDelete = async () => {
    if (!superAdminId) return;

    try {
      const result: any = await deleteSuperAdmin(superAdminId).unwrap();
      console.log('Super admin deleted successfully:', result);
      if (result.success) {
        // Close the modal if deletion was successful
        toast.success(
          result?.message || 'Super admin data deleted successfully!'
        );
        onClose();
      } else {
        toast.error('Something went wrong, Please try again!');
      }
    } catch (error) {
      console.error('Failed to delete Super Admin:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name='Delete Super Admin'>
      <div className='mt-4 space-y-6'>
        <p className='text-center dark:text-white'>
          Are you sure you want to delete super admin:
          <span className='font-bold ml-1'>{superAdminId}</span>?
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

export default ModalDeleteSuperAdmin;
