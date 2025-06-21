import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Membership() {
  const { currentUser } = useAuth();
  
  // State for membership tier selection
  const [selectedTier, setSelectedTier] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    occupation: '',
    interests: [],
    referral: '',
    agreeToTerms: false
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  // Membership tiers
  const membershipTiers = [
    {
      id: 'explorer',
      name: 'Explorer',
      price: '₹1,200',
      period: 'per year',
      description: 'Perfect for beginners and casual astronomy enthusiasts.',
      features: [
        'Access to monthly stargazing events',
        'Digital newsletter subscription',
        'Online community access',
        'Discounted workshop rates',
        'Basic astronomy resources'
      ],
      recommended: false
    },
    {
      id: 'voyager',
      name: 'Voyager',
      price: '₹2,500',
      period: 'per year',
      description: 'For dedicated astronomy enthusiasts seeking deeper engagement.',
      features: [
        'All Explorer benefits',
        'Priority registration for events',
        'Access to specialized equipment',
        'Quarterly astrophotography sessions',
        'Member-exclusive workshops',
        'Personalized observation plans'
      ],
      recommended: true
    },
    {
      id: 'pioneer',
      name: 'Pioneer',
      price: '₹5,000',
      period: 'per year',
      description: 'Our premium tier for serious astronomers and researchers.',
      features: [
        'All Voyager benefits',
        'Advanced telescope access',
        'Research project participation',
        'Mentorship opportunities',
        'Observatory facility access',
        'Annual astronomy retreat',
        'Contribution acknowledgment'
      ],
      recommended: false
    }
  ];

  // Interest options
  const interestOptions = [
    'Stargazing',
    'Astrophotography',
    'Planetary Science',
    'Cosmology',
    'Space Exploration',
    'Telescope Operation',
    'Astronomy Education',
    'Research',
    'Other'
  ];

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'agreeToTerms') {
        setFormData(prevData => ({
          ...prevData,
          [name]: checked
        }));
      } else if (name.startsWith('interest-')) {
        const interest = name.replace('interest-', '');
        setFormData(prevData => {
          const updatedInterests = checked 
            ? [...prevData.interests, interest]
            : prevData.interests.filter(item => item !== interest);
          
          return {
            ...prevData,
            interests: updatedInterests
          };
        });
      }
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  // Handle tier selection
  const handleTierSelect = (tierId) => {
    setSelectedTier(tierId);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTier) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'Please select a membership tier.'
      });
      return;
    }
    
    // Set loading state
    setFormStatus({
      submitted: true,
      success: false,
      message: 'Processing your application...'
    });
    
    try {
      // Import Firebase functions
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      
      // Submit to Firebase
      await addDoc(collection(db, "membershipApplications"), {
        ...formData,
        selectedTier,
        userId: currentUser?.uid || null,
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      
      // Show success message
      setFormStatus({
        submitted: true,
        success: true,
        message: 'Thank you for your application! We will contact you shortly with next steps.'
      });
      
      // Reset form after successful submission
      setFormData({
        firstName: '',
        lastName: '',
        email: currentUser?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        occupation: '',
        interests: [],
        referral: '',
        agreeToTerms: false
      });
      
      setSelectedTier(null);
    } catch (error) {
      console.error("Error submitting application:", error);
      setFormStatus({
        submitted: true,
        success: false,
        message: 'There was an error processing your application. Please try again.'
      });
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
        staggerChildren: 0.2
      }
    }
  };

  const tierCardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: { 
      y: -10, 
      boxShadow: '0 25px 50px -12px rgba(124, 58, 237, 0.25)',
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background with stars */}
        <div className="absolute inset-0 z-0">
          <div className="stars-small opacity-50"></div>
          <div className="stars-medium opacity-30"></div>
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-transparent to-black z-10"></div>
        
        <div className="container mx-auto px-4 relative z-20 pt-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.h1 
              variants={fadeIn}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Join Our <span className="text-gradient">Cosmic Community</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Become a member of Gaganvedhi and embark on an incredible journey through the cosmos. Enjoy exclusive benefits, participate in special events, and connect with fellow astronomy enthusiasts.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Membership Tiers Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl font-bold mb-4 text-white"
            >
              Membership <span className="text-purple-500">Tiers</span>
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Choose the membership level that best suits your astronomical journey
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {membershipTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                viewport={{ once: true }}
                variants={tierCardVariants}
                transition={{ delay: index * 0.1 }}
                className={`bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl overflow-hidden border ${selectedTier === tier.id ? 'border-purple-500' : 'border-purple-900/50'} shadow-xl relative`}
              >
                {tier.recommended && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 text-sm font-medium">
                    Recommended
                  </div>
                )}
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                  <div className="flex items-end mb-4">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    <span className="text-gray-400 ml-1">{tier.period}</span>
                  </div>
                  <p className="text-gray-300 mb-6">{tier.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg className="w-5 h-5 text-purple-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => handleTierSelect(tier.id)}
                    className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${selectedTier === tier.id ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                  >
                    {selectedTier === tier.id ? 'Selected' : 'Select'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Benefits Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl font-bold mb-4 text-white"
            >
              Membership <span className="text-purple-500">Benefits</span>
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Discover the advantages of being part of our astronomy community
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Benefit 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Educational Resources</h3>
              <p className="text-gray-400 text-center">
                Access to exclusive astronomy guides, tutorials, and educational materials to enhance your knowledge of the cosmos.
              </p>
            </motion.div>
            
            {/* Benefit 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Community Access</h3>
              <p className="text-gray-400 text-center">
                Join a vibrant community of astronomy enthusiasts, participate in discussions, and share your observations and experiences.
              </p>
            </motion.div>
            
            {/* Benefit 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Exclusive Events</h3>
              <p className="text-gray-400 text-center">
                Priority access to stargazing events, workshops, and special astronomical observations not available to the general public.
              </p>
            </motion.div>
            
            {/* Benefit 4 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Equipment Access</h3>
              <p className="text-gray-400 text-center">
                Use of club telescopes, cameras, and other astronomical equipment for your personal observations and astrophotography projects.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl font-bold mb-4 text-white"
            >
              Membership <span className="text-purple-500">Application</span>
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Fill out the form below to apply for membership
            </motion.p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-8 border border-purple-900/50 shadow-xl"
          >
            {formStatus.submitted ? (
              <div className={`p-6 rounded-lg mb-6 ${formStatus.success ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'} text-center`}>
                <p className="text-xl font-medium mb-2">{formStatus.message}</p>
                {formStatus.success && (
                  <button
                    onClick={() => setFormStatus({ submitted: false, success: false, message: '' })}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  >
                    Apply for Another Membership
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Selected Tier Display */}
                {selectedTier && (
                  <div className="mb-8 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Selected Tier: <span className="text-purple-400">
                        {membershipTiers.find(tier => tier.id === selectedTier)?.name}
                      </span>
                    </h3>
                    <p className="text-gray-300">
                      {membershipTiers.find(tier => tier.id === selectedTier)?.price} {membershipTiers.find(tier => tier.id === selectedTier)?.period}
                    </p>
                  </div>
                )}
                
                {/* Personal Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-gray-300 mb-2">First Name*</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-gray-300 mb-2">Last Name*</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-gray-300 mb-2">Email Address*</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-gray-300 mb-2">Phone Number*</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Address Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Address Information</h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="address" className="block text-gray-300 mb-2">Street Address*</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label htmlFor="city" className="block text-gray-300 mb-2">City*</label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="state" className="block text-gray-300 mb-2">State*</label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="zipCode" className="block text-gray-300 mb-2">ZIP Code*</label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Information */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-4">Additional Information</h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="occupation" className="block text-gray-300 mb-2">Occupation</label>
                      <input
                        type="text"
                        id="occupation"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-2">Astronomy Interests (Select all that apply)</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {interestOptions.map((interest) => (
                          <div key={interest} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`interest-${interest}`}
                              name={`interest-${interest}`}
                              checked={formData.interests.includes(interest)}
                              onChange={handleChange}
                              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                            />
                            <label htmlFor={`interest-${interest}`} className="ml-2 text-gray-300">
                              {interest}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="referral" className="block text-gray-300 mb-2">How did you hear about us?</label>
                      <select
                        id="referral"
                        name="referral"
                        value={formData.referral}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      >
                        <option value="">Please select</option>
                        <option value="friend">Friend or Family</option>
                        <option value="social">Social Media</option>
                        <option value="search">Search Engine</option>
                        <option value="event">Public Event</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Terms and Conditions */}
                <div className="mb-8">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      required
                      className="w-4 h-4 mt-1 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="agreeToTerms" className="ml-2 text-gray-300">
                      I agree to the <a href="#" className="text-purple-400 hover:text-purple-300 underline">Terms and Conditions</a> and <a href="#" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</a>. I understand that my personal information will be processed as described in the Privacy Policy.
                    </label>
                  </div>
                </div>
                
                {/* Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl font-bold mb-4 text-white"
            >
              What Our <span className="text-purple-500">Members Say</span>
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Hear from our community of astronomy enthusiasts
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Testimonial 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl"
            >
              <div className="flex items-center mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1628563694622-5a76957fd09c?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5zdGFncmFtJTIwcHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D" 
                  alt="Member" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold text-white">Aditya Patel</h4>
                  <p className="text-purple-400">Explorer Member</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "Joining Gaganvedhi has been an incredible experience. The monthly stargazing events have opened my eyes to the wonders of the night sky, and the community is so welcoming and knowledgeable."
              </p>
            </motion.div>
            
            {/* Testimonial 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl"
            >
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/women/54.jpg" 
                  alt="Member" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold text-white">Meera Sharma</h4>
                  <p className="text-purple-400">Voyager Member</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "The Voyager membership has been worth every rupee. The astrophotography sessions have helped me capture stunning images of celestial objects, and the specialized equipment access is a game-changer."
              </p>
            </motion.div>
            
            {/* Testimonial 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl"
            >
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/men/86.jpg" 
                  alt="Member" 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="text-lg font-semibold text-white">Dr. Rahul Verma</h4>
                  <p className="text-purple-400">Pioneer Member</p>
                </div>
              </div>
              <p className="text-gray-300 italic">
                "As a professional astronomer, I joined Gaganvedhi to connect with enthusiasts and share my knowledge. The Pioneer membership has allowed me to participate in meaningful research projects and mentor the next generation."
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl font-bold mb-4 text-white"
            >
              Frequently Asked <span className="text-purple-500">Questions</span>
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-400 max-w-2xl mx-auto"
            >
              Find answers to common questions about membership
            </motion.p>
          </motion.div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {/* FAQ Item 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-3">How long does membership last?</h3>
              <p className="text-gray-300">
                All memberships are valid for one year from the date of approval. You'll receive a renewal notice 30 days before your membership expires.
              </p>
            </motion.div>
            
            {/* FAQ Item 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-3">Can I upgrade my membership tier later?</h3>
              <p className="text-gray-300">
                Yes, you can upgrade your membership tier at any time. You'll only need to pay the difference between your current tier and the new tier for the remaining duration of your membership.
              </p>
            </motion.div>
            
            {/* FAQ Item 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-3">Are there any age restrictions for membership?</h3>
              <p className="text-gray-300">
                There are no age restrictions for membership. However, members under 18 years of age must have parental consent and must be accompanied by an adult during events.
              </p>
            </motion.div>
            
            {/* FAQ Item 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl"
            >
              <h3 className="text-xl font-bold text-white mb-3">How soon after applying will my membership be approved?</h3>
              <p className="text-gray-300">
                We typically process membership applications within 3-5 business days. Once approved, you'll receive a welcome email with your membership details and instructions on how to access member benefits.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}