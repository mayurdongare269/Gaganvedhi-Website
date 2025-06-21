import { useState, useEffect, Component } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  orderBy,
  serverTimestamp,
  where
} from 'firebase/firestore';
import { db } from '../firebase';
import { FiMessageCircle, FiUser, FiClock, FiPlus, FiSend, FiChevronRight, FiAlertTriangle } from 'react-icons/fi';

// Error Boundary Component to catch rendering errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('Forum component error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="p-6 bg-gray-800/70 backdrop-blur-sm rounded-xl border border-red-500/30 shadow-lg text-center">
          <FiAlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-300 mb-4">We encountered an error while loading this component.</p>
          <button 
            onClick={() => this.setState({ hasError: false })} 
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const Forum = () => {
  const { currentUser } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  
  // Categories for discussions
  const categories = [
    { id: 'general', name: 'General' },
    { id: 'astronomy', name: 'Astronomy' },
    { id: 'space-exploration', name: 'Space Exploration' },
    { id: 'astrophotography', name: 'Astrophotography' },
    { id: 'events', name: 'Events' },
    { id: 'equipment', name: 'Equipment' },
    { id: 'science', name: 'Science' }
  ];

  // Fetch discussions from Firestore
  useEffect(() => {
    fetchDiscussions();
  }, [selectedCategory]);

  const fetchDiscussions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let discussionsQuery;
      
      if (selectedCategory === 'all') {
        discussionsQuery = query(
          collection(db, 'discussions'),
          orderBy('createdAt', 'desc')
        );
      } else {
        discussionsQuery = query(
          collection(db, 'discussions'),
          where('category', '==', selectedCategory),
          orderBy('createdAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(discussionsQuery);
      const discussionsData = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const discussion = {
          id: docSnapshot.id,
          ...docSnapshot.data(),
          createdAt: docSnapshot.data().createdAt?.toDate() || new Date(),
        };
        
        // Fetch user data for the discussion creator
        if (discussion.userId) {
          const userDoc = await getDoc(doc(db, 'users', discussion.userId));
          if (userDoc.exists()) {
            discussion.user = {
              displayName: userDoc.data().displayName || 'Anonymous',
              photoURL: userDoc.data().photoURL || ''
            };
          }
        }
        
        discussionsData.push(discussion);
      }
      
      setDiscussions(discussionsData);
    } catch (err) {
      console.error('Error fetching discussions:', err);
      setError('Failed to load discussions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // State for tracking submission status
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle creating a new discussion
  const handleCreateDiscussion = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    if (!currentUser) {
      setError('You must be logged in to create a discussion');
      return;
    }
    
    if (!newDiscussion.title.trim() || !newDiscussion.content.trim()) {
      setError('Title and content are required');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const discussionData = {
        title: newDiscussion.title.trim(),
        content: newDiscussion.content.trim(),
        category: newDiscussion.category,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Anonymous',
        userPhotoURL: currentUser.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        comments: [],
        likesCount: 0,
        viewsCount: 0
      };
      
      // Add the new discussion to Firestore
      const docRef = await addDoc(collection(db, 'discussions'), discussionData);
      
      // Optimistically update the discussions list
      const newDiscussionWithId = {
        id: docRef.id,
        ...discussionData,
        createdAt: new Date(), // Use current date since serverTimestamp isn't available locally
        userDisplayName: currentUser.displayName || 'Anonymous',
        user: {
          displayName: currentUser.displayName || 'Anonymous',
          photoURL: currentUser.photoURL || ''
        }
      };
      
      setDiscussions(prev => [newDiscussionWithId, ...prev]);
      
      // Reset form and close modal
      setNewDiscussion({
        title: '',
        content: '',
        category: 'general'
      });
      setIsCreateModalOpen(false);
      
      // No need to call fetchDiscussions() since we've already updated the state
    } catch (err) {
      console.error('Error creating discussion:', err);
      setError('Failed to create discussion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes for new discussion form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDiscussion(prev => ({
      ...prev,
      [name]: value
    }));
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
    <ErrorBoundary>
      <div className="bg-black text-white min-h-screen py-16">
        {/* Background with stars */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="stars-small opacity-50"></div>
          <div className="stars-medium opacity-30"></div>
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-transparent to-black z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-5xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div variants={fadeIn} className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Community <span className="text-gradient">Forum</span></h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join the conversation with fellow astronomy enthusiasts and space explorers
            </p>
          </motion.div>
          
          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg shadow-lg"
            >
              {error}
            </motion.div>
          )}
          
          {/* Categories and Create Button */}
          <motion.div variants={fadeIn} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === 'all' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
              >
                All Topics
              </button>
              
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === category.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => currentUser ? setIsCreateModalOpen(true) : setError('Please log in to create a discussion')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center justify-center md:justify-start"
            >
              <FiPlus className="mr-2" />
              New Discussion
            </button>
          </motion.div>
          
          {/* Discussions List */}
          {isLoading ? (
            // Loading Skeleton
            <motion.div variants={fadeIn} className="space-y-6">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 animate-pulse shadow-lg border border-gray-700/50">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/4 mb-6"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              ))}
            </motion.div>
          ) : discussions.length > 0 ? (
            <motion.div variants={fadeIn} className="space-y-6">
              {discussions.map(discussion => (
                <motion.div
                  key={discussion.id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-purple-900/30 hover:border-purple-500/50 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
                >
                  <Link to={`/forum/${discussion.id}`} className="block">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 hover:text-purple-400 transition-colors">
                      {discussion.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center text-sm text-gray-400 mb-4 gap-2">
                      <span className="px-3 py-1 bg-gray-700/80 rounded-full text-xs font-medium">
                        {categories.find(c => c.id === discussion.category)?.name || 'General'}
                      </span>
                      
                      <div className="flex items-center ml-0 md:ml-3">
                        <FiUser className="mr-1" />
                        <span>{discussion.userDisplayName || 'Anonymous'}</span>
                      </div>
                      
                      <div className="flex items-center ml-3">
                        <FiClock className="mr-1" />
                        <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center ml-3">
                        <FiMessageCircle className="mr-1" />
                        <span>{discussion.comments?.length || 0}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                      {discussion.content}
                    </p>
                    
                    <div className="flex justify-end">
                      <span className="text-purple-400 flex items-center text-sm font-medium hover:text-purple-300 transition-colors">
                        View Discussion
                        <FiChevronRight className="ml-1" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div variants={fadeIn} className="text-center py-12 bg-gray-800/50 rounded-xl shadow-lg border border-gray-700/50">
              <div className="text-gray-400 mb-4">
                <FiMessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No discussions found</h3>
                <p className="text-gray-500">
                  {selectedCategory === 'all' 
                    ? 'Be the first to start a discussion!'
                    : `No discussions in the ${categories.find(c => c.id === selectedCategory)?.name} category yet.`}
                </p>
              </div>
              
              {currentUser && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
                >
                  Start a Discussion
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Create Discussion Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-purple-900/30"
            >
              <div className="px-6 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-white mb-4 border-b border-gray-700 pb-2">Create New Discussion</h3>
                
                {/* Form Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-300 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleCreateDiscussion}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newDiscussion.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white shadow-inner"
                      placeholder="Enter discussion title"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                    <select
                      id="category"
                      name="category"
                      value={newDiscussion.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white shadow-inner"
                      disabled={isSubmitting}
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-400 mb-1">Content</label>
                    <textarea
                      id="content"
                      name="content"
                      value={newDiscussion.content}
                      onChange={handleInputChange}
                      rows="5"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white shadow-inner"
                      placeholder="Enter your discussion content"
                      required
                      disabled={isSubmitting}
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors shadow-lg"
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md transition-all flex items-center shadow-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:from-purple-700 hover:to-blue-700 hover:shadow-purple-500/20'}`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FiSend className="mr-2" />
                          Post Discussion
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
};

export default Forum;