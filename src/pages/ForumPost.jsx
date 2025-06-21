import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../firebase';
import { FiArrowLeft, FiUser, FiClock, FiMessageCircle, FiSend, FiThumbsUp } from 'react-icons/fi';

const ForumPost = () => {
  const { postId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Categories for reference
  const categories = [
    { id: 'general', name: 'General' },
    { id: 'astronomy', name: 'Astronomy' },
    { id: 'space-exploration', name: 'Space Exploration' },
    { id: 'astrophotography', name: 'Astrophotography' },
    { id: 'events', name: 'Events' },
    { id: 'equipment', name: 'Equipment' },
    { id: 'science', name: 'Science' }
  ];

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const postRef = doc(db, 'discussions', postId);
        const postSnap = await getDoc(postRef);
        
        if (!postSnap.exists()) {
          setError('Discussion not found');
          setIsLoading(false);
          return;
        }
        
        const postData = {
          id: postSnap.id,
          ...postSnap.data(),
          createdAt: postSnap.data().createdAt?.toDate() || new Date(),
          comments: postSnap.data().comments || []
        };
        
        // Update view count
        await updateDoc(postRef, {
          viewsCount: increment(1)
        });
        
        setPost(postData);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load discussion. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  // Handle adding a new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to comment');
      return;
    }
    
    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const commentData = {
        content: newComment.trim(),
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName || 'Anonymous',
        userPhotoURL: currentUser.photoURL || '',
        createdAt: serverTimestamp(),
        likes: []
      };
      
      const postRef = doc(db, 'discussions', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(commentData)
      });
      
      // Update local state
      setPost(prev => ({
        ...prev,
        comments: [...prev.comments, {
          ...commentData,
          createdAt: new Date()
        }]
      }));
      
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle liking a post
  const handleLikePost = async () => {
    if (!currentUser) {
      setError('You must be logged in to like posts');
      return;
    }
    
    try {
      const postRef = doc(db, 'discussions', postId);
      await updateDoc(postRef, {
        likesCount: increment(1)
      });
      
      // Update local state
      setPost(prev => ({
        ...prev,
        likesCount: (prev.likesCount || 0) + 1
      }));
    } catch (err) {
      console.error('Error liking post:', err);
      setError('Failed to like post. Please try again.');
    }
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

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
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
          className="max-w-4xl mx-auto"
        >
          {/* Back button */}
          <motion.div variants={fadeIn} className="mb-8">
            <Link 
              to="/forum"
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to Forum
            </Link>
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
          
          {isLoading ? (
            // Loading Skeleton
            <motion.div variants={fadeIn} className="space-y-6">
              <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 animate-pulse shadow-lg border border-gray-700/50">
                <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-6"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3 mb-6"></div>
                <div className="h-10 bg-gray-700 rounded w-full"></div>
              </div>
            </motion.div>
          ) : post ? (
            <>
              {/* Discussion Post */}
              <motion.div 
                variants={fadeIn}
                className="bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-purple-900/30 mb-8 shadow-lg"
              >
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {post.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center text-sm text-gray-400 mb-6 gap-2">
                    <span className="px-3 py-1 bg-gray-700/80 rounded-full text-xs font-medium">
                      {categories.find(c => c.id === post.category)?.name || 'General'}
                    </span>
                    
                    <div className="flex items-center ml-0 md:ml-3">
                      <FiUser className="mr-1" />
                      <span>{post.userDisplayName || 'Anonymous'}</span>
                    </div>
                    
                    <div className="flex items-center ml-3">
                      <FiClock className="mr-1" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center ml-3">
                      <FiMessageCircle className="mr-1" />
                      <span>{post.comments?.length || 0} comments</span>
                    </div>
                  </div>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 whitespace-pre-line leading-relaxed">{post.content}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                  <div className="flex items-center">
                    <button 
                      onClick={handleLikePost}
                      className="flex items-center text-gray-400 hover:text-purple-400 transition-colors px-3 py-1 rounded-full hover:bg-gray-700/50"
                      disabled={!currentUser}
                    >
                      <FiThumbsUp className="mr-1" />
                      <span>{post.likesCount || 0}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
              
              {/* Comments Section */}
              <motion.div variants={fadeIn} className="mb-8">
                <h3 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Comments ({post.comments?.length || 0})</h3>
                
                {post.comments && post.comments.length > 0 ? (
                  <div className="space-y-4">
                    {post.comments.map((comment, index) => (
                      <div 
                        key={index}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 shadow-md hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="flex items-start mb-2">
                          <div className="flex-shrink-0 mr-3">
                            {comment.userPhotoURL ? (
                              <img 
                                src={comment.userPhotoURL} 
                                alt={comment.userDisplayName || 'User'}
                                className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-md">
                                <span className="text-white font-medium">
                                  {(comment.userDisplayName || 'A')[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-white">
                                {comment.userDisplayName || 'Anonymous'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            
                            <p className="text-gray-300 whitespace-pre-line leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-800/50 rounded-lg shadow-md border border-gray-700/50">
                    <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </motion.div>
              
              {/* Add Comment Form */}
              <motion.div variants={fadeIn}>
                <h3 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Add a Comment</h3>
                
                {currentUser ? (
                  <form onSubmit={handleAddComment} className="bg-gray-800/50 rounded-lg p-5 shadow-lg border border-gray-700/50">
                    <div className="mb-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows="4"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white shadow-inner"
                        placeholder="Write your comment here..."
                        required
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/20"
                      >
                        {isSubmitting ? (
                          <span>Posting...</span>
                        ) : (
                          <>
                            <FiSend className="mr-2" />
                            Post Comment
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gray-800/50 rounded-lg p-6 text-center shadow-lg border border-gray-700/50">
                    <p className="text-gray-300 mb-4">You need to be logged in to comment</p>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/20"
                    >
                      Log In
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          ) : (
            <motion.div variants={fadeIn} className="text-center py-12 bg-gray-800/50 rounded-xl shadow-lg border border-gray-700/50">
              <h3 className="text-xl font-medium mb-4">Discussion not found</h3>
              <p className="text-gray-400 mb-6">The discussion you're looking for doesn't exist or has been removed.</p>
              <Link 
                to="/forum"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-purple-500/20"
              >
                Back to Forum
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForumPost;