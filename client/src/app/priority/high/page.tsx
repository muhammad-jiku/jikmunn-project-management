import ReusablePage from '@/_components/priority/ReusablePage';
import { Priority } from '@/state/types';

const High = () => {
  return <ReusablePage priority={Priority.High} />;
};

export default High;
