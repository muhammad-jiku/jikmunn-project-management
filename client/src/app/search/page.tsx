/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import Header from '@/_components/Header';
import { debounce } from 'lodash';
import React, { useEffect, useState } from 'react';

type Props = {
  params: { id: string };
};

const Search = ({ params }: Props) => {
  const { id } = params;
  const [searchTerm, setSearchTerm] = useState('');
  const searchFilters = searchTerm.length >= 3 ? { searchTerm } : {};

  // const {
  //   data: projectResults,
  //   isLoading: isLoadingProjects,
  //   isError: isErrorProjects,
  // } = useGetProjectsQuery(searchFilters, { skip: searchTerm.length < 3 });

  // const {
  //   data: taskResults,
  //   isLoading: isLoadingTasks,
  //   isError: isErrorTasks,
  // } = useGetTasksQuery(
  //   { projectId: Number(id), ...searchFilters },
  //   { skip: searchTerm.length < 3 }
  // );

  // const {
  //   data: userResults,
  //   isLoading: isLoadingUsers,
  //   isError: isErrorUsers,
  // } = useGetUsersQuery(searchFilters, { skip: searchTerm.length < 3 });

  const handleSearch = debounce(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    500
  );

  useEffect(() => {
    return handleSearch.cancel;
  }, [handleSearch]);

  return (
    <div className='p-8'>
      <Header name='Search' />
      <div>
        <input
          type='text'
          placeholder='Search...'
          className='w-1/2 rounded border p-3 shadow'
          onChange={handleSearch}
        />
      </div>
      <div className='p-5'>
        {/* {(isLoadingProjects || isLoadingTasks || isLoadingUsers) && (
          <p>Loading...</p>
        )}
        {(isErrorProjects || isErrorTasks || isErrorUsers) && (
          <p>Error occurred while fetching search results.</p>
        )} */}

        {/* {projectResults?.data?.length ? (
          <div>
            <h2>Projects</h2>
            {projectResults.data.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}

        {taskResults?.data?.length ? (
          <div>
            <h2>Tasks</h2>
            {taskResults.data.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : null}

        {userResults?.data?.length ? (
          <div>
            <h2>Users</h2>
            {userResults.data.map((user) => (
              <UserCard key={user.userId} user={user} />
            ))}
          </div>
        ) : null} */}
      </div>
    </div>
  );
};

export default Search;
