import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { format } from 'date-fns';

export default function Posts() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Default blog image
  const defaultBlogImage = 'https://i.imgur.com/HeIi0wU.png';
  
  // New post template
  const newPostTemplate = {
    title: '',
    summary: '',
    content: '',
    category: 'general',
    imageUrl: '',
    featured: false,
    published: true,
    author: {
      id: '',
      name: '',
      photoURL: ''
    },
    createdAt: null,
    updatedAt: null
  };
  
  // Categories
  const categories = [
    'general',
    'stargazing',
    'astrophotography',
    'planets',
    'cosmology',
    'space-exploration',
    'telescopes',
    'education',
    'research'
  ];
  
  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, [sortBy, filterCategory]);
  
  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      let postsQuery;
      
      if (filterCategory === 'all') {
        postsQuery = query(
          collection(db, 'posts'),
          sortBy === 'newest' ? orderBy('createdAt', 'desc') : orderBy('createdAt', 'asc')
        );
      } else {
        postsQuery = query(
          collection(db, 'posts'),
          where('category', '==', filterCategory),
          sortBy === 'newest' ? orderBy('createdAt', 'desc') : orderBy('createdAt', 'asc')
        );
      }
      
      const querySnapshot = await getDocs(postsQuery);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load posts. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (showCreateModal) {
      setNewPost(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    } else if (showEditModal && currentPost) {
      setCurrentPost(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };
  
  // Create new post
  const [newPost, setNewPost] = useState({
    ...newPostTemplate
  });
  
  const openCreateModal = () => {
    setNewPost({
      ...newPostTemplate,
      author: {
        id: currentUser.uid,
        name: currentUser.displayName || 'Anonymous',
        photoURL: currentUser.photoURL || ''
      }
    });
    setShowCreateModal(true);
  };
  
  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      setMessage({ type: '', text: '' });
      
      // Use the provided imageUrl or default if empty
      const imageUrl = newPost.imageUrl || defaultBlogImage;
      
      // Create post document
      const postData = {
        ...newPost,
        imageUrl: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add to Firestore
      await addDoc(collection(db, 'posts'), postData);
      
      // Success message
      setMessage({
        type: 'success',
        text: 'Post created successfully!'
      });
      
      // Close modal and refresh posts
      setTimeout(() => {
        setShowCreateModal(false);
        fetchPosts();
      }, 1500);
      
    } catch (error) {
      console.error('Error creating post:', error);
      setMessage({
        type: 'error',
        text: 'Failed to create post. Please try again.'
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  // Edit post
  const openEditModal = (post) => {
    setCurrentPost(post);
    setShowEditModal(true);
  };
  
  const handleUpdatePost = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      setMessage({ type: '', text: '' });
      
      // Use the provided imageUrl or default if empty
      const imageUrl = currentPost.imageUrl || defaultBlogImage;
      
      // Update post document
      const postRef = doc(db, 'posts', currentPost.id);
      await updateDoc(postRef, {
        ...currentPost,
        imageUrl: imageUrl,
        updatedAt: new Date()
      });
      
      // Success message
      setMessage({
        type: 'success',
        text: 'Post updated successfully!'
      });
      
      // Close modal and refresh posts
      setTimeout(() => {
        setShowEditModal(false);
        fetchPosts();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating post:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update post. Please try again.'
      });
    } finally {
      setFormLoading(false);
    }
  };
  
  // Delete post
  const handleDeletePost = async (postId, imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete post document
      await deleteDoc(doc(db, 'posts', postId));
      
      // Success message
      setMessage({
        type: 'success',
        text: 'Post deleted successfully!'
      });
      
      // Refresh posts
      fetchPosts();
      
    } catch (error) {
      console.error('Error deleting post:', error);
      setMessage({
        type: 'error',
        text: 'Failed to delete post. Please try again.'
      });
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(date.toDate(), 'MMM d, yyyy');
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
  
  // Filter posts by search term
  const filteredPosts = posts.filter(post => {
    return post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           post.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
           post.category.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  return (
    <div className="min-h-screen bg-black text-white py-12">
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
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={fadeIn} className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Manage <span className="text-gradient">Blog Posts</span></h1>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Post
              </span>
            </button>
          </motion.div>
          
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-8 p-4 rounded-lg ${message.type === 'error' ? 'bg-red-900/50 border border-red-500/50 text-red-300' : 'bg-green-900/50 border border-green-500/50 text-green-300'}`}
            >
              {message.text}
            </motion.div>
          )}
          
          <motion.div variants={fadeIn} className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white pl-10"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full md:w-auto px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full md:w-auto px-4 py-3 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={fadeIn} className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl overflow-x-auto">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-gray-400 text-lg">No posts found. Try a different search or category.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-gray-700">
                            {post.imageUrl ? (
                              <img 
                                src={post.imageUrl} 
                                alt={post.title} 
                                className="h-10 w-10 object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = defaultBlogImage;
                                }}
                              />
                            ) : (
                              <div className="h-10 w-10 flex items-center justify-center bg-gray-700 text-gray-400">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{post.title}</div>
                            {post.featured && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-900 text-purple-200">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300 capitalize">{post.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{formatDate(post.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.published ? 'bg-green-900 text-green-200' : 'bg-gray-700 text-gray-300'}`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(post)}
                          className="text-indigo-400 hover:text-indigo-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id, post.imageUrl)}
                          className="text-red-400 hover:text-red-300 mr-4"
                        >
                          Delete
                        </button>
                        <Link
                          to={`/blog/${post.id}`}
                          target="_blank"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="border border-purple-900/50 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-gray-700">
                  <h3 className="text-2xl font-bold text-white">Create New Post</h3>
                </div>
                
                <form onSubmit={handleCreatePost} className="px-6 py-4">
                  {message.text && (
                    <div className={`mb-6 p-3 rounded-lg ${message.type === 'error' ? 'bg-red-900/50 border border-red-500/50 text-red-300' : 'bg-green-900/50 border border-green-500/50 text-green-300'}`}>
                      {message.text}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-gray-300 mb-2 font-medium">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newPost.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="summary" className="block text-gray-300 mb-2 font-medium">
                      Summary
                    </label>
                    <textarea
                      id="summary"
                      name="summary"
                      value={newPost.summary}
                      onChange={handleInputChange}
                      required
                      rows="2"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="content" className="block text-gray-300 mb-2 font-medium">
                      Content
                    </label>
                    <textarea
                      id="content"
                      name="content"
                      value={newPost.content}
                      onChange={handleInputChange}
                      required
                      rows="8"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">Markdown formatting is supported</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="category" className="block text-gray-300 mb-2 font-medium">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={newPost.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="imageUrl" className="block text-gray-300 mb-2 font-medium">
                        Featured Image URL
                      </label>
                      <input
                        type="text"
                        id="imageUrl"
                        name="imageUrl"
                        value={newPost.imageUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter a URL for the featured image or leave blank for default</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="featured"
                        name="featured"
                        checked={newPost.featured}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="featured" className="ml-2 text-gray-300">
                        Featured Post
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="published"
                        name="published"
                        checked={newPost.published}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="published" className="ml-2 text-gray-300">
                        Published
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 border-t border-gray-700 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {formLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : 'Create Post'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Post Modal */}
      {showEditModal && currentPost && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="border border-purple-900/50 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-b border-gray-700">
                  <h3 className="text-2xl font-bold text-white">Edit Post</h3>
                </div>
                
                <form onSubmit={handleUpdatePost} className="px-6 py-4">
                  {message.text && (
                    <div className={`mb-6 p-3 rounded-lg ${message.type === 'error' ? 'bg-red-900/50 border border-red-500/50 text-red-300' : 'bg-green-900/50 border border-green-500/50 text-green-300'}`}>
                      {message.text}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label htmlFor="edit-title" className="block text-gray-300 mb-2 font-medium">
                      Title
                    </label>
                    <input
                      type="text"
                      id="edit-title"
                      name="title"
                      value={currentPost.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="edit-summary" className="block text-gray-300 mb-2 font-medium">
                      Summary
                    </label>
                    <textarea
                      id="edit-summary"
                      name="summary"
                      value={currentPost.summary}
                      onChange={handleInputChange}
                      required
                      rows="2"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    ></textarea>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="edit-content" className="block text-gray-300 mb-2 font-medium">
                      Content
                    </label>
                    <textarea
                      id="edit-content"
                      name="content"
                      value={currentPost.content}
                      onChange={handleInputChange}
                      required
                      rows="8"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">Markdown formatting is supported</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="edit-category" className="block text-gray-300 mb-2 font-medium">
                        Category
                      </label>
                      <select
                        id="edit-category"
                        name="category"
                        value={currentPost.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="edit-imageUrl" className="block text-gray-300 mb-2 font-medium">
                        Featured Image URL
                      </label>
                      <input
                        type="text"
                        id="edit-imageUrl"
                        name="imageUrl"
                        value={currentPost.imageUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter a URL for the featured image or leave blank for default</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-featured"
                        name="featured"
                        checked={currentPost.featured}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="edit-featured" className="ml-2 text-gray-300">
                        Featured Post
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="edit-published"
                        name="published"
                        checked={currentPost.published}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-700 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="edit-published" className="ml-2 text-gray-300">
                        Published
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 border-t border-gray-700 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {formLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : 'Update Post'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}