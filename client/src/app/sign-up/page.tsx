import SignupForm from '@/_components/auth/signup/SignUpForm';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Sign Up - Project Management Dashboard',
  description: 'Generated by create next app',
};

const SignUp: React.FC = () => {
  return <SignupForm />;
};

export default SignUp;
