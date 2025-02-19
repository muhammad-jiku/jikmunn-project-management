import ReusablePriority from '@/_components/priority/ReusablePriority';
import { Priority } from '@/state/types';

const Urgent = () => {
  return <ReusablePriority priority={Priority.Urgent} />;
};

export default Urgent;
