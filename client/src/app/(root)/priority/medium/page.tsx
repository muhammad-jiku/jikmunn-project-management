import ReusablePriority from '@/components/priority';
import { Priority } from '@/state/types';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medium Priority - Project Management Dashboard',
  description: 'Generated by create next app',
};

export default function Medium() {
  return <ReusablePriority priority={Priority.Medium} />;
}
