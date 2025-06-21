import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiUser, FiCheck, FiX, FiTrash2, FiEye, FiMail, FiPhone, FiMessageSquare, FiInfo } from 'react-icons/fi';

export default function ContactMessages() {
  const { currentUser, userRole } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [notification, setNotification] = useState({ text: '', type: '' });
  
  // Redirect if not admin
  if (!currentUser || userRole !== 'admin') {
    return <Navigate to="/" />;
  }

  // Fetch contact messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const messagesQuery = query(
          collection(db, 'contactMessages'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(messagesQuery);
        const messagesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching contact messages:', error);
        setNotification({
          text: 'Failed to load contact messages',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, []);

  // Handle marking message as read
  const handleMarkAsRead = async (messageId) => {
    try {
      setActionLoading(true);
      const messageRef = doc(db, 'contactMessages', messageId);
      await updateDoc(messageRef, { status: 'read' });
      
      // Update local state
      setMessages(prevMessages =>
        prevMessages.map(message =>
          message.id === messageId ? { ...message, status: 'read' } : message
        )
      );
      
      setNotification({
        text: 'Message marked as read',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating message:', error);
      setNotification({
        text: 'Failed to update message',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle deleting a message
  const handleDelete = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      setActionLoading(true);
      const messageRef = doc(db, 'contactMessages', messageId);
      await deleteDoc(messageRef);
      
      // Update local state
      setMessages(prevMessages => prevMessages.filter(message => message.id !== messageId));
      
      // Close modal if the deleted message was selected
      if (selectedMessage?.id === messageId) {
        setIsModalOpen(false);
      }
      
      setNotification({
        text: 'Message deleted successfully',
        type: 'success'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      setNotification({
        text: 'Failed to delete message',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Open message details modal
  const openModal = (message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  // Close message details modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter messages based on search term and status
  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort messages
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    // Handle dates
    if (sortBy === 'createdAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    // Handle strings
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-purple-500">Contact Messages</h1>
      
      {/* Notification */}
      {notification.text && (
        <div className={`mb-4 p-3 rounded ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {notification.text}
        </div>
      )}
      
      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full p-2 border border-gray-300 rounded bg-gray-800 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <select
            className="p-2 border border-gray-300 rounded bg-gray-800 text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="read">Read</option>
          </select>
          
          <select
            className="p-2 border border-gray-300 rounded bg-gray-800 text-white"
            value={`${sortBy}-${sortDirection}`}
            onChange={(e) => {
              const [newSortBy, newSortDirection] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortDirection(newSortDirection);
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="subject-asc">Subject (A-Z)</option>
            <option value="subject-desc">Subject (Z-A)</option>
          </select>
        </div>
      </div>
      
      {/* Messages List */}
      {loading ? (
        <div className="text-center py-8">Loading messages...</div>
      ) : sortedMessages.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          {searchTerm || statusFilter !== 'all' ? 'No messages match your filters' : 'No contact messages found'}
        </div>
      ) : (
        <motion.div
          className="grid gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedMessages.map(message => (
            <motion.div
              key={message.id}
              className={`border ${message.status === 'pending' ? 'border-yellow-500 bg-yellow-900 bg-opacity-20' : 'border-gray-700 bg-gray-800'} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}
              variants={itemVariants}
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
                <div className="flex items-center mb-2 md:mb-0">
                  <FiUser className="mr-2 text-purple-400" />
                  <span className="font-semibold">{message.name}</span>
                  <span className="ml-2 text-sm text-gray-400">{message.email}</span>
                </div>
                <div className="text-sm text-gray-400">
                  {formatDate(message.createdAt)}
                </div>
              </div>
              
              <div className="mb-3">
                <h3 className="text-lg font-medium mb-1">{message.subject}</h3>
                <p className="text-gray-300 line-clamp-2">{message.message}</p>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <span className={`inline-block px-2 py-1 rounded text-xs ${message.status === 'pending' ? 'bg-yellow-800 text-yellow-200' : 'bg-green-800 text-green-200'}`}>
                    {message.status === 'pending' ? 'Pending' : 'Read'}
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(message)}
                    className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                    title="View Details"
                  >
                    <FiEye />
                  </button>
                  
                  {message.status === 'pending' && (
                    <button
                      onClick={() => handleMarkAsRead(message.id)}
                      className="p-1 text-green-400 hover:text-green-300 transition-colors"
                      title="Mark as Read"
                      disabled={actionLoading}
                    >
                      <FiCheck />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    title="Delete Message"
                    disabled={actionLoading}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {/* Message Details Modal */}
      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-purple-400">{selectedMessage.subject}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6 space-y-4">
                <div className="flex items-center">
                  <FiUser className="mr-2 text-purple-400" />
                  <span className="font-semibold">{selectedMessage.name}</span>
                </div>
                
                <div className="flex items-center">
                  <FiMail className="mr-2 text-purple-400" />
                  <a href={`mailto:${selectedMessage.email}`} className="text-blue-400 hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                
                <div className="flex items-start">
                  <FiMessageSquare className="mr-2 mt-1 text-purple-400" />
                  <div className="whitespace-pre-wrap">{selectedMessage.message}</div>
                </div>
                
                <div className="flex items-center">
                  <FiInfo className="mr-2 text-purple-400" />
                  <span>
                    Status: <span className={selectedMessage.status === 'pending' ? 'text-yellow-400' : 'text-green-400'}>
                      {selectedMessage.status === 'pending' ? 'Pending' : 'Read'}
                    </span>
                  </span>
                </div>
                
                <div className="text-sm text-gray-400">
                  Submitted on {formatDate(selectedMessage.createdAt)}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 border-t border-gray-700 pt-4">
                {selectedMessage.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedMessage.id);
                      closeModal();
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
                    disabled={actionLoading}
                  >
                    <FiCheck className="mr-2" /> Mark as Read
                  </button>
                )}
                
                <button
                  onClick={() => {
                    handleDelete(selectedMessage.id);
                    closeModal();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center"
                  disabled={actionLoading}
                >
                  <FiTrash2 className="mr-2" /> Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}