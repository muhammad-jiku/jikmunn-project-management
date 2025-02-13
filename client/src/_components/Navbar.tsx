import { logoutUser, setIsDarkMode, setIsSidebarCollapsed } from '@/state';
import { useLogoutMutation } from '@/state/api';
import { RootState, useAppDispatch, useAppSelector } from '@/store';
import { Menu, Moon, Search, Settings, Sun, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSidebarCollapsed = useAppSelector(
    (state: RootState) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector(
    (state: RootState) => state.global.isDarkMode
  );
  const globalUser = useAppSelector((state: RootState) => state.global.user);

  const [logout, { isLoading: logoutLoading }] = useLogoutMutation();

  console.log('global user...', globalUser);

  const handleSignOut = async () => {
    try {
      // Call the logout mutation
      await logout().unwrap();
      // Dispatch logout action to clear user state
      dispatch(logoutUser());
      // Redirect to login page (or home, as desired)
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out: ', error);
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
        <Link
          href='/settings'
          className={
            isDarkMode
              ? `h-min w-min rounded p-2 dark:hover:bg-gray-700`
              : `h-min w-min rounded p-2 hover:bg-gray-100`
          }
        >
          <Settings className='h-6 w-6 cursor-pointer dark:text-white' />
        </Link>
        <div className='ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block'></div>
        <div className='hidden items-center justify-between md:flex'>
          {globalUser ? (
            <>
              <div className='flex h-9 w-9 items-center justify-center'>
                <User className='h-6 w-6 cursor-pointer self-center rounded-full dark:text-white' />
              </div>
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
