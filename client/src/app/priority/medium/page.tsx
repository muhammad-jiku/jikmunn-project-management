import { Priority } from '@/state/api';
import ReusablePriorityPage from '../reusablePrority';

const Medium = () => {
  return <ReusablePriorityPage priority={Priority.Urgent} />;
};

export default Medium;
