/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Header from '@/components/shared/Header';
import ModalDeleteProject from '@/components/shared/modals/projects/ModalDeleteProject';
import ModalNewProject from '@/components/shared/modals/projects/ModalNewProject';
import ModalUpdateProject from '@/components/shared/modals/projects/ModalUpdateProject';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetProjectsQuery } from '@/state/api/projectsApi';
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
  const globalUser = useAppSelector((state) => state?.global?.user?.data);

  // Check user roles
  const isManager = globalUser?.data?.manager !== undefined;
  const isDeveloper = globalUser?.data?.developer !== undefined;
  const hasActionPermission = isManager || isDeveloper;

  const {
    data: projects,
    isLoading,
    isError: isProjectsError,
  } = useGetProjectsQuery({});

  // State for modals
  const [isModalNewProjectOpen, setIsModalNewProjectOpen] =
    useState<boolean>(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  );
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const handleEdit = (projectId: number) => {
    setSelectedProjectId(projectId);
    setIsUpdateModalOpen(true);
  };

  const handleDelete = (projectId: number) => {
    setSelectedProjectId(projectId);
    setIsDeleteModalOpen(true);
  };

  const getColumns = (): GridColDef[] => {
    const baseColumns: GridColDef[] = [
      {
        field: 'id',
        headerName: 'Project ID',
        width: 100,
        renderCell: (params) => (
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

  return (
    <div className='flex w-full flex-col p-6'>
      <div className='flex items-center justify-between'>
        <Header name='Projects' />
        <div className='flex w-full items-center justify-end'>
          <ModalNewProject
            isOpen={isModalNewProjectOpen}
            onClose={() => setIsModalNewProjectOpen(false)}
          />
          {isManager && (
            <button
              className='mb-4 flex justify-center items-center rounded-md bg-blue-primary p-3 text-white hover:bg-blue-600'
              onClick={() => setIsModalNewProjectOpen(true)}
            >
              <PlusSquare className='mr-2 h-5 w-5' /> Add Project
            </button>
          )}
        </div>
      </div>

      {/* Update Project Modal */}
      <ModalUpdateProject
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        projectId={selectedProjectId}
      />

      {/* Delete Project Modal */}
      <ModalDeleteProject
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        projectId={selectedProjectId}
      />

      {isProjectsError || !projects ? (
        <div className='flex items-center justify-center h-[600px] text-center text-black dark:text-white'>
          No project information added yet!{' '}
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

export default ProjectsComp;
