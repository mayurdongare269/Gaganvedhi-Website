import { useState, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiUsers, FiCalendar, FiFileText, FiSettings, FiMenu, FiX, FiSend, FiUserPlus, FiMessageSquare } from 'react-icons/fi';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <FiHome className="w-5 h-5" /> },
    { path: '/admin/users', name: 'Users', icon: <FiUsers className="w-5 h-5" /> },
    { path: '/admin/events', name: 'Events', icon: <FiCalendar className="w-5 h-5" /> },
    { path: '/admin/event-proposals', name: 'Event Proposals', icon: <FiSend className="w-5 h-5" /> },
    { path: '/admin/membership-applications', name: 'Membership Apps', icon: <FiUserPlus className="w-5 h-5" /> },
    { path: '/admin/contact-messages', name: 'Contact Messages', icon: <FiMessageSquare className="w-5 h-5" /> },
    { path: '/admin/posts', name: 'Posts', icon: <FiFileText className="w-5 h-5" /> },
    { path: '/admin/settings', name: 'Settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  // Animation variants
  const sidebarVariants = {
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
  };

  const contentVariants = {
    wide: { marginLeft: isMobile ? 0 : '16rem', transition: { duration: 0.3 } },
    narrow: { marginLeft: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 z-20 ${isMobile ? 'shadow-lg' : ''}`}
        variants={sidebarVariants}
        animate={sidebarOpen ? 'open' : 'closed'}
        initial={isMobile ? 'closed' : 'open'}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <Link to="/admin/dashboard" className="text-xl font-bold text-purple-400">GaganVedhi Admin</Link>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
              <FiX className="w-6 h-6" />
            </button>
          )}
        </div>

        <nav className="mt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="px-2 py-1">
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${location.pathname === item.path ? 'bg-purple-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <Link to="/" className="flex items-center text-gray-300 hover:text-white transition-colors duration-200">
            <span className="mr-2">← Back to Site</span>
          </Link>
        </div>
      </motion.div>

      {/* Main content */}
      <motion.div
        className="flex-1 overflow-x-hidden overflow-y-auto"
        variants={contentVariants}
        animate={sidebarOpen && !isMobile ? 'wide' : 'narrow'}
        initial={isMobile ? 'narrow' : 'wide'}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 shadow-md">
          <div className="flex items-center justify-between p-4">
            {/* Mobile menu button */}
            {isMobile && !sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
                <FiMenu className="w-6 h-6" />
              </button>
            )}

            <div className="flex items-center ml-auto">
              <div className="text-sm text-gray-300 mr-4">
                {currentUser?.displayName || currentUser?.email}
              </div>
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
                ) : (
                  <span>{(currentUser?.displayName || currentUser?.email || '').charAt(0).toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLayout;