'use client';

import { logoutUser, setIsSidebarCollapsed } from '@/state';
// import { useGetProjectsQuery } from '@/state/api';
import { useLogoutMutation } from '@/state/api';
import { persistor, RootState, useAppDispatch, useAppSelector } from '@/store';
import {
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Home,
  Layers3,
  LockIcon,
  LucideIcon,
  Search,
  Settings,
  ShieldAlert,
  User,
  Users,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import logo from '../../public/logo.png';

const Sidebar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const globalUser = useAppSelector((state: RootState) => state.global.user);
  const [showProjects, setShowProjects] = useState(true);
  const [showPriority, setShowPriority] = useState(true);

  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();
  // const { data: projects } = useGetProjectsQuery({});
  // console.log('sidebar projects data', projects);

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
    ${isSidebarCollapsed ? 'w-0 hidden' : 'w-64'}
  `;

  return (
    <div className={sidebarClassNames}>
      <div className='flex h-[100%] w-full flex-col justify-start'>
        {/* TOP LOGO */}
        <div className='z-50 flex min-h-[56px] w-64 items-center justify-between bg-white px-6 pt-3 dark:bg-black'>
          <div className='text-xl font-bold text-gray-800 dark:text-white'>
            EDLIST
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
          <Image src={logo} alt='Logo' width={40} height={40} />
          <div>
            <h3 className='text-md font-bold tracking-wide dark:text-gray-200'>
              EDROH TEAM
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
          <SidebarLink icon={Settings} label='Settings' href='/settings' />
          <SidebarLink icon={User} label='Users' href='/users' />
          <SidebarLink icon={Users} label='Teams' href='/teams' />
        </nav>

        {/* PROJECTS LINKS */}
        <button
          onClick={() => setShowProjects((prev) => !prev)}
          className='flex w-full items-center justify-between px-8 py-3 text-gray-500'
        >
          <span className=''>Projects</span>
          {showProjects ? (
            <ChevronUp className='h-5 w-5' />
          ) : (
            <ChevronDown className='h-5 w-5' />
          )}
        </button>
        {/* PROJECTS LIST */}
        {/* {showProjects &&
          projects?.data?.map((project) => (
            <SidebarLink
              key={project.id}
              icon={Briefcase}
              label={project.name}
              href={`/projects/${project.id}`}
            />
          ))} */}

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
        <div className='flex w-full items-center'>
          {/* <div className='align-center flex h-9 w-9 justify-center'>
            <User className='h-6 w-6 cursor-pointer self-center rounded-full dark:text-white' />
          </div> */}

          {globalUser ? (
            <>
              <div className='flex h-9 w-9 items-center justify-center'>
                <User className='h-6 w-6 cursor-pointer self-center rounded-full dark:text-white' />
              </div>
              <button
                className='block rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 md:hidden'
                onClick={handleSignOut}
                disabled={logoutLoading}
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href='/sign-in'>
              <button className='rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500'>
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
  icon: LucideIcon;
  label: string;
}

const SidebarLink = ({ href, icon: Icon, label }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === '/' && href === '/dashboard');

  return (
    <Link href={href} className='w-full'>
      <div
        className={`relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${
          isActive ? 'bg-gray-100 text-white dark:bg-gray-600' : ''
        } justify-start px-8 py-3`}
      >
        {isActive && (
          <div className='absolute left-0 top-0 h-[100%] w-[5px] bg-blue-200' />
        )}

        <Icon className='h-6 w-6 text-gray-800 dark:text-gray-100' />
        <span className={`font-medium text-gray-800 dark:text-gray-100`}>
          {label}
        </span>
      </div>
    </Link>
  );
};

export default Sidebar;
