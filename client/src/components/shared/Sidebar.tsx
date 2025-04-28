'use client';

import { logoutUser, setIsSidebarCollapsed } from '@/state';
import { useLogoutMutation } from '@/state/api/authApi';
import { persistor, RootState, useAppDispatch, useAppSelector } from '@/store';
import { Avatar } from '@mui/material';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  FolderCog,
  Home,
  Layers3,
  LockIcon,
  LucideIcon,
  Search,
  ShieldAlert,
  User,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import logo from '../../../public/images/logo.png';
import profileDefault from '../../../public/images/p7.jpeg';

const Sidebar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state?.global?.isSidebarCollapsed
  );
  const globalUser = useAppSelector(
    (state: RootState) => state?.global?.user?.data
  );

  const [showPriority, setShowPriority] = useState<boolean>(true);
  const [avatar, setAvatar] = useState<string | undefined>('');

  useEffect(() => {
    let imageUrl;

    if (globalUser?.data) {
      const profileImages = [
        globalUser?.data?.developer?.profileImage,
        globalUser?.data?.manager?.profileImage,
        globalUser?.data?.admin?.profileImage,
        globalUser?.data?.superAdmin?.profileImage,
      ];

      for (const img of profileImages) {
        if (img && typeof img === 'object' && img.url) {
          imageUrl = img.url;
          break;
        }
      }
    }

    setAvatar(imageUrl || profileDefault.src);
  }, [globalUser]);

  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();

  const handleSignOut = async () => {
    try {
      // Call backend logout to clear cookies
      await logout().unwrap();
      // Clear Redux state
      dispatch(logoutUser());
      // Purge persisted data from storage
      await persistor.purge();
      // Navigate to sign in page (or any appropriate route)
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl
    transition-all duration-300 h-full z-40 dark:bg-black overflow-y-auto bg-white
    ${isSidebarCollapsed ? 'w-0 hidden' : 'w-96'}
  `;

  return (
    <div className={sidebarClassNames}>
      <div className='flex h-[100%] w-full flex-col justify-start'>
        {/* TOP LOGO */}
        <div className='z-50 flex min-h-[56px] w-96 items-center justify-between bg-white px-6 pt-3 dark:bg-black'>
          <div className='text-sm lg:text-xl font-bold text-gray-800 dark:text-white'>
            Project Management
          </div>
          {isSidebarCollapsed ? null : (
            <button
              className='py-3'
              onClick={() => {
                dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
              }}
              aria-label='Close sidebar'
              title='Close sidebar' // Tooltip for all users
            >
              <X className='h-6 w-6 text-gray-800 hover:text-gray-500 dark:text-white' />
            </button>
          )}
        </div>
        {/* TEAM */}
        <div className='flex items-center gap-5 border-y-[1.5px] border-gray-200 px-8 py-4 dark:border-gray-700'>
          <Image src={logo} alt='Logo' width={100} height={100} />
          <div>
            <h3 className='text-md font-bold tracking-wide dark:text-gray-200'>
              jikmunn TEAM
            </h3>
            <div className='mt-1 flex items-start gap-2'>
              <LockIcon className='mt-[0.1rem] h-3 w-3 text-gray-500 dark:text-gray-400' />
              <p className='text-xs text-gray-500'>Private</p>
            </div>
          </div>
        </div>
        {/* NAVBAR LINKS */}
        <nav className='z-10 w-full'>
          <SidebarLink icon={Home} label='Home' href='/' />
          <SidebarLink icon={Briefcase} label='Timeline' href='/timeline' />
          <SidebarLink icon={Search} label='Search' href='/search' />
          <SidebarLink icon={FolderCog} label='Projects' href='/projects' />
          <SidebarLink icon={User} label='Users' href='/users' />
          <SidebarLink icon={Users} label='Teams' href='/teams' />
        </nav>

        {/* PRIORITIES LINKS */}
        <button
          onClick={() => setShowPriority((prev) => !prev)}
          className='flex w-full items-center justify-between px-8 py-3 text-gray-500'
        >
          <span className=''>Priority</span>
          {showPriority ? (
            <ChevronUp className='h-5 w-5' />
          ) : (
            <ChevronDown className='h-5 w-5' />
          )}
        </button>
        {showPriority && (
          <>
            <SidebarLink
              icon={AlertCircle}
              label='Urgent'
              href='/priority/urgent'
            />
            <SidebarLink
              icon={ShieldAlert}
              label='High'
              href='/priority/high'
            />
            <SidebarLink
              icon={AlertTriangle}
              label='Medium'
              href='/priority/medium'
            />
            <SidebarLink icon={AlertOctagon} label='Low' href='/priority/low' />
            <SidebarLink
              icon={Layers3}
              label='Backlog'
              href='/priority/backlog'
            />
          </>
        )}
      </div>

      <div className='z-10 mt-32 flex w-full flex-col items-center gap-4 bg-white px-8 py-4 dark:bg-black md:hidden'>
        <div className='flex w-full items-start'>
          {globalUser ? (
            <div className='flex flex-col items-center w-full border-box'>
              <SidebarLink
                href='/settings'
                className='flex items-between jusify-between'
              >
                <Avatar
                  alt={globalUser?.data?.username || `Avatar`}
                  src={avatar}
                  className='h-7 w-7 mr-1 cursor-pointer rounded-full border-1 border-dark-bg dark:border-white'
                />
                <div className='flex flex-col items-start'>
                  <h6 className='text-[#1f2937] dark:text-[#f3f4f6]'>
                    {globalUser?.data?.username}
                  </h6>
                  <h6 className='text-[#374151] dark:text-[#6b7280]'>
                    {globalUser?.data?.email}
                  </h6>
                </div>
              </SidebarLink>
              <button
                className='block mt-4 w-full rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 md:hidden'
                onClick={handleSignOut}
                disabled={logoutLoading}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href='/sign-in' className='w-full'>
              <button className='rounded w-full bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500'>
                Sign in
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon?: LucideIcon;
  label?: string;
  children?: React.ReactNode;
  className?: string;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  children,
  className = 'w-full',
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === '/' && href === '/dashboard');

  return (
    <Link href={href} className={className}>
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${
          isActive ? 'bg-gray-100 text-white dark:bg-gray-600' : ''
        } justify-start px-8 py-3`}
      >
        {isActive && (
          <div className='absolute left-0 top-0 h-[100%] w-[5px] bg-blue-200' />
        )}

        {children ? (
          children
        ) : (
          <>
            {Icon && (
              <Icon className='h-6 w-6 text-gray-800 dark:text-gray-100' />
            )}
            <span className='font-medium text-gray-800 dark:text-gray-100'>
              {label}
            </span>
          </>
        )}
      </div>
    </Link>
  );
};

export default Sidebar;
