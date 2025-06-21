import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';

export default function AdminUsers() {
  const { currentUser, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser || userRole !== 'admin') return;
      
      try {
        setLoading(true);
        
        // Create query based on sort options
        const usersQuery = query(
          collection(db, 'users'), 
          orderBy(sortBy, sortDirection)
        );
        
        const usersSnapshot = await getDocs(usersQuery);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
        setMessage({
          text: 'Failed to load users. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [currentUser, userRole, sortBy, sortDirection]);
  
  // Redirect if not admin
  if (!loading && (!currentUser || userRole !== 'admin')) {
    return <Navigate to="/" />;
  }
  
  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });
  
  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(true);
      
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setMessage({
        text: 'User role updated successfully!',
        type: 'success'
      });
      
      // Close modal if open
      if (isModalOpen) {
        setIsModalOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setMessage({
        text: 'Failed to update user role. Please try again.',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      
      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      
      setMessage({
        text: 'User deleted successfully!',
        type: 'success'
      });
      
      // Close modal if open
      if (isModalOpen) {
        setIsModalOpen(false);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({
        text: 'Failed to delete user. Please try again.',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Open user details modal
  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <div className="bg-black text-white min-h-screen py-12">
      {/* Background with stars */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="stars-small opacity-30"></div>
        <div className="stars-medium opacity-20"></div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-black z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">User <span className="text-gradient">Management</span></h1>
              <p className="text-gray-300">
                View and manage all users of the Gaganvedhi Astronomy Club.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link to="/admin/dashboard" className="text-purple-400 hover:text-purple-300 flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
          
          {/* Message display */}
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}
            >
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {message.text}
              </div>
            </motion.div>
          )}
          
          {/* Filters and Search */}
          <motion.div variants={fadeIn} className="mb-6 bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">Search Users</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Role Filter */}
              <div>
                <label htmlFor="role-filter" className="block text-sm font-medium text-gray-400 mb-1">Filter by Role</label>
                <select
                  id="role-filter"
                  className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="user">User</option>
                </select>
              </div>
              
              {/* Sort By */}
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
                <select
                  id="sort-by"
                  className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                  value={`${sortBy}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortBy(field);
                    setSortDirection(direction);
                  }}
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="displayName-asc">Name (A-Z)</option>
                  <option value="displayName-desc">Name (Z-A)</option>
                  <option value="email-asc">Email (A-Z)</option>
                  <option value="email-desc">Email (Z-A)</option>
                </select>
              </div>
            </div>
          </motion.div>
          
          {/* Users Table */}
          <motion.div variants={fadeIn} className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-purple-900/50 shadow-xl overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700/30">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('displayName')}>
                        <div className="flex items-center">
                          User
                          {sortBy === 'displayName' && (
                            <svg className={`w-4 h-4 ml-1 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('email')}>
                        <div className="flex items-center">
                          Email
                          {sortBy === 'email' && (
                            <svg className={`w-4 h-4 ml-1 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white" onClick={() => handleSort('createdAt')}>
                        <div className="flex items-center">
                          Joined
                          {sortBy === 'createdAt' && (
                            <svg className={`w-4 h-4 ml-1 ${sortDirection === 'asc' ? '' : 'transform rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.photoURL ? (
                                <img className="h-10 w-10 rounded-full" src={user.photoURL} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{user.displayName || 'Anonymous User'}</div>
                              <div className="text-xs text-gray-400">{user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-900 text-purple-200' : user.role === 'member' ? 'bg-blue-900 text-blue-200' : 'bg-gray-700 text-gray-300'}`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openUserModal(user)}
                            className="text-purple-400 hover:text-purple-300 mr-3"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-400 hover:text-red-300"
                            disabled={actionLoading || user.id === currentUser.uid}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-gray-300">No users found</h3>
                <p className="mt-1 text-gray-400">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </motion.div>
          
          {/* Pagination (simplified for now) */}
          {filteredUsers.length > 0 && (
            <motion.div variants={fadeIn} className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Showing <span className="font-medium text-white">{filteredUsers.length}</span> of <span className="font-medium text-white">{users.length}</span> users
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg border border-purple-900/50 text-white hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <button className="px-4 py-2 bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-lg border border-purple-900/50 text-white hover:bg-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom bg-gray-800 bg-opacity-90 backdrop-blur-xl rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-purple-900/50"
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-2xl leading-6 font-bold text-white mb-4" id="modal-title">
                      User Details
                    </h3>
                    
                    <div className="mt-2 space-y-4">
                      {/* User Avatar and Name */}
                      <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 h-16 w-16">
                          {selectedUser.photoURL ? (
                            <img className="h-16 w-16 rounded-full" src={selectedUser.photoURL} alt="" />
                          ) : (
                            <div className="h-16 w-16 rounded-full bg-purple-600 flex items-center justify-center">
                              <span className="text-white font-medium text-xl">
                                {selectedUser.displayName ? selectedUser.displayName.charAt(0).toUpperCase() : 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-xl font-bold text-white">{selectedUser.displayName || 'Anonymous User'}</h4>
                          <p className="text-gray-400">{selectedUser.email}</p>
                        </div>
                      </div>
                      
                      {/* User Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-400">User ID</p>
                          <p className="text-white font-mono text-sm break-all">{selectedUser.id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Joined</p>
                          <p className="text-white">{formatDate(selectedUser.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Last Login</p>
                          <p className="text-white">{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Current Role</p>
                          <p className="text-white">{selectedUser.role || 'user'}</p>
                        </div>
                      </div>
                      
                      {/* User Bio */}
                      {selectedUser.bio && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-400">Bio</p>
                          <p className="text-white">{selectedUser.bio}</p>
                        </div>
                      )}
                      
                      {/* Change Role */}
                      <div className="mt-6">
                        <label htmlFor="role-change" className="block text-sm font-medium text-gray-400 mb-1">Change Role</label>
                        <div className="flex space-x-2">
                          <select
                            id="role-change"
                            className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                            defaultValue={selectedUser.role || 'user'}
                            disabled={actionLoading || selectedUser.id === currentUser.uid}
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="user">User</option>
                          </select>
                          <button
                            onClick={() => handleRoleChange(selectedUser.id, document.getElementById('role-change').value)}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={actionLoading || selectedUser.id === currentUser.uid}
                          >
                            {actionLoading ? 'Updating...' : 'Update'}
                          </button>
                        </div>
                        {selectedUser.id === currentUser.uid && (
                          <p className="text-sm text-yellow-400 mt-1">You cannot change your own role.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleDeleteUser(selectedUser.id)}
                  disabled={actionLoading || selectedUser.id === currentUser.uid}
                >
                  {actionLoading ? 'Processing...' : 'Delete User'}
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedUser(null);
                  }}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}