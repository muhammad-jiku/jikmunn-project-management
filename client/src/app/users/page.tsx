'use client';

import Header from '@/_components/Header';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetUsersQuery } from '@/state/api';
import { useAppSelector } from '@/store';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import Image from 'next/image';

const CustomToolbar = () => (
  <GridToolbarContainer className='toolbar flex gap-2'>
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: 'userId', headerName: 'ID', width: 100 },
  { field: 'username', headerName: 'Username', width: 150 },
  {
    field: 'profilePictureUrl',
    headerName: 'Profile Picture',
    width: 100,
    renderCell: (params) => (
      <div className='flex h-full w-full items-center justify-center'>
        <div className='h-9 w-9'>
          <Image
            src={`../../../public/p11.jpeg`}
            alt={params.row.username}
            width={100}
            height={50}
            className='h-full rounded-full object-cover'
          />
        </div>
      </div>
    ),
  },
];

const Users = () => {
  const { data, isLoading, isError } = useGetUsersQuery({});
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) return <div>Loading...</div>;
  if (isError || !data) return <div>Error fetching users</div>;

  return (
    <div className='flex w-full flex-col p-8'>
      <Header name='Users' />
      <div style={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={data?.data || []}
          columns={columns}
          getRowId={(row) => row.userId}
          pagination
          slots={{
            toolbar: CustomToolbar,
          }}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </div>
    </div>
  );
};

export default Users;
