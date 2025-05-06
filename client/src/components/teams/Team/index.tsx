/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Header from '@/components/shared/Header';
import ModalDeleteMember from '@/components/shared/modals/teams/members/ModalDeleteMember';
import ModalNewMember from '@/components/shared/modals/teams/members/ModalNewMember';
import ModalUpdateMember from '@/components/shared/modals/teams/members/ModalUpdateMember';
import ModalDeleteProjectTeam from '@/components/shared/modals/teams/projects/ModalDeleteProjectTeam';
import ModalNewProjectTeam from '@/components/shared/modals/teams/projects/ModalNewProjectTeam';
import ModalUpdateProjectTeam from '@/components/shared/modals/teams/projects/ModalUpdateProjectTeam';
import { dataGridClassNames, dataGridSxStyles } from '@/lib/utils';
import { useGetProjectTeamsByTeamQuery } from '@/state/api/projectTeamsApi';
import { useGetTeamMembersByTeamQuery } from '@/state/api/teamMembersApi';
import { useGetTeamQuery } from '@/state/api/teamsApi';
import { useAppSelector } from '@/store';
import { Box, CircularProgress, Tab, Tabs } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { Edit, PlusSquare, Trash2 } from 'lucide-react';
import { use, useState } from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

type Params = {
  id: string;
};

