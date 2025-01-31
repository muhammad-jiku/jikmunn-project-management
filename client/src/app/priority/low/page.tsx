import ReusablePage from '@/_components/priority/ReusablePage';
import { Priority } from '@/state/api';

const Low = () => {
  return <ReusablePage priority={Priority.Low} />;
};

export default Low;
