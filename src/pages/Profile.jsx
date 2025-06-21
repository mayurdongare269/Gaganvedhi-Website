import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Profile() {
  const { currentUser, updateUserProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    photoURL: '',
    bio: '',
    location: '',
    interests: [],
    socialLinks: {
      website: '',
      twitter: '',
      instagram: '',
      linkedin: ''
    }
  });
  
  // Default profile image
  const defaultProfileImage = 'https://i.imgur.com/HeIi0wU.png';
  
  // Interest options
  const interestOptions = [
    'Stargazing',
    'Astrophotography',
    'Planetary Science',
    'Cosmology',
    'Space Exploration',
    'Telescope Operation',
    'Astronomy Education',
    'Research'
  ];
  
  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get user data from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          setProfileData({
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            bio: userData.bio || '',
            location: userData.location || '',
            interests: userData.interests || [],
            socialLinks: userData.socialLinks || {
              website: '',
              twitter: '',
              instagram: '',
              linkedin: ''
            }
          });
        } else {
          // If user document doesn't exist yet, just use auth data
          setProfileData({
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            bio: '',
            location: '',
            interests: [],
            socialLinks: {
              website: '',
              twitter: '',
              instagram: '',
              linkedin: ''
            }
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load profile data. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects (social links)
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle interest selection
  const handleInterestChange = (interest) => {
    setProfileData(prev => {
      const updatedInterests = prev.interests.includes(interest)
        ? prev.interests.filter(item => item !== interest)
        : [...prev.interests, interest];
      
      return {
        ...prev,
        interests: updatedInterests
      };
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      // Use the provided photoURL or default if empty
      const photoURL = profileData.photoURL || defaultProfileImage;
      
      // Update auth profile
      await updateUserProfile({
        displayName: profileData.displayName,
        photoURL: photoURL
      });
      
      // Update Firestore profile
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: profileData.displayName,
        photoURL: photoURL,
        bio: profileData.bio,
        location: profileData.location,
        interests: profileData.interests,
        socialLinks: profileData.socialLinks,
        updatedAt: new Date()
      });
      
      if (!message.type) {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully!'
        });
      }
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
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
  
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to view your profile</h2>
          <p className="text-gray-400">You need to be logged in to access this page.</p>
        </div>
      </div>
    );
  }
  
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
          <motion.div variants={fadeIn} className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Your <span className="text-gradient">Profile</span></h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Manage your personal information and preferences
            </p>
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
          
          <motion.div
            variants={fadeIn}
            className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-8 border border-purple-900/50 shadow-xl"
          >
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* Profile Image Section */}
                <div className="col-span-1 flex flex-col items-center">
                  <div className="relative w-40 h-40 mb-4">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-purple-500/50 shadow-lg shadow-purple-500/20">
                      <img 
                        src={profileData.photoURL || defaultProfileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = defaultProfileImage;
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label htmlFor="photoURL" className="block text-gray-300 mb-2 text-center">
                      Profile Image URL
                    </label>
                    <input
                      type="text"
                      id="photoURL"
                      name="photoURL"
                      value={profileData.photoURL}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white text-sm"
                      placeholder="https://example.com/your-image.jpg"
                    />
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Enter a URL for your profile image or leave blank for default
                    </p>
                  </div>
                </div>
                
                {/* Basic Info Section */}
                <div className="col-span-2 space-y-6">
                  <div>
                    <label htmlFor="displayName" className="block text-gray-300 mb-2 font-medium">
                      Display Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-300 mb-2 font-medium">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label htmlFor="bio" className="block text-gray-300 mb-2 font-medium">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      placeholder="Tell us a bit about yourself..."
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-gray-300 mb-2 font-medium">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={profileData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      placeholder="City, State, Country"
                    />
                  </div>
                </div>
              </div>
              
              {/* Interests Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
                  Astronomy Interests
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {interestOptions.map((interest) => (
                    <div key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`interest-${interest}`}
                        checked={profileData.interests.includes(interest)}
                        onChange={() => handleInterestChange(interest)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor={`interest-${interest}`} className="ml-2 text-gray-300">
                        {interest}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Social Links Section */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
                  Social Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="website" className="block text-gray-300 mb-2">
                      Website
                    </label>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                      <span className="bg-gray-800 px-3 py-3 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </span>
                      <input
                        type="url"
                        id="website"
                        name="socialLinks.website"
                        value={profileData.socialLinks.website}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 bg-transparent focus:outline-none focus:ring-0 text-white"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="twitter" className="block text-gray-300 mb-2">
                      Twitter
                    </label>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                      <span className="bg-gray-800 px-3 py-3 text-gray-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="twitter"
                        name="socialLinks.twitter"
                        value={profileData.socialLinks.twitter}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 bg-transparent focus:outline-none focus:ring-0 text-white"
                        placeholder="@username"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="instagram" className="block text-gray-300 mb-2">
                      Instagram
                    </label>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                      <span className="bg-gray-800 px-3 py-3 text-gray-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="instagram"
                        name="socialLinks.instagram"
                        value={profileData.socialLinks.instagram}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 bg-transparent focus:outline-none focus:ring-0 text-white"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="linkedin" className="block text-gray-300 mb-2">
                      LinkedIn
                    </label>
                    <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
                      <span className="bg-gray-800 px-3 py-3 text-gray-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </span>
                      <input
                        type="text"
                        id="linkedin"
                        name="socialLinks.linkedin"
                        value={profileData.socialLinks.linkedin}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 bg-transparent focus:outline-none focus:ring-0 text-white"
                        placeholder="username"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Profile...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}