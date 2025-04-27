/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Header from '@/components/Header';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetTeamsQuery } from '@/state/api/teamsApi';
import { useAppSelector } from '@/store';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';

const CustomToolbar = () => (
  <GridToolbarContainer className='toolbar flex gap-2'>
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: 'id', headerName: 'Team ID', width: 100 },
  { field: 'name', headerName: 'Team Name', width: 200 },
  { field: 'projectOwnerFullName', headerName: 'Project Owner', width: 200 },
];

const TeamsComp = () => {
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const { data: teams, isLoading, isError } = useGetTeamsQuery({});
  console.log('teams page data', teams);

  // Transform the data to include a flat projectOwnerFullName property
  const rows = teams?.data.map((team: any) => {
    const ownerManager = team.owner?.manager;
    return {
      ...team,
      projectOwnerFullName: ownerManager
        ? `${ownerManager.firstName} ${ownerManager.middleName ? ownerManager.middleName + ' ' : ''}${ownerManager.lastName}`
        : 'N/A',
    };
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError || !teams) return <div>Error fetching teams</div>;

  return (
    <div className='flex w-full flex-col p-8'>
      <Header name='Teams' />
      {teams.data.length === 0 ? (
        <div className='flex h-[650px] w-full items-center justify-center'>
          <p className='text-xl sm:text-2xl md:text-3xl font-semibold text-gray-600 dark:text-gray-300'>
            No team created yet!
          </p>
        </div>
      ) : (
        <div style={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
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

export default TeamsComp;
