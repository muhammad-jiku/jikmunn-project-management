import ReusablePriority from '@/_components/priority/ReusablePriority';
import { Priority } from '@/state/types';

const Medium = () => {
  return <ReusablePriority priority={Priority.Medium} />;
};

export default Medium;
