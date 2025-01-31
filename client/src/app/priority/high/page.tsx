import { Priority } from '@/state/api';
import ReusablePriorityPage from '../reusablePrority';

const High = () => {
  return <ReusablePriorityPage priority={Priority.High} />;
};

export default High;
