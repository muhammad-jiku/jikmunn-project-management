import SignInForm from '@/components/auth/signin';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Project Management Dashboard',
  description: 'Generated by create next app',
};

export default function Signin() {
  return <SignInForm />;
}
