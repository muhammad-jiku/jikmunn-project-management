import { Priority } from '@/state/api';
import ReusablePriorityPage from '../reusablePrority';

const Low = () => {
  return <ReusablePriorityPage priority={Priority.Low} />;
};

export default Low;
