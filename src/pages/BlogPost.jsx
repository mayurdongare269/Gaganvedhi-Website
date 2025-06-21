import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FiCalendar, FiUser, FiTag, FiArrowLeft, FiShare2, FiMessageCircle } from 'react-icons/fi';

const BlogPost = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
  }, [postId]);

  const fetchPost = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const postDoc = await getDoc(doc(db, 'posts', id));
      
      if (postDoc.exists()) {
        const postData = {
          id: postDoc.id,
          ...postDoc.data(),
          createdAt: postDoc.data().createdAt?.toDate() || new Date()
        };
        
        setPost(postData);
        
        // Fetch related posts in the same category
        if (postData.category) {
          fetchRelatedPosts(postData.category, id);
        }
      } else {
        setError('Post not found');
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Failed to load the post. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedPosts = async (category, currentPostId) => {
    try {
      const relatedQuery = query(
        collection(db, 'posts'),
        where('category', '==', category),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      
      const relatedSnapshot = await getDocs(relatedQuery);
      const relatedData = relatedSnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }))
        .filter(post => post.id !== currentPostId); // Exclude current post
      
      setRelatedPosts(relatedData);
    } catch (err) {
      console.error('Error fetching related posts:', err);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Truncate text for summaries
  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Handle share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.summary || 'Check out this interesting post!',
        url: window.location.href
      })
      .catch(err => console.error('Error sharing:', err));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Error copying to clipboard:', err));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-8 rounded-lg text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">{error}</h2>
            <p className="mb-6">The post you're looking for might have been removed or is temporarily unavailable.</p>
            <Link 
              to="/blog" 
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              <FiArrowLeft className="mr-2" /> Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section with Post Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {post.imageUrl ? (
            <>
              <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-gray-900"></div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/70 to-gray-900"></div>
          )}
          <div className="absolute inset-0 bg-[url('/images/stars-bg.jpg')] bg-cover opacity-20 mix-blend-overlay"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Link 
              to="/blog" 
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-200 mb-6"
            >
              <FiArrowLeft className="mr-2" /> Back to Blog
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap justify-center items-center text-gray-300 space-x-4 mb-6">
              <div className="flex items-center">
                <FiCalendar className="mr-2" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
              
              <div className="flex items-center">
                <FiUser className="mr-2" />
                <span>{post.authorName || 'GaganVedhi Team'}</span>
              </div>
              
              <div className="flex items-center">
                <FiTag className="mr-2" />
                <span className="capitalize">{post.category}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Post Content */}
            <motion.div 
              className="w-full md:w-2/3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <article className="bg-gray-800 rounded-xl p-8 shadow-lg">
                {/* Post summary */}
                {post.summary && (
                  <div className="mb-8 text-xl text-gray-300 font-light italic border-l-4 border-purple-500 pl-4">
                    {post.summary}
                  </div>
                )}
                
                {/* Post content */}
                <div className="prose prose-lg prose-invert max-w-none">
                  {/* Render content paragraphs */}
                  {post.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-6">{paragraph}</p>
                  ))}
                </div>
                
                {/* Post actions */}
                <div className="mt-10 pt-6 border-t border-gray-700 flex justify-between items-center">
                  <div className="flex space-x-4">
                    <button 
                      onClick={handleShare}
                      className="flex items-center text-gray-400 hover:text-purple-400 transition-colors duration-200"
                    >
                      <FiShare2 className="mr-2" /> Share
                    </button>
                    
                    <button className="flex items-center text-gray-400 hover:text-purple-400 transition-colors duration-200">
                      <FiMessageCircle className="mr-2" /> Comment
                    </button>
                  </div>
                  
                  <Link 
                    to="/blog" 
                    className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
                  >
                    Back to Blog
                  </Link>
                </div>
              </article>
            </motion.div>
            
            {/* Sidebar */}
            <div className="w-full md:w-1/3 space-y-8">
              {/* Author Info */}
              <motion.div 
                className="bg-gray-800 rounded-xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">About the Author</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-purple-700 flex items-center justify-center mr-4">
                    <span className="text-lg font-bold">
                      {(post.authorName || 'G').charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">{post.authorName || 'GaganVedhi Team'}</h4>
                    <p className="text-sm text-gray-400">Astronomy Enthusiast</p>
                  </div>
                </div>
              </motion.div>
              
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <motion.div 
                  className="bg-gray-800 rounded-xl p-6 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Related Posts</h3>
                  <div className="space-y-4">
                    {relatedPosts.map((relatedPost) => (
                      <Link 
                        key={relatedPost.id} 
                        to={`/blog/${relatedPost.id}`}
                        className="block group"
                      >
                        <div className="flex items-start">
                          {relatedPost.imageUrl ? (
                            <img 
                              src={relatedPost.imageUrl} 
                              alt={relatedPost.title} 
                              className="w-16 h-16 object-cover rounded-lg mr-3"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-800 to-blue-800 rounded-lg flex items-center justify-center mr-3">
                              <span className="text-lg font-bold opacity-50">{relatedPost.title.charAt(0)}</span>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium group-hover:text-purple-400 transition-colors duration-200">
                              {relatedPost.title}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {formatDate(relatedPost.createdAt)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
              
              {/* Newsletter Signup */}
              <motion.div 
                className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-bold mb-4">Subscribe to Our Newsletter</h3>
                <p className="text-gray-300 mb-4">Stay updated with the latest astronomy news and events.</p>
                
                <form className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Subscribe
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;