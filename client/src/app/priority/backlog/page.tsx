import ReusablePriority from '@/_components/priority/ReusablePriority';
import { Priority } from '@/state/types';

const Backlog = () => {
  return <ReusablePriority priority={Priority.Backlog} />;
};

export default Backlog;
