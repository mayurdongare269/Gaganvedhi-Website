import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero Section with Parallax Stars */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
        {/* Stars background with parallax effect */}
        <div className="absolute inset-0 z-0">
          <div className="stars-small" style={{ transform: `translateY(${scrollY * 0.1}px)` }}></div>
          <div className="stars-medium" style={{ transform: `translateY(${scrollY * 0.2}px)` }}></div>
          <div className="stars-large" style={{ transform: `translateY(${scrollY * 0.3}px)` }}></div>
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-black z-10"></div>
        
        {/* Hero content */}
        <div className="container mx-auto px-4 z-20 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.h1 
              variants={fadeIn}
              className="text-5xl md:text-7xl font-bold mb-6 text-white"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                Gaganvedhi
              </span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl md:text-2xl text-gray-300 mb-8"
            >
              Explore the cosmos with the premier space & astronomy club
            </motion.p>
            
            <motion.div 
              variants={fadeIn}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link 
                to="/about"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-full hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                Discover More
              </Link>
              
              <Link 
                to="/membership"
                className="px-8 py-3 bg-transparent border-2 border-purple-500 text-purple-400 font-medium rounded-full hover:bg-purple-500/10 transition-all duration-300 transform hover:scale-105"
              >
                Join Us
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          >
            <div className="flex flex-col items-center">
              <span className="text-gray-400 mb-2">Scroll to explore</span>
              <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center p-1">
                <motion.div 
                  animate={{ 
                    y: [0, 12, 0],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5 
                  }}
                  className="w-2 h-2 bg-purple-500 rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
            >
              Upcoming <span className="text-purple-500">Events</span>
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Join us for these exciting astronomy events and activities
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Event Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl overflow-hidden border border-purple-900/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 group"
            >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-purple-600 bg-opacity-30 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1465101162946-4377e57745c3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-500 ease-in-out"></div>
                <div className="absolute bottom-0 left-0 p-4 z-20">
                  <span className="bg-purple-600 text-white text-sm font-medium px-3 py-1 rounded-full">Oct 15, 2023</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Meteor Shower Watch Party</h3>
                <p className="text-gray-400 mb-4">Join us for a night of stargazing as we witness the spectacular Orionid meteor shower.</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Campus Observatory</span>
                  <Link to="/events" className="text-purple-400 hover:text-purple-300 font-medium">Learn more →</Link>
                </div>
              </div>
            </motion.div>
            
            {/* Event Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl overflow-hidden border border-purple-900/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 group"
            >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-blue-600 bg-opacity-30 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-500 ease-in-out"></div>
                <div className="absolute bottom-0 left-0 p-4 z-20">
                  <span className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">Nov 5, 2023</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Astrophotography Workshop</h3>
                <p className="text-gray-400 mb-4">Learn how to capture stunning images of the night sky with your DSLR camera.</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Science Building, Room 302</span>
                  <Link to="/events" className="text-blue-400 hover:text-blue-300 font-medium">Learn more →</Link>
                </div>
              </div>
            </motion.div>
            
            {/* Event Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl overflow-hidden border border-purple-900/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 group"
            >
              <div className="h-48 overflow-hidden relative">
                <div className="absolute inset-0 bg-pink-600 bg-opacity-30 z-10"></div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1543722530-d2c3201371e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-500 ease-in-out"></div>
                <div className="absolute bottom-0 left-0 p-4 z-20">
                  <span className="bg-pink-600 text-white text-sm font-medium px-3 py-1 rounded-full">Dec 10, 2023</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">Space Mission Simulation</h3>
                <p className="text-gray-400 mb-4">Experience what it's like to be an astronaut with our interactive space mission simulation.</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Engineering Lab</span>
                  <Link to="/events" className="text-pink-400 hover:text-pink-300 font-medium">Learn more →</Link>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/events"
              className="inline-block px-6 py-3 bg-transparent border border-purple-500 text-purple-400 font-medium rounded-lg hover:bg-purple-500/10 transition-all duration-300"
            >
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                About <span className="text-purple-500">Gaganvedhi</span>
              </h2>
              <p className="text-gray-400 mb-6 text-lg">
                Founded in 2004, Gaganvedhi is the premier astronomy and space exploration club at our college. Our name combines "Gagan" (sky) and "Vedhi" (explorer) from Sanskrit, reflecting our mission to explore the cosmos.
              </p>
              <p className="text-gray-400 mb-6 text-lg">
                We organize stargazing sessions, workshops, lectures, and competitions to foster interest in astronomy and space science among students and the wider community.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-gray-800 px-4 py-2 rounded-lg">
                  <span className="block text-2xl font-bold text-purple-400">50+</span>
                  <span className="text-gray-500 text-sm">Members</span>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg">
                  <span className="block text-2xl font-bold text-blue-400">50+</span>
                  <span className="text-gray-500 text-sm">Events</span>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg">
                  <span className="block text-2xl font-bold text-pink-400">20+</span>
                  <span className="text-gray-500 text-sm">Years Active</span>
                </div>
              </div>
              <Link 
                to="/about"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              >
                Learn More About Us
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl shadow-purple-500/20 border border-purple-500/20">
                <img 
                  src="https://images.unsplash.com/photo-1543722530-d2c3201371e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Gaganvedhi team at observatory" 
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -top-6 -right-6 w-64 h-64 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full filter blur-3xl opacity-20 z-0"></div>
              <div className="absolute -bottom-6 -left-6 w-64 h-64 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full filter blur-3xl opacity-20 z-0"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-4 text-white"
            >
              Latest from our <span className="text-purple-500">Blog</span>
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Discover the latest news, insights, and discoveries from the world of astronomy
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Blog Post 1 */}
            <motion.article
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl overflow-hidden border border-purple-900/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Black hole visualization" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6 flex-grow">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://randomuser.me/api/portraits/women/44.jpg" 
                    alt="Author" 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-white font-medium">Dr. Priya Sharma</p>
                    <p className="text-gray-500 text-sm">Oct 2, 2023 · 8 min read</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 hover:text-purple-400 transition-colors">
                  <Link to="/blog/black-hole-breakthrough">New Breakthrough in Black Hole Research</Link>
                </h3>
                <p className="text-gray-400 mb-4">Scientists have made a groundbreaking discovery about the behavior of matter around supermassive black holes.</p>
              </div>
              <div className="p-6 pt-0 mt-auto">
                <Link to="/blog/black-hole-breakthrough" className="text-purple-400 hover:text-purple-300 font-medium">Read more →</Link>
              </div>
            </motion.article>
            
            {/* Blog Post 2 */}
            <motion.article
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl overflow-hidden border border-purple-900/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Mars rover" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6 flex-grow">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://randomuser.me/api/portraits/men/32.jpg" 
                    alt="Author" 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-white font-medium">Rahul Kapoor</p>
                    <p className="text-gray-500 text-sm">Sep 18, 2023 · 5 min read</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 hover:text-purple-400 transition-colors">
                  <Link to="/blog/mars-rover-discovery">Mars Rover Makes Surprising Discovery</Link>
                </h3>
                <p className="text-gray-400 mb-4">The Perseverance rover has found evidence that suggests Mars once had conditions suitable for microbial life.</p>
              </div>
              <div className="p-6 pt-0 mt-auto">
                <Link to="/blog/mars-rover-discovery" className="text-purple-400 hover:text-purple-300 font-medium">Read more →</Link>
              </div>
            </motion.article>
            
            {/* Blog Post 3 */}
            <motion.article
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl overflow-hidden border border-purple-900/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 flex flex-col h-full"
            >
              <div className="h-48 overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="Northern lights" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-6 flex-grow">
                <div className="flex items-center mb-4">
                  <img 
                    src="https://randomuser.me/api/portraits/women/68.jpg" 
                    alt="Author" 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="text-white font-medium">Ananya Desai</p>
                    <p className="text-gray-500 text-sm">Aug 30, 2023 · 6 min read</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-3 hover:text-purple-400 transition-colors">
                  <Link to="/blog/aurora-guide">A Beginner's Guide to Aurora Watching</Link>
                </h3>
                <p className="text-gray-400 mb-4">Everything you need to know about spotting and photographing the mesmerizing Northern and Southern Lights.</p>
              </div>
              <div className="p-6 pt-0 mt-auto">
                <Link to="/blog/aurora-guide" className="text-purple-400 hover:text-purple-300 font-medium">Read more →</Link>
              </div>
            </motion.article>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/blog"
              className="inline-block px-6 py-3 bg-transparent border border-purple-500 text-purple-400 font-medium rounded-lg hover:bg-purple-500/10 transition-all duration-300"
            >
              View All Posts
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background with stars and nebula effect */}
        <div className="absolute inset-0 bg-black">
          <div className="stars-small opacity-50"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/30"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center bg-gray-900/80 backdrop-blur-lg p-10 rounded-2xl border border-purple-500/20 shadow-2xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to <span className="text-purple-500">Explore</span> the Universe?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join Gaganvedhi today and become part of our community of space enthusiasts and astronomy lovers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/membership"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                Become a Member
              </Link>
              
              <Link 
                to="/contact"
                className="px-8 py-4 bg-transparent border-2 border-purple-500 text-purple-400 font-medium rounded-lg hover:bg-purple-500/10 transition-all duration-300 transform hover:scale-105"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