type Props = {
  // params might be a Promise or an object
  params: Promise<Params> | Params;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className='py-4'
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const CustomToolbar = () => (
  <GridToolbarContainer className='toolbar flex gap-2'>
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const TeamComp = ({ params }: Props) => {
  // If params is a Promise, unwrap it using the experimental use() hook.
  const resolvedParams: Params =
    typeof (params as Promise<Params>).then === 'function'
      ? use(params as Promise<Params>)
      : (params as Params);

  const { id } = resolvedParams;
  const teamId = Number(id);
  const isDarkMode = useAppSelector((state) => state?.global?.isDarkMode);
  const globalUser = useAppSelector((state) => state?.global?.user?.data);
  const [tabValue, setTabValue] = useState<number>(0);

  // Check user roles
  const isManager = globalUser?.data?.manager !== undefined;
  const isDeveloper = globalUser?.data?.developer !== undefined;

  const hasActionPermission = isManager || isDeveloper;

  // Modal states
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] =
    useState<boolean>(false);
  const [isUpdateMemberModalOpen, setIsUpdateMemberModalOpen] =
    useState<boolean>(false);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] =
    useState<boolean>(false);
  const [isNewProjectTeamModalOpen, setIsNewProjectTeamModalOpen] =
    useState<boolean>(false);
  const [isUpdateProjectTeamModalOpen, setIsUpdateProjectTeamModalOpen] =
    useState<boolean>(false);
  const [isDeleteProjectTeamModalOpen, setIsDeleteProjectTeamModalOpen] =
    useState<boolean>(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [selectedProjectTeamId, setSelectedProjectTeamId] = useState<
    number | null
  >(null);

  // Fetch team details
  const { data: team, isLoading: teamLoading } = useGetTeamQuery(teamId);

  console.log('team data displaying', team);

  // Fetch team members
  const { data: teamMembers, isLoading: membersLoading } =
    useGetTeamMembersByTeamQuery({ teamId });

  console.log('team members data displaying', teamMembers);

  // Fetch project teams
  const { data: projectTeams, isLoading: projectTeamsLoading } =
    useGetProjectTeamsByTeamQuery({ teamId });

  console.log('project teams data displaying', projectTeams);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Column definitions for team members
  const getMemberColumns = (): GridColDef[] => {
    const baseColumns: GridColDef[] = [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
      },
      {
        field: 'username',
        headerName: 'Username',
        width: 200,
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 200,
      },
      {
        field: 'role',
        headerName: 'Role',
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
                setSelectedMemberId(params.row.id);
                setIsUpdateMemberModalOpen(true);
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
                  setSelectedMemberId(params.row.id);
                  setIsDeleteMemberModalOpen(true);
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

  // Transform the data to member rows
  const memberRows = teamMembers?.data.map((member: any) => {
    const user = member?.user;

    return {
      ...member,
      username: user
        ? `${user.username}`
        : // ? `${ownerManager.firstName} ${ownerManager.middleName ? ownerManager.middleName + ' ' : ''}${ownerManager.lastName}`
          'N/A',
      email: user ? `${user.email}` : 'N/A',
      role: user ? `${user.role}` : 'N/A',
    };
  });

  // Column definitions for project teams
  const getProjectTeamColumns = (): GridColDef[] => {
    const baseColumns: GridColDef[] = [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
      },
      {
        field: 'projectName',
        headerName: 'Project Name',
        width: 200,
      },
      {
        field: 'projectId',
        headerName: 'Project ID',
        width: 200,
      },
      {
        field: 'projectOwnerId',
        headerName: 'Owner ID',
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
                setSelectedProjectTeamId(params.row.id);
                setIsUpdateProjectTeamModalOpen(true);
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
                  setSelectedProjectTeamId(params.row.id);
                  setIsDeleteProjectTeamModalOpen(true);
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

  // Transform the data to project team rows
  const projectTeamRows = projectTeams?.data.map((projectTeam: any) => {
    const project = projectTeam?.project;
    console.log('project team=', projectTeam);
    console.log('project===', project);

    return {
      ...projectTeam,
      projectName: project
        ? `${project.title}`
        : // ? `${ownerManager.firstName} ${ownerManager.middleName ? ownerManager.middleName + ' ' : ''}${ownerManager.lastName}`
          'N/A',
      projectId: project ? `${projectTeam.projectId}` : 'N/A',
      projectOwnerId: project ? `${project.projectOwnerId}` : 'N/A',
    };
  });

  if (teamLoading || membersLoading || projectTeamsLoading) {
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <CircularProgress />
      </div>
    );
  }

  if (!team) {
    return (
      <div className='flex items-center justify-center h-full text-center text-black dark:text-white'>
        Team not found!
      </div>
    );
  }

  // Custom tab styling
  const tabStyles = {
    color: isDarkMode ? '#94a3b8' : '#64748b', // Default text color (slate-400 for dark, slate-500 for light)
    '&.Mui-selected': {
      color: isDarkMode ? '#3b82f6' : '#2563eb', // Selected tab text color (blue-500 for dark, blue-600 for light)
      fontWeight: 'bold',
    },
    '&:hover': {
      color: isDarkMode ? '#60a5fa' : '#3b82f6', // Hover text color (blue-400 for dark, blue-500 for light)
    },
  };

  return (
    <div className='flex w-full flex-col p-8'>
      <Header name={`Team: ${team?.data?.name}`} />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label='team tabs'
          textColor='primary'
          indicatorColor='primary'
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: isDarkMode ? '#3b82f6' : '#2563eb', // Custom indicator color (blue-500 for dark, blue-600 for light)
            },
          }}
        >
          <Tab
            label='Team Members'
            id='tab-0'
            aria-controls='tabpanel-0'
            sx={tabStyles}
          />
          <Tab
            label='Project Teams'
            id='tab-1'
            aria-controls='tabpanel-1'
            sx={tabStyles}
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <div className='flex justify-end mb-4'>
          <button
            className='mb-4 flex justify-center items-center rounded-md bg-blue-primary p-3 text-white hover:bg-blue-600'
            onClick={() => setIsNewMemberModalOpen(true)}
          >
            <PlusSquare className='mr-2 h-5 w-5' /> Add Member
          </button>
        </div>

        {teamMembers?.data && teamMembers?.data?.length > 0 ? (
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              // rows={teamMembers?.data}
              // columns={memberColumns}
              rows={memberRows}
              columns={getMemberColumns()}
              pagination
              slots={{
                toolbar: CustomToolbar,
              }}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        ) : (
          <div className='flex h-[400px] w-full items-center justify-center'>
            <p className='text-xl font-semibold text-gray-600 dark:text-gray-300'>
              No team members added yet!
            </p>
          </div>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <div className='flex justify-end mb-4'>
          <button
            className='mb-4 flex justify-center items-center rounded-md bg-blue-primary p-3 text-white hover:bg-blue-600'
            onClick={() => setIsNewProjectTeamModalOpen(true)}
          >
            <PlusSquare className='mr-2 h-5 w-5' /> Add Project
          </button>
        </div>

        {projectTeams?.data && projectTeams?.data?.length > 0 ? (
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              // rows={projectTeams?.data}
              // columns={projectTeamColumns}
              rows={projectTeamRows}
              columns={getProjectTeamColumns()}
              pagination
              slots={{
                toolbar: CustomToolbar,
              }}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        ) : (
          <div className='flex h-[400px] w-full items-center justify-center'>
            <p className='text-xl font-semibold text-gray-600 dark:text-gray-300'>
              No project teams added yet!
            </p>
          </div>
        )}
      </TabPanel>

      {/* Modals for Team Members */}
      <ModalNewMember
        isOpen={isNewMemberModalOpen}
        onClose={() => setIsNewMemberModalOpen(false)}
        id={teamId}
      />

      {selectedMemberId && (
        <>
          <ModalUpdateMember
            isOpen={isUpdateMemberModalOpen}
            onClose={() => setIsUpdateMemberModalOpen(false)}
            id={selectedMemberId}
          />

          <ModalDeleteMember
            isOpen={isDeleteMemberModalOpen}
            onClose={() => setIsDeleteMemberModalOpen(false)}
            id={selectedMemberId}
          />
        </>
      )}

      {/* Modals for Project Teams */}
      <ModalNewProjectTeam
        isOpen={isNewProjectTeamModalOpen}
        onClose={() => setIsNewProjectTeamModalOpen(false)}
        id={teamId}
      />

      {selectedProjectTeamId && (
        <>
          <ModalUpdateProjectTeam
            isOpen={isUpdateProjectTeamModalOpen}
            onClose={() => setIsUpdateProjectTeamModalOpen(false)}
            id={selectedProjectTeamId}
          />

          <ModalDeleteProjectTeam
            isOpen={isDeleteProjectTeamModalOpen}
            onClose={() => setIsDeleteProjectTeamModalOpen(false)}
            id={selectedProjectTeamId}
          />
        </>
      )}
    </div>
  );
};

export default TeamComp;
