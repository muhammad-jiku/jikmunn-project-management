import SignupForm from '@/components/auth/signup';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Project Management Dashboard',
  description: 'Generated by create next app',
};

export default function Signup() {
  return <SignupForm />;
}
