import { Priority } from '@/state/api';
import ReusablePriorityPage from '../reusablePrority';

const Urgent = () => {
  return <ReusablePriorityPage priority={Priority.Urgent} />;
};

export default Urgent;
