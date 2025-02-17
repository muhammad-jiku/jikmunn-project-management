import ReusablePage from '@/_components/priority/ReusablePage';
import { Priority } from '@/state/types';

const Backlog = () => {
  return <ReusablePage priority={Priority.Backlog} />;
};

export default Backlog;
