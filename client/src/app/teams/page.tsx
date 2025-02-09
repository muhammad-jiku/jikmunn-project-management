'use client';

import Header from '@/_components/Header';
// import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
// import { useGetTeamsQuery } from '@/state/api';
// import { useAppSelector } from '@/store';
// import {
//   DataGrid,
//   GridColDef,
//   GridToolbarContainer,
//   GridToolbarExport,
//   GridToolbarFilterButton,
// } from '@mui/x-data-grid';

// const CustomToolbar = () => (
//   <GridToolbarContainer className='toolbar flex gap-2'>
//     <GridToolbarFilterButton />
//     <GridToolbarExport />
//   </GridToolbarContainer>
// );

// const columns: GridColDef[] = [
//   { field: 'id', headerName: 'Team ID', width: 100 },
//   { field: 'teamName', headerName: 'Team Name', width: 200 },
//   { field: 'productOwnerUsername', headerName: 'Product Owner', width: 200 },
//   {
//     field: 'projectManagerUsername',
//     headerName: 'Project Manager',
//     width: 200,
//   },
// ];

const Teams = () => {
  // const { data, isLoading, isError } = useGetTeamsQuery({});
  // console.log('teams page data', data);
  // const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // if (isLoading) return <div>Loading...</div>;
  // if (isError || !data) return <div>Error fetching teams</div>;

  return (
    <div className='flex w-full flex-col p-8'>
      <Header name='Teams' />
      <div style={{ height: 650, width: '100%' }}>
        {/* <DataGrid
          rows={data?.data || []}
          columns={columns}
          pagination
          slots={{
            toolbar: CustomToolbar,
          }}
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        /> */}
      </div>
    </div>
  );
};

export default Teams;
