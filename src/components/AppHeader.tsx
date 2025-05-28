import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getNotificationsForUser, markNotificationAsRead, Notification } from '@/services/notificationService';

const AppHeader: React.FC = () => {
  const { user, logoutUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isDoctor = user?.role === 'doctor';

  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated && user?.token && user?._id) {
        setLoadingNotifications(true);
        try {
          const data = await getNotificationsForUser(user._id, user.token);
          setNotifications(data);
        } catch (error) {
          console.error('Failed to load notifications:', error);
        } finally {
          setLoadingNotifications(false);
        }
      }
    };

    fetchNotifications();
  }, [isAuthenticated, user]);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      if (user?.token) {
        await markNotificationAsRead(notificationId, user.token);
        setNotifications(notifications.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        ));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto md:px-6">
        {/* Logo and Title */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-medical text-white">
            <span className="font-bold text-lg">M</span>
          </div>
          <span className="hidden sm:block text-lg font-semibold text-medical-dark">MediArchive</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {isAuthenticated && (
            <>
              <Link to="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/scan">
                <Button variant="ghost">Scan Report</Button>
              </Link>
              <Link to="/archive">
                <Button variant="ghost">Archive</Button>
              </Link>
                                {isDoctor && (
      <Link to="/listPatients">
        <Button variant="ghost">My Patients</Button>
      </Link>
    )}
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-2 font-semibold border-b">Notifications</div>
                  {loadingNotifications ? (
                    <div className="p-3 text-center text-gray-500">Loading...</div>
                  ) : notifications.length > 0 ? (
                    <>
                      {notifications.slice(0, 5).map((notification) => (
                        <DropdownMenuItem 
                          key={notification._id} 
                          className="flex flex-col items-start p-3 cursor-pointer"
                          onClick={() => handleMarkAsRead(notification._id)}
                        >
                          <div className="flex items-center w-full">
                            <span className={cn(
                              "w-2 h-2 rounded-full mr-2",
                              notification.type === "warning" ? "bg-yellow-500" : 
                              notification.type === "error" ? "bg-red-500" : 
                              notification.type === "success" ? "bg-green-500" : "bg-blue-500"
                            )} />
                            <span className="font-medium">{notification.title}</span>
                            {!notification.read && (
                              <span className="ml-auto text-xs bg-blue-100 px-2 py-0.5 rounded-full">New</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </DropdownMenuItem>
                      ))}
                      <div className="p-2 text-center border-t">
                        <Button variant="ghost" size="sm" className="w-full" onClick={() => navigate('/notifications')}>
                          View all
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 text-center text-gray-500">No notifications</div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Avatar and Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-1 rounded-full">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImage} alt={user?.name || "User"} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start p-2 mb-2 space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImage} alt={user?.name || "User"} />
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => logoutUser()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Toggle */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={toggleMobileMenu}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="default" className="bg-medical hover:bg-medical-dark">Register</Button>
              </Link>

            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
{mobileMenuOpen && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 md:hidden">
    <Card className="absolute top-0 right-0 bottom-0 w-64 px-4 py-6 overflow-y-auto bg-white">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Menu</h2>
        <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <nav className="flex flex-col space-y-2">
        <Link to="/dashboard" onClick={toggleMobileMenu}>
          <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
        </Link>
        <Link to="/scan" onClick={toggleMobileMenu}>
          <Button variant="ghost" className="w-full justify-start">Scan Report</Button>
        </Link>
        <Link to="/archive" onClick={toggleMobileMenu}>
          <Button variant="ghost" className="w-full justify-start">Archive</Button>
        </Link>
        {isDoctor && (
          <Link to="/listPatients" onClick={toggleMobileMenu}>
            <Button variant="ghost" className="w-full justify-start">My Patients</Button>
          </Link>
        )}
        <Link to="/profile" onClick={toggleMobileMenu}>
          <Button variant="ghost" className="w-full justify-start">Profile</Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={() => {
            logoutUser();
            toggleMobileMenu();
          }}
        >
          Logout
        </Button>
      </nav>
    </Card>
  </div>
)}

    </header>
  );
};

export default AppHeader;