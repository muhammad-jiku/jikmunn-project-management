/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import ModalNewProject from '@/components/modals/ModalNewProject';
import Header from '@/components/shared/Header';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetProjectsQuery } from '@/state/api/projectsApi';
// import { Project } from '@/state/types';
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

const CustomToolbar = () => (
  <GridToolbarContainer className='toolbar flex gap-2'>
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const ProjectsComp = () => {
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);
  const { data: projects, isLoading, isError } = useGetProjectsQuery({});
  console.log('projects data', projects);

  const [isModalNewProjectOpen, setIsModalNewProjectOpen] = useState(false);

  const handleEdit = (projectId: string) => {
    console.log('Edit project:', projectId);
    // Implement edit functionality here
    // Could open a modal similar to ModalNewProject but pre-filled with project data
  };

  const handleDelete = (projectId: string) => {
    console.log('delete project:', projectId);
    // Implement delete functionality here
    // Could show a confirmation dialog before deletion
  };

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'Project ID',
      width: 100,
      renderCell: (params) => (
        // Wrap the id in a Link so that clicking it navigates to the project details page.
        <Link
          href={`/projects/${params.value}`}
          className='hover:text-blue-500 hover:underline'
        >
          {params.value}
        </Link>
      ),
    },
    { field: 'title', headerName: 'Title', width: 200 },
    { field: 'startDate', headerName: 'Start Date', width: 200 },
    { field: 'endDate', headerName: 'End Date', width: 200 },
    { field: 'projectOwnerFullName', headerName: 'Project Owner', width: 200 },
    {
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
        </div>
      ),
    },
  ];

  // Transform the data to include a flat projectOwnerFullName property
  // const rows = projects?.data.map((project: Project) => {
  const rows = projects?.data.map((project: any) => {
    const ownerManager = project.owner?.manager;

    return {
      ...project,
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
  // if (isError || !projects)
  //   return (
  //     <div className='flex items-center justify-center h-full text-center text-black dark:text-white'>
  //       No project information added yet!
  //     </div>
  //   );

  return (
    <div className='flex w-full flex-col p-6'>
      <div className='flex items-center justify-between'>
        <Header name='Projects' />
        {/* <div className='flex flex-col lg:flex-row h-[650px] w-full items-center justify-center'> */}
        <div className='flex w-full items-center justify-end'>
          <ModalNewProject
            isOpen={isModalNewProjectOpen}
            onClose={() => setIsModalNewProjectOpen(false)}
          />
          <button
            className='mb-4 flex justify-center items-center rounded-md bg-blue-primary p-3 text-white hover:bg-blue-600'
            onClick={() => setIsModalNewProjectOpen(true)}
          >
            <PlusSquare className='mr-2 h-5 w-5' /> Add Project
          </button>
        </div>
      </div>
      {isError || !projects ? (
        <div className='flex items-center justify-center h-full text-center text-black dark:text-white'>
          No project information added yet!{' '}
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

export default ProjectsComp;
