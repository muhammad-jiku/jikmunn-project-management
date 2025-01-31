import ReusablePage from '@/_components/priority/ReusablePage';
import { Priority } from '@/state/api';

const Medium = () => {
  return <ReusablePage priority={Priority.Urgent} />;
};

export default Medium;
