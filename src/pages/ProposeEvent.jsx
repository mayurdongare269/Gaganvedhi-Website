import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiInfo, FiSend, FiArrowLeft } from 'react-icons/fi';

export default function ProposeEvent() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    category: 'observation', // Default category
    organizer: currentUser?.displayName || '',
    organizerEmail: currentUser?.email || '',
    organizerPhone: '',
    capacity: 20,
    registrationRequired: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      setError('Event title is required');
      return;
    }
    
    if (!formData.date) {
      setError('Event date is required');
      return;
    }
    
    if (!formData.description.trim()) {
      setError('Event description is required');
      return;
    }
    
    if (!formData.organizer.trim()) {
      setError('Organizer name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      // Add event proposal to Firestore
      await addDoc(collection(db, 'eventProposals'), {
        ...formData,
        status: 'pending', // Status will be 'pending', 'approved', or 'rejected'
        userId: currentUser?.uid || 'anonymous',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Show success message and reset form
      setSuccess(true);
      setFormData({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        category: 'observation',
        organizer: currentUser?.displayName || '',
        organizerEmail: currentUser?.email || '',
        organizerPhone: '',
        capacity: 20,
        registrationRequired: true
      });
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/events');
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting event proposal:', err);
      setError('Failed to submit event proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Propose an <span className="text-gradient">Event</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Share your astronomy event idea with our community. Fill out the form below to submit your proposal for review.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <Link to="/events" className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors">
                <FiArrowLeft className="mr-2" />
                Back to Events
              </Link>
            </div>
            
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-900/50 border border-green-500/50 text-green-300 rounded-xl p-8 text-center shadow-xl"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">Event Proposal Submitted!</h3>
                <p className="mb-6">Thank you for your submission. Our team will review your event proposal and get back to you soon.</p>
                <p className="text-sm">Redirecting to events page...</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-8 border border-purple-900/50 shadow-xl"
              >
                <h2 className="text-2xl font-bold text-white mb-6 pb-4 border-b border-gray-700">Event Proposal Form</h2>
                
                {error && (
                  <div className="mb-6 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  {/* Event Title */}
                  <div className="mb-6">
                    <label htmlFor="title" className="block text-gray-300 mb-2 flex items-center">
                      <FiInfo className="mr-2" />
                      Event Title*
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      placeholder="e.g., Meteor Shower Observation Night"
                      required
                    />
                  </div>
                  
                  {/* Event Date and Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="date" className="block text-gray-300 mb-2 flex items-center">
                        <FiCalendar className="mr-2" />
                        Event Date*
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="time" className="block text-gray-300 mb-2 flex items-center">
                        <FiClock className="mr-2" />
                        Event Time
                      </label>
                      <input
                        type="text"
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                        placeholder="e.g., 7:00 PM - 10:00 PM"
                      />
                    </div>
                  </div>
                  
                  {/* Location and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="location" className="block text-gray-300 mb-2 flex items-center">
                        <FiMapPin className="mr-2" />
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                        placeholder="e.g., University Observatory"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-gray-300 mb-2">Event Category</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                      >
                        <option value="observation">Observation</option>
                        <option value="workshop">Workshop</option>
                        <option value="lecture">Lecture</option>
                        <option value="conference">Conference</option>
                        <option value="public">Public Event</option>
                        <option value="educational">Educational</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Event Description */}
                  <div className="mb-6">
                    <label htmlFor="description" className="block text-gray-300 mb-2">Event Description*</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="5"
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white resize-none"
                      placeholder="Provide a detailed description of your event..."
                      required
                    ></textarea>
                  </div>
                  
                  {/* Organizer Information */}
                  <div className="mb-6 bg-gray-700/50 p-6 rounded-lg border border-gray-600">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                      <FiUser className="mr-2" />
                      Organizer Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="organizer" className="block text-gray-300 mb-2">Organizer Name*</label>
                        <input
                          type="text"
                          id="organizer"
                          name="organizer"
                          value={formData.organizer}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                          placeholder="Your name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="organizerEmail" className="block text-gray-300 mb-2">Email*</label>
                        <input
                          type="email"
                          id="organizerEmail"
                          name="organizerEmail"
                          value={formData.organizerEmail}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="organizerPhone" className="block text-gray-300 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        id="organizerPhone"
                        name="organizerPhone"
                        value={formData.organizerPhone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                        placeholder="Optional contact number"
                      />
                    </div>
                  </div>
                  
                  {/* Event Settings */}
                  <div className="mb-6 bg-gray-700/50 p-6 rounded-lg border border-gray-600">
                    <h3 className="text-xl font-semibold text-white mb-4">Event Settings</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label htmlFor="capacity" className="block text-gray-300 mb-2">Capacity (max attendees)</label>
                        <input
                          type="number"
                          id="capacity"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleChange}
                          min="1"
                          className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white"
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="registrationRequired"
                          name="registrationRequired"
                          checked={formData.registrationRequired}
                          onChange={handleChange}
                          className="w-5 h-5 bg-gray-700 border border-gray-600 rounded focus:ring-purple-500 text-purple-600"
                        />
                        <label htmlFor="registrationRequired" className="ml-2 block text-gray-300">
                          Registration required for this event
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting Proposal...
                        </>
                      ) : (
                        <>
                          <FiSend className="mr-2" />
                          Submit Event Proposal
                        </>
                      )}
                    </button>
                    
                    <p className="text-gray-400 text-sm mt-4 text-center">
                      * Required fields. Your proposal will be reviewed by our team before being published.
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}