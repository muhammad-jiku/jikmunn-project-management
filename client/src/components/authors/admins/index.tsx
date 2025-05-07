'use client';

import Header from '@/components/shared/Header';
import ModalDeleteAdmin from '@/components/shared/modals/authors/ModalDeleteAdmin';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetAdminsQuery } from '@/state/api/adminsApi';
import { Admin } from '@/state/types';
import { useAppSelector } from '@/store';
import { CircularProgress } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

const CustomToolbar = () => (
  <GridToolbarContainer className='toolbar flex gap-2'>
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const AdminsComp = () => {
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);
  const globalUser = useAppSelector((state) => state?.global?.user?.data);

  // Check user roles
  const isAdmin = globalUser?.data?.admin !== null;
  const isSuperAdmin = globalUser?.data?.superAdmin !== null;
  const hasActionPermission = isAdmin || isSuperAdmin;

  const { data: admins, isLoading, isError } = useGetAdminsQuery({});
  console.log('admins page data', admins);

  // State for modals
  const [selectedAdminId, setSelectedAdminId] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const handleDelete = (userId: string) => {
    setSelectedAdminId(userId);
    setIsDeleteModalOpen(true);
  };

  const getColumns = (): GridColDef[] => {
    const baseColumns: GridColDef[] = [
      {
        field: 'adminId',
        headerName: 'User ID',
        width: 100,
      },
      {
        field: 'profileImage',
        headerName: 'Image',
        width: 100,
        renderCell: (params) => (
          <Image
            src={params.value}
            alt={params.value}
            height={12}
            width={12}
            className='h-12 w-12 rounded-full border-2 border-blue-500'
          />
        ),
      },
      { field: 'name', headerName: 'Name', width: 200 },
      {
        field: 'contact',
        headerName: 'Contact No.',
        width: 200,
      },
    ];

    // Only add actions column if user is a super admin
    if (hasActionPermission && isSuperAdmin) {
      baseColumns.push({
        field: 'actions',
        headerName: 'Actions',
        width: 200,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <div className='my-3 flex gap-3 items-center'>
            {/* Only show delete button for super admins */}
            {isSuperAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(params.row.id);
                }}
                className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700'
                title='Delete'
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ),
      });
    }

    return baseColumns;
  };

  // Transform the data to rows
  const rows = admins?.data?.map((admin: Admin) => {
    console.log('admin', admin);

    return {
      ...admin,
      //   adminId: admin ? admin?.adminId : 'N/A',
      profileImage: admin ? `${admin?.profileImage?.url}` : 'N/A',
      name: admin
        ? `${admin?.firstName}  ${admin?.middleName}  ${admin?.lastName}`
        : 'N/A',
    };
  });

  if (isLoading)
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <CircularProgress />
      </div>
    );

  return (
    <div className='flex w-full flex-col p-6'>
      <div className='flex items-center justify-between'>
        <Header name='Admins' />
      </div>

      {/* Delete Admin Modal */}
      <ModalDeleteAdmin
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        adminId={selectedAdminId}
      />

      {isError || !admins ? (
        <div className='flex items-center justify-center h-[600px] text-center text-black dark:text-white'>
          No admin added yet!{' '}
        </div>
      ) : (
        <div style={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={rows}
            // columns={columns}
            columns={getColumns()}
            pagination
            slots={{
              toolbar: CustomToolbar,
            }}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
          />
        </div>
      )}
    </div>
  );
};

export default AdminsComp;
