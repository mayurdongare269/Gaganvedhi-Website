import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiUser, FiCheck, FiX, FiTrash2, FiEye, FiMail, FiPhone, FiMapPin, FiInfo } from 'react-icons/fi';

export default function MembershipApplications() {
  const { currentUser, userRole } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Redirect if not admin
  if (!currentUser || userRole !== 'admin') {
    return <Navigate to="/" />;
  }
  
  // Fetch membership applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const applicationsCollection = collection(db, 'membershipApplications');
        const applicationsQuery = query(applicationsCollection, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(applicationsQuery);
        
        const applicationsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          createdAtFormatted: doc.data().createdAt?.toDate().toLocaleDateString() || 'Unknown date'
        }));
        
        setApplications(applicationsList);
      } catch (error) {
        console.error('Error fetching membership applications:', error);
        setMessage({
          text: 'Failed to load membership applications. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);
  
  // Handle approve application
  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const applicationRef = doc(db, 'membershipApplications', id);
      await updateDoc(applicationRef, {
        status: 'approved',
        updatedAt: new Date()
      });
      
      // Update local state
      setApplications(prevApplications => 
        prevApplications.map(application => 
          application.id === id ? { ...application, status: 'approved' } : application
        )
      );
      
      setMessage({
        text: 'Membership application approved successfully!',
        type: 'success'
      });
      
      // Update modal if open
      if (isModalOpen && selectedApplication?.id === id) {
        setSelectedApplication({ ...selectedApplication, status: 'approved' });
      }
    } catch (error) {
      console.error('Error approving application:', error);
      setMessage({
        text: 'Failed to approve application. Please try again.',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle reject application
  const handleReject = async (id) => {
    try {
      setActionLoading(true);
      const applicationRef = doc(db, 'membershipApplications', id);
      await updateDoc(applicationRef, {
        status: 'rejected',
        updatedAt: new Date()
      });
      
      // Update local state
      setApplications(prevApplications => 
        prevApplications.map(application => 
          application.id === id ? { ...application, status: 'rejected' } : application
        )
      );
      
      setMessage({
        text: 'Membership application rejected.',
        type: 'success'
      });
      
      // Update modal if open
      if (isModalOpen && selectedApplication?.id === id) {
        setSelectedApplication({ ...selectedApplication, status: 'rejected' });
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      setMessage({
        text: 'Failed to reject application. Please try again.',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle delete application
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      const applicationRef = doc(db, 'membershipApplications', id);
      await deleteDoc(applicationRef);
      
      // Update local state
      setApplications(prevApplications => 
        prevApplications.filter(application => application.id !== id)
      );
      
      setMessage({
        text: 'Membership application deleted successfully.',
        type: 'success'
      });
      
      // Close modal if open
      if (isModalOpen && selectedApplication?.id === id) {
        setIsModalOpen(false);
        setSelectedApplication(null);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      setMessage({
        text: 'Failed to delete application. Please try again.',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Open application details modal
  const openApplicationModal = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };
  
  // Close application details modal
  const closeApplicationModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };
  
  // Filter applications by search term and status
  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      application.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'name') {
      aValue = `${a.firstName} ${a.lastName}`;
      bValue = `${b.firstName} ${b.lastName}`;
    }
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
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
          variants={fadeIn}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Membership Applications</h1>
          <p className="text-purple-300">Review and manage membership applications</p>
        </motion.div>
        
        {/* Status message */}
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}
          >
            {message.text}
          </motion.div>
        )}
        
        {/* Filters and controls */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            {/* Status filter */}
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            {/* Sort by */}
            <div className="w-full md:w-48">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="createdAt">Date Applied</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="selectedTier">Membership Tier</option>
              </select>
            </div>
            
            {/* Sort direction */}
            <div className="w-full md:w-48">
              <select
                value={sortDirection}
                onChange={(e) => setSortDirection(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        </motion.div>
        
        {/* Applications list */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : sortedApplications.length === 0 ? (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-8 text-center"
          >
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiUser className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No Applications Found</h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'No applications match your current filters. Try adjusting your search criteria.'
                : 'There are no membership applications to review at this time.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sortedApplications.map((application) => (
              <motion.div 
                key={application.id} 
                variants={fadeIn}
                className="bg-gray-900/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-colors duration-300"
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {application.firstName} {application.lastName}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(application.status)}`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-300">
                      <FiMail className="mr-2 text-purple-400" />
                      <span>{application.email}</span>
                    </div>
                    
                    {application.phone && (
                      <div className="flex items-center text-sm text-gray-300">
                        <FiPhone className="mr-2 text-purple-400" />
                        <span>{application.phone}</span>
                      </div>
                    )}
                    
                    {application.city && application.state && (
                      <div className="flex items-center text-sm text-gray-300">
                        <FiMapPin className="mr-2 text-purple-400" />
                        <span>{application.city}, {application.state}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-300">
                      <FiInfo className="mr-2 text-purple-400" />
                      <span>Tier: {application.selectedTier}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-4">
                    Applied on {application.createdAtFormatted}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openApplicationModal(application)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
                    >
                      <FiEye className="mr-1" />
                      <span>View</span>
                    </button>
                    
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(application.id)}
                          disabled={actionLoading}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiCheck className="mr-1" />
                          <span>Approve</span>
                        </button>
                        
                        <button
                          onClick={() => handleReject(application.id)}
                          disabled={actionLoading}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiX className="mr-1" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => handleDelete(application.id)}
                      disabled={actionLoading}
                      className="flex items-center justify-center w-10 bg-gray-800 hover:bg-red-900 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      {/* Application details modal */}
      {isModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Application Details</h3>
              <button 
                onClick={closeApplicationModal}
                className="text-gray-400 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {selectedApplication.firstName} {selectedApplication.lastName}
                  </h2>
                  <p className="text-purple-400">{selectedApplication.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-full border ${getStatusColor(selectedApplication.status)}`}>
                  {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Personal Information</h4>
                    <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Full Name:</span>
                        <span className="text-white">{selectedApplication.firstName} {selectedApplication.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{selectedApplication.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Phone:</span>
                        <span className="text-white">{selectedApplication.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Occupation:</span>
                        <span className="text-white">{selectedApplication.occupation || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Address</h4>
                    <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Street:</span>
                        <span className="text-white">{selectedApplication.address || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">City:</span>
                        <span className="text-white">{selectedApplication.city || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">State:</span>
                        <span className="text-white">{selectedApplication.state || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Zip Code:</span>
                        <span className="text-white">{selectedApplication.zipCode || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Membership Details</h4>
                    <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Tier Selected:</span>
                        <span className="text-white font-medium">{selectedApplication.selectedTier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Application Date:</span>
                        <span className="text-white">{selectedApplication.createdAtFormatted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">User ID:</span>
                        <span className="text-white text-sm truncate max-w-[200px]">{selectedApplication.userId || 'Not logged in'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Referral Source:</span>
                        <span className="text-white">{selectedApplication.referral || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Interests</h4>
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      {selectedApplication.interests && selectedApplication.interests.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedApplication.interests.map((interest, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 bg-purple-900/50 text-purple-200 text-xs rounded-full"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">No interests specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedApplication.status === 'pending' && (
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => handleApprove(selectedApplication.id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiCheck className="mr-2" />
                    <span>Approve Application</span>
                  </button>
                  
                  <button
                    onClick={() => handleReject(selectedApplication.id)}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center px-4 py-3 bg-red-700 hover:bg-red-600 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiX className="mr-2" />
                    <span>Reject Application</span>
                  </button>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between">
                <button
                  onClick={closeApplicationModal}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors duration-200"
                >
                  Close
                </button>
                
                <button
                  onClick={() => handleDelete(selectedApplication.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <FiTrash2 className="mr-2" />
                  <span>Delete Application</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}