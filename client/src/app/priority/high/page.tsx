import ReusablePriority from '@/_components/priority/ReusablePriority';
import { Priority } from '@/state/types';

const High = () => {
  return <ReusablePriority priority={Priority.High} />;
};

export default High;
