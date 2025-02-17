import ReusablePage from '@/_components/priority/ReusablePage';
import { Priority } from '@/state/types';

const Urgent = () => {
  return <ReusablePage priority={Priority.Urgent} />;
};

export default Urgent;
