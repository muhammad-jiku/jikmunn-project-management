/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Header from '@/components/shared/Header';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetTeamsQuery } from '@/state/api/teamsApi';
import { useAppSelector } from '@/store';
import { CircularProgress } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { Edit, PlusSquare, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import ModalDeleteTeam from '../shared/modals/teams/ModalDeleteTeam';
import ModalNewTeam from '../shared/modals/teams/ModalNewTeam';
import ModalUpdateTeam from '../shared/modals/teams/ModalUpdateTeam';

const CustomToolbar = () => (
  <GridToolbarContainer className='toolbar flex gap-2'>
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

// const columns: GridColDef[] = [
//   { field: 'id', headerName: 'Team ID', width: 100 },
//   { field: 'name', headerName: 'Team Name', width: 200 },
//   { field: 'projectOwnerFullName', headerName: 'Project Owner', width: 200 },
// ];

const TeamsComp = () => {
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);
  const globalUser = useAppSelector((state) => state?.global?.user?.data);

  // Check user roles
  const isManager = globalUser?.data?.manager !== undefined;
  const isDeveloper = globalUser?.data?.developer !== undefined;
  const hasActionPermission = isManager || isDeveloper;

  const { data: teams, isLoading, isError } = useGetTeamsQuery({});
  console.log('teams page data', teams);

  // State for modals
  const [isModalNewTeamOpen, setIsModalNewTeamOpen] = useState<boolean>(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const handleEdit = (teamId: number) => {
    setSelectedTeamId(teamId);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (teamId: number) => {
    setSelectedTeamId(teamId);
    setIsDeleteModalOpen(true);
  };

  const getColumns = (): GridColDef[] => {
    const baseColumns: GridColDef[] = [
      {
        field: 'id',
        headerName: 'Team ID',
        width: 100,
        renderCell: (params) => (
          <Link
            href={`/teams/${params.value}`}
            className='hover:text-blue-500 hover:underline'
          >
            {params.value}
          </Link>
        ),
      },
      { field: 'name', headerName: 'Team Name', width: 200 },
      {
        field: 'projectOwnerFullName',
        headerName: 'Project Owner',
        width: 200,
      },
    ];

    // Only add actions column if user is a developer or manager
    if (hasActionPermission) {
      baseColumns.push({
        field: 'actions',
        headerName: 'Actions',
        width: 200,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <div className='my-3 flex gap-3 items-center'>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(params.row.id);
              }}
              className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700'
              title='Edit'
            >
              <Edit size={18} />
            </button>
            {/* Only show delete button for managers */}
            {isManager && (
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

  if (isLoading)
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <CircularProgress />
      </div>
    );

  return (
    <div className='flex w-full flex-col p-6'>
      <div className='flex items-center justify-between'>
        <Header name='Teams' />
        <div className='flex w-full items-center justify-end'>
          <ModalNewTeam
            isOpen={isModalNewTeamOpen}
            onClose={() => setIsModalNewTeamOpen(false)}
          />
          {isManager && (
            <button
              className='mb-4 flex justify-center items-center rounded-md bg-blue-primary p-3 text-white hover:bg-blue-600'
              onClick={() => setIsModalNewTeamOpen(true)}
            >
              <PlusSquare className='mr-2 h-5 w-5' /> Add Team
            </button>
          )}
        </div>
      </div>

      {/* Update Team Modal */}
      <ModalUpdateTeam
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        teamId={selectedTeamId}
      />

      {/* Delete Project Modal */}
      <ModalDeleteTeam
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        teamId={selectedTeamId}
      />

      {isError || !teams ? (
        <div className='flex items-center justify-center h-[600px] text-center text-black dark:text-white'>
          No team information added yet!{' '}
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

export default TeamsComp;
