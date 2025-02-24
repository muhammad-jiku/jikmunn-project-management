import UsersComp from '@/_components/users/UsersComp';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users - Project Management Dashboard',
  description: 'Generated by create next app',
};

const Users = () => {
  return <UsersComp />;
};

export default Users;
