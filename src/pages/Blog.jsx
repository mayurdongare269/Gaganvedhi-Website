import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { FiCalendar, FiUser, FiTag, FiArrowRight } from 'react-icons/fi';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [categories, setCategories] = useState(['astronomy', 'space exploration', 'astrophotography', 'events', 'news']);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Query for featured posts (limit to 3)
      const featuredQuery = query(
        collection(db, 'posts'),
        where('featured', '==', true),
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      
      // Query for all posts or filtered by category
      let postsQuery;
      if (selectedCategory === 'all') {
        postsQuery = query(
          collection(db, 'posts'),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );
      } else {
        postsQuery = query(
          collection(db, 'posts'),
          where('category', '==', selectedCategory),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );
      }

      // Get featured posts
      const featuredSnapshot = await getDocs(featuredQuery);
      const featuredData = featuredSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      
      // Get regular posts
      const postsSnapshot = await getDocs(postsQuery);
      const postsData = postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      setFeaturedPosts(featuredData);
      setPosts(postsData);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setIsLoading(false);
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
  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/70 to-gray-900"></div>
          <div className="absolute inset-0 bg-[url('/images/stars-bg.jpg')] bg-cover opacity-30 mix-blend-overlay"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Cosmic Chronicles
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Explore the wonders of the universe through our collection of astronomy articles, space news, and celestial discoveries.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Featured Articles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <motion.div 
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300"
                >
                  {post.imageUrl ? (
                    <img 
                      src={post.imageUrl} 
                      alt={post.title} 
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-purple-800 to-blue-800 flex items-center justify-center">
                      <span className="text-4xl font-bold opacity-30">{post.title.charAt(0)}</span>
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-400 mb-2">
                      <FiCalendar className="mr-2" />
                      <span>{formatDate(post.createdAt)}</span>
                      <span className="mx-2">•</span>
                      <FiTag className="mr-2" />
                      <span className="capitalize">{post.category}</span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 text-purple-300">{post.title}</h3>
                    
                    <p className="text-gray-400 mb-4">
                      {truncateText(post.summary || post.content)}
                    </p>
                    
                    <Link 
                      to={`/blog/${post.id}`} 
                      className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-200"
                    >
                      Read More <FiArrowRight className="ml-2" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Blog Posts */}
            <motion.div 
              className="w-full md:w-2/3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg">
                  {error}
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-gray-800 p-8 rounded-lg text-center">
                  <p className="text-xl text-gray-400">
                    {selectedCategory === 'all' 
                      ? 'No blog posts found. Check back soon for new content!' 
                      : `No posts found in the "${selectedCategory}" category.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-10">
                  {posts.map((post) => (
                    <motion.article 
                      key={post.id} 
                      className="bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300"
                      variants={itemVariants}
                    >
                      <div className="md:flex">
                        {post.imageUrl && (
                          <div className="md:w-1/3">
                            <img 
                              src={post.imageUrl} 
                              alt={post.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        <div className={`p-6 ${post.imageUrl ? 'md:w-2/3' : 'w-full'}`}>
                          <div className="flex items-center text-sm text-gray-400 mb-2">
                            <FiCalendar className="mr-2" />
                            <span>{formatDate(post.createdAt)}</span>
                            <span className="mx-2">•</span>
                            <FiUser className="mr-2" />
                            <span>{post.authorName || 'GaganVedhi Team'}</span>
                          </div>
                          
                          <h2 className="text-2xl font-bold mb-3 text-purple-300">{post.title}</h2>
                          
                          <div className="mb-2">
                            <span className="inline-block bg-purple-900 text-purple-200 text-xs px-2 py-1 rounded-full capitalize">
                              {post.category}
                            </span>
                          </div>
                          
                          <p className="text-gray-300 mb-4">
                            {truncateText(post.summary || post.content, 200)}
                          </p>
                          
                          <Link 
                            to={`/blog/${post.id}`} 
                            className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-200"
                          >
                            Read More <FiArrowRight className="ml-2" />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </motion.div>
            
            {/* Sidebar */}
            <div className="w-full md:w-1/3 space-y-8">
              {/* Categories */}
              <motion.div 
                className="bg-gray-800 rounded-xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${selectedCategory === 'all' ? 'bg-purple-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                  >
                    All Categories
                  </button>
                  
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 capitalize ${selectedCategory === category ? 'bg-purple-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </motion.div>
              
              {/* Newsletter Signup */}
              <motion.div 
                className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
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

export default Blog;