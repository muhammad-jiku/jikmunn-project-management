import ReusablePriority from '@/_components/priority/ReusablePriority';
import { Priority } from '@/state/types';

const Low = () => {
  return <ReusablePriority priority={Priority.Low} />;
};

export default Low;
