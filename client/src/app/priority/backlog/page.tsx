import { Priority } from '@/state/api';
import ReusablePriorityPage from '../reusablePrority';

const Backlog = () => {
  return <ReusablePriorityPage priority={Priority.Backlog} />;
};

export default Backlog;
