import { Task, useGetTasksQuery } from '@/state/api';
import Header from '../Header';
import TaskCard from '../tasks/TaskCard';

type Props = {
  id: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

const ListView = ({ id, setIsModalNewTaskOpen }: Props) => {
  const { data, error, isLoading } = useGetTasksQuery({
    projectId: Number(id),
  });
  // console.log('list view param id', id);
  // console.log('list view modal check', setIsModalNewTaskOpen);
  // console.log('list view tasks data', data);

  if (isLoading) return <div>Loading...</div>;
  if (error || !data) return <div>An error occurred while fetching tasks</div>;

  return (
    <div className='px-4 pb-8 xl:px-6'>
      <div className='pt-5'>
        <Header
          name='List'
          buttonComponent={
            <button
              className='flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600'
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              Add Task
            </button>
          }
          isSmallText
        />
      </div>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6'>
        {data?.data?.map((task: Task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default ListView;
