import { useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from '@material-tailwind/react';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  Bars3Icon,
} from '@heroicons/react/24/solid';
import {
  useMaterialTailwindController,
  setOpenConfigurator,
  setOpenSidenav,
} from '@/context';
import authService from '@/services/authService';
import userService from '@/services/userService';
import notificationService from '@/services/notificationService';
import fallbackProfilePic from '@/assets/images/avatar.jpg';
import NotificationMenu from '@/components/common/NotificationMenu';

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split('/').filter((el) => el !== '');

  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    // Load user data
    userService
      .getCurrentUser()
      .then((u) => {
        if (!isMounted) return;
        setCurrentUser(u);
      })
      .catch(() => {
        if (!isMounted) return;
        setCurrentUser(null);
      });

    // Load notifications
    notificationService.getNotifications()
      .then(() => {
        if (!isMounted) return;
        setNotifications(notificationService.notifications);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error('Failed to load notifications:', error);
        // Set empty array on error
        setNotifications([]);
      });

    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      if (isMounted) {
        setNotifications([...updatedNotifications]);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  return (
    <Navbar
      color={fixedNavbar ? 'white' : 'transparent'}
      className={`rounded-xl transition-all ${fixedNavbar
        ? 'sticky top-12 z-40 py-3 shadow-md shadow-blue-gray-500/5'
        : 'px-0 py-1 mt-2'
        }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize flex flex-col justify-center">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${fixedNavbar ? 'mt-0' : ''
              }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="paragraph"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {layout}
              </Typography>
            </Link>
            <Typography
              variant="paragraph"
              color="blue-gray"
              className="font-normal"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h5" color="blue-gray" className="mt-1">
            {page}
          </Typography>
        </div>
        <div className="flex items-center">
          <div className="mr-auto md:mr-4 md:w-56">
            <Input label="Search" />
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>

          {/* User Menu */}
          <Menu>
            <MenuHandler>
              <Button
                variant="text"
                color="blue-gray"
                className="hidden items-center gap-1 px-4 xl:flex normal-case"
              >
                <Avatar
                  src={(currentUser?.profilePictureUrl && currentUser.profilePictureUrl.trim()) || fallbackProfilePic}
                  alt={currentUser?.name || 'User'}
                  size="sm"
                  variant="circular"
                  className="mr-2"
                />
                <span className="max-w-[140px] truncate text-base font-medium" title={currentUser?.name || 'User'}>
                  {currentUser?.name || 'User'}
                </span>
              </Button>
            </MenuHandler>
            <MenuList className="w-max border-0">
              <MenuItem className="flex items-center gap-3">
                <Avatar
                  src={(currentUser?.profilePictureUrl && currentUser.profilePictureUrl.trim()) || fallbackProfilePic}
                  alt={currentUser?.name || 'User'}
                  size="sm"
                  variant="circular"
                />
                <div>
                  <Typography
                    variant="paragraph"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong className="block max-w-[220px] truncate" title={currentUser?.name || 'User'}>
                      {currentUser?.name || 'User'}
                    </strong>
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-sm font-normal opacity-60 max-w-[240px] truncate"
                  >
                    <span title={currentUser?.email || 'user@example.com'}>
                      {currentUser?.email || 'user@example.com'}
                    </span>
                  </Typography>
                </div>
              </MenuItem>
              <hr className="my-2 border-blue-gray-50" />
              <MenuItem className="flex items-center gap-3">
                <UserCircleIcon className="h-4 w-4" />
                <Typography variant="small" className="font-normal">
                  My Profile
                </Typography>
              </MenuItem>
              <MenuItem className="flex items-center gap-3" onClick={handleLogout}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <Typography variant="small" className="font-normal">
                  Sign Out
                </Typography>
              </MenuItem>
            </MenuList>
          </Menu>

          {/* Mobile User Icon */}
          <Menu>
            <MenuHandler>
              <IconButton
                variant="text"
                color="blue-gray"
                className="grid xl:hidden"
              >
                <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
              </IconButton>
            </MenuHandler>
            <MenuList className="w-max border-0">
              <MenuItem className="flex items-center gap-3" onClick={handleLogout}>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <Typography variant="small" className="font-normal">
                  Sign Out
                </Typography>
              </MenuItem>
            </MenuList>
          </Menu>

          <NotificationMenu
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDelete={handleDeleteNotification}
          />
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-6 w-6 text-blue-gray-500" />
          </IconButton>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = '/src/widgets/layout/dashboard-navbar.jsx';

export default DashboardNavbar;
