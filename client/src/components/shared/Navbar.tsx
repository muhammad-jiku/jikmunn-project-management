import { logoutUser, setIsDarkMode, setIsSidebarCollapsed } from '@/state';
import { useLogoutMutation } from '@/state/api/authApi';
import { persistor, RootState, useAppDispatch, useAppSelector } from '@/store';
import { Avatar } from '@mui/material';
import { Menu, Moon, Search, Sun } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import profileDefault from '../../../public/images/p7.jpeg';

const Navbar = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state: RootState) => state?.global?.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector(
    (state: RootState) => state?.global?.isDarkMode
  );
  const globalUser = useAppSelector(
    (state: RootState) => state?.global?.user?.data
  );
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

  console.log('global user...', globalUser);

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

  return (
    <div className='flex items-center justify-between bg-white px-4 py-3 dark:bg-black'>
      {/* Search Bar */}
      <div className='flex items-center gap-8'>
        {!isSidebarCollapsed ? null : (
          <button
            aria-label='Close sidebar'
            title='Close sidebar'
            onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
          >
            <Menu className='h-8 w-8 dark:text-white' />
          </button>
        )}
        <div className='relative flex h-min w-[200px]'>
          <Search className='absolute left-[4px] top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer dark:text-white' />
          <input
            className='w-full rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white'
            type='search'
            placeholder='Search...'
          />
        </div>
      </div>

      {/* Icons & Authentication Controls */}
      <div className='flex items-center'>
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className={
            isDarkMode
              ? `rounded p-2 dark:hover:bg-gray-700`
              : `rounded p-2 hover:bg-gray-100`
          }
        >
          {isDarkMode ? (
            <Sun className='h-6 w-6 cursor-pointer dark:text-white' />
          ) : (
            <Moon className='h-6 w-6 cursor-pointer dark:text-white' />
          )}
        </button>
        <div className='ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block'></div>
        <div className='hidden items-center justify-between md:flex'>
          {globalUser ? (
            <>
              <Link
                href='/settings'
                className='flex h-9 items-center jusify-between p-1 box-border'
              >
                <Avatar
                  alt={globalUser?.data?.username || `Avatar`}
                  src={avatar}
                  className='h-4 w-4 mr-2 cursor-pointer self-center rounded-full'
                />
                <div className='flex flex-col items-start box-border'>
                  <h6 className='text-[#1f2937] dark:text-[#f3f4f6]'>
                    {globalUser?.data?.username}
                  </h6>
                  <h6 className='text-[#374151] dark:text-[#6b7280]'>
                    {globalUser?.data?.email}
                  </h6>
                </div>
              </Link>
              <button
                className='hidden rounded bg-blue-400 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 md:block'
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

export default Navbar;
