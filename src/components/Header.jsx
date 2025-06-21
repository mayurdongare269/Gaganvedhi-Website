import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import logo from '../assets/logo.png';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentUser, userRole, logout } = useAuth();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Navigation items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Blog', path: '/blog' },
    { name: 'Forum', path: '/forum' },
    { name: 'Contact', path: '/contact' },
  ];

  // Auth navigation items
  const authItems = currentUser
    ? [
        { name: 'Profile', path: '/profile' },
        { name: 'Dashboard', path: '/dashboard', adminOnly: true },
        { name: 'Logout', action: logout },
      ]
    : [
        { name: 'Login', path: '/login' },
        { name: 'Register', path: '/register' },
      ];

  // Filter admin items if user is not admin
  const filteredAuthItems = authItems.filter(
    (item) => !item.adminOnly || (item.adminOnly && userRole === 'admin')
  );

  // Animation variants
  const headerVariants = {
    initial: { y: -100 },
    animate: { y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
  };

  const mobileMenuVariants = {
    closed: { opacity: 0, x: '100%', transition: { duration: 0.3 } },
    open: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      <motion.header
        initial="initial"
        animate="animate"
        variants={headerVariants}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900/90 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">


              <img
                src={logo}
                alt="Gaganvedhi Logo"
                className="w-10 h-10 object-contain"
              />



              <span className={`font-bold text-xl ${isScrolled ? 'text-white' : 'text-white'}`}>
                Gaganvedhi
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === item.path ? 'text-purple-400' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Auth Items */}
              <div className="ml-4 pl-4 border-l border-gray-700 flex items-center space-x-1">
                {filteredAuthItems.map((item, index) => (
                  item.action ? (
                    <button
                      key={item.name}
                      onClick={item.action}
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${index === filteredAuthItems.length - 1 ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}
                    >
                      {item.name}
                    </Link>
                  )
                ))}
              </div>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="fixed inset-0 z-40 md:hidden bg-gray-900/95 backdrop-blur-md pt-20"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-4 py-3 rounded-md text-base font-medium transition-colors ${location.pathname === item.path ? 'bg-gray-800 text-purple-400' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}
                  >
                    {item.name}
                  </Link>
                ))}

                <div className="my-2 border-t border-gray-700"></div>

                {/* Auth Items */}
                {filteredAuthItems.map((item) => (
                  item.action ? (
                    <button
                      key={item.name}
                      onClick={item.action}
                      className="px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors text-left"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`px-4 py-3 rounded-md text-base font-medium transition-colors ${item.name === 'Register' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}`}
                    >
                      {item.name}
                    </Link>
                  )
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
