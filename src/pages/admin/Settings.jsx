import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiSave, FiAlertCircle } from 'react-icons/fi';

const Settings = () => {
  // State for settings data and UI controls
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'GaganVedhi',
    siteDescription: 'Astronomy and Space Exploration Community',
    contactEmail: 'contact@gaganvedhi.com',
    phoneNumber: '+91 1234567890',
    address: 'Bangalore, Karnataka, India',
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: 'https://facebook.com/gaganvedhi',
    twitter: 'https://twitter.com/gaganvedhi',
    instagram: 'https://instagram.com/gaganvedhi',
    youtube: 'https://youtube.com/gaganvedhi',
    linkedin: 'https://linkedin.com/company/gaganvedhi',
  });

  const [featuredContent, setFeaturedContent] = useState({
    enableFeaturedEvents: true,
    enableFeaturedPosts: true,
    maxFeaturedEvents: 3,
    maxFeaturedPosts: 4,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [activeTab, setActiveTab] = useState('general');

  const { currentUser, userData } = useAuth();

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  // Fetch settings from Firestore
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'siteSettings'));
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        
        // Update state with fetched data
        if (data.general) setGeneralSettings(data.general);
        if (data.social) setSocialLinks(data.social);
        if (data.featured) setFeaturedContent(data.featured);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ text: 'Failed to load settings', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes for general settings
  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form input changes for social links
  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setSocialLinks(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form input changes for featured content settings
  const handleFeaturedChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFeaturedContent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseInt(value, 10)
    }));
  };

  // Save settings to Firestore
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    
    try {
      await updateDoc(doc(db, 'settings', 'siteSettings'), {
        general: generalSettings,
        social: socialLinks,
        featured: featuredContent,
        updatedAt: new Date(),
        updatedBy: currentUser.uid
      });
      
      setMessage({ text: 'Settings saved successfully', type: 'success' });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setIsSaving(false);
    }
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
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Page header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Site Settings</h1>
          <p className="text-gray-400 mt-1">Configure your website settings</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={isSaving || isLoading}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <FiSave className="mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </motion.div>

      {/* Message display */}
      {message.text && (
        <motion.div 
          className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {message.text}
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        <motion.div variants={itemVariants} className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              className={`px-6 py-3 font-medium ${activeTab === 'general' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('general')}
            >
              General
            </button>
            <button
              className={`px-6 py-3 font-medium ${activeTab === 'social' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('social')}
            >
              Social Media
            </button>
            <button
              className={`px-6 py-3 font-medium ${activeTab === 'featured' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('featured')}
            >
              Featured Content
            </button>
          </div>

          {/* Tab content */}
          <div className="p-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Site Name</label>
                  <input
                    type="text"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Site Description</label>
                  <textarea
                    name="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={handleGeneralChange}
                    rows="2"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={generalSettings.phoneNumber}
                    onChange={handleGeneralChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={generalSettings.address}
                    onChange={handleGeneralChange}
                    rows="2"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  ></textarea>
                </div>
              </div>
            )}

            {/* Social Media Settings */}
            {activeTab === 'social' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Facebook</label>
                  <input
                    type="url"
                    name="facebook"
                    value={socialLinks.facebook}
                    onChange={handleSocialChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Twitter</label>
                  <input
                    type="url"
                    name="twitter"
                    value={socialLinks.twitter}
                    onChange={handleSocialChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
                  <input
                    type="url"
                    name="instagram"
                    value={socialLinks.instagram}
                    onChange={handleSocialChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">YouTube</label>
                  <input
                    type="url"
                    name="youtube"
                    value={socialLinks.youtube}
                    onChange={handleSocialChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://youtube.com/yourchannel"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={socialLinks.linkedin}
                    onChange={handleSocialChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </div>
            )}

            {/* Featured Content Settings */}
            {activeTab === 'featured' && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableFeaturedEvents"
                    name="enableFeaturedEvents"
                    checked={featuredContent.enableFeaturedEvents}
                    onChange={handleFeaturedChange}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="enableFeaturedEvents" className="ml-2 text-sm text-gray-300">
                    Enable Featured Events on Homepage
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="enableFeaturedPosts"
                    name="enableFeaturedPosts"
                    checked={featuredContent.enableFeaturedPosts}
                    onChange={handleFeaturedChange}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="enableFeaturedPosts" className="ml-2 text-sm text-gray-300">
                    Enable Featured Posts on Homepage
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Maximum Featured Events</label>
                  <input
                    type="number"
                    name="maxFeaturedEvents"
                    value={featuredContent.maxFeaturedEvents}
                    onChange={handleFeaturedChange}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Maximum Featured Posts</label>
                  <input
                    type="number"
                    name="maxFeaturedPosts"
                    value={featuredContent.maxFeaturedPosts}
                    onChange={handleFeaturedChange}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-start">
                    <FiAlertCircle className="text-yellow-400 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-300">
                      Featured content settings control what appears on your homepage. 
                      Featured events and posts must be marked as featured in their respective management pages.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Settings;