import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { doc, getDoc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiArrowLeft, FiShare2, FiCheckCircle } from 'react-icons/fi';

const EventDetail = () => {
  const { eventId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [userIsRegistered, setUserIsRegistered] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId);
    }
  }, [eventId]);

  const fetchEvent = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const eventDoc = await getDoc(doc(db, 'events', id));
      
      if (eventDoc.exists()) {
        const eventData = {
          id: eventDoc.id,
          ...eventDoc.data(),
          date: eventDoc.data().date?.toDate() || new Date()
        };
        
        setEvent(eventData);
        
        // Check if current user is registered
        if (currentUser && eventData.registeredUsers) {
          setUserIsRegistered(eventData.registeredUsers.includes(currentUser.uid));
        }
      } else {
        setError('Event not found');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load the event. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle event registration
  const handleRegister = async () => {
    if (!currentUser) {
      // Redirect to login page with return URL
      navigate(`/login?redirect=/events/${eventId}`);
      return;
    }
    
    if (userIsRegistered) {
      return; // User is already registered
    }
    
    setIsRegistering(true);
    try {
      const eventRef = doc(db, 'events', eventId);
      
      // Update the event document
      await updateDoc(eventRef, {
        registeredUsers: arrayUnion(currentUser.uid),
        registeredCount: increment(1)
      });
      
      setUserIsRegistered(true);
      setRegistrationStatus({
        type: 'success',
        message: 'You have successfully registered for this event!'
      });
      
      // Refresh event data
      fetchEvent(eventId);
    } catch (err) {
      console.error('Error registering for event:', err);
      setRegistrationStatus({
        type: 'error',
        message: 'Failed to register for this event. Please try again later.'
      });
    } finally {
      setIsRegistering(false);
      
      // Clear status message after 5 seconds
      setTimeout(() => {
        setRegistrationStatus(null);
      }, 5000);
    }
  };

  // Handle share functionality
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: `Check out this astronomy event: ${event.title}`,
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
            <p className="mb-6">The event you're looking for might have been removed or is temporarily unavailable.</p>
            <Link 
              to="/events" 
              className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              <FiArrowLeft className="mr-2" /> Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const isPastEvent = new Date(event.date) < new Date();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section with Event Header */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {event.imageUrl ? (
            <>
              <img 
                src={event.imageUrl} 
                alt={event.title} 
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
            className="max-w-4xl mx-auto"
          >
            <Link 
              to="/events" 
              className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-200 mb-6"
            >
              <FiArrowLeft className="mr-2" /> Back to Events
            </Link>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-0">
                {event.title}
              </h1>
              
              {event.category && (
                <span className="px-4 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm font-medium">
                  {event.category}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-6 text-gray-300 mb-6">
              <div className="flex items-center">
                <FiCalendar className="mr-2 text-purple-400" />
                <span>{formatDate(event.date)}</span>
              </div>
              
              <div className="flex items-center">
                <FiClock className="mr-2 text-purple-400" />
                <span>{formatTime(event.date)}</span>
              </div>
              
              <div className="flex items-center">
                <FiMapPin className="mr-2 text-purple-400" />
                <span>{event.location}</span>
              </div>
              
              {event.capacity && (
                <div className="flex items-center">
                  <FiUsers className="mr-2 text-purple-400" />
                  <span>
                    {event.registeredCount || 0}/{event.capacity} Registered
                  </span>
                </div>
              )}
            </div>
            
            {/* Registration Status Message */}
            {registrationStatus && (
              <div className={`p-4 rounded-lg mb-6 ${registrationStatus.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}>
                <p>{registrationStatus.message}</p>
              </div>
            )}
            
            {/* Registration Button */}
            {!isPastEvent && (
              <div className="flex flex-wrap gap-4">
                {userIsRegistered ? (
                  <div className="flex items-center bg-green-900/50 text-green-200 px-6 py-3 rounded-lg">
                    <FiCheckCircle className="mr-2" />
                    You are registered for this event
                  </div>
                ) : (
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering || (event.capacity && event.registeredCount >= event.capacity)}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center ${isRegistering ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 text-white'} transition-colors duration-200`}
                  >
                    {isRegistering ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : event.capacity && event.registeredCount >= event.capacity ? (
                      'Event is Full'
                    ) : (
                      'Register for this Event'
                    )}
                  </button>
                )}
                
                <button 
                  onClick={handleShare}
                  className="px-6 py-3 bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10 rounded-lg font-medium flex items-center transition-colors duration-200"
                >
                  <FiShare2 className="mr-2" /> Share Event
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Event Details */}
            <motion.div 
              className="w-full md:w-2/3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gray-800 rounded-xl p-8 shadow-lg">
                <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">Event Details</h2>
                
                {/* Event description */}
                <div className="prose prose-lg prose-invert max-w-none mb-8">
                  {event.description.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
                
                {/* Additional details if available */}
                {event.agenda && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">Agenda</h3>
                    <ul className="space-y-2">
                      {event.agenda.map((item, index) => (
                        <li key={index} className="flex">
                          <span className="text-purple-400 mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {event.requirements && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4">What to Bring</h3>
                    <ul className="space-y-2">
                      {event.requirements.map((item, index) => (
                        <li key={index} className="flex">
                          <span className="text-purple-400 mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* If past event, show recap or photos if available */}
                {isPastEvent && event.recap && (
                  <div className="mt-8 pt-8 border-t border-gray-700">
                    <h3 className="text-xl font-bold mb-4">Event Recap</h3>
                    <p className="text-gray-300">{event.recap}</p>
                    
                    {event.photoGallery && event.photoGallery.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-medium mb-4">Photo Gallery</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {event.photoGallery.map((photo, index) => (
                            <img 
                              key={index}
                              src={photo}
                              alt={`Event photo ${index + 1}`}
                              className="rounded-lg w-full h-32 object-cover"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Sidebar */}
            <div className="w-full md:w-1/3 space-y-8">
              {/* Event Info Card */}
              <motion.div 
                className="bg-gray-800 rounded-xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Event Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-gray-400 text-sm">Date & Time</h4>
                    <p className="font-medium">{formatDate(event.date)} at {formatTime(event.date)}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-gray-400 text-sm">Location</h4>
                    <p className="font-medium">{event.location}</p>
                    {event.address && <p className="text-sm text-gray-400">{event.address}</p>}
                  </div>
                  
                  {event.organizer && (
                    <div>
                      <h4 className="text-gray-400 text-sm">Organizer</h4>
                      <p className="font-medium">{event.organizer}</p>
                    </div>
                  )}
                  
                  {event.contact && (
                    <div>
                      <h4 className="text-gray-400 text-sm">Contact</h4>
                      <p className="font-medium">{event.contact}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-gray-400 text-sm">Registration</h4>
                    <p className="font-medium">
                      {event.capacity ? `${event.registeredCount || 0}/${event.capacity} Registered` : 'Open Registration'}
                    </p>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: event.capacity ? `${Math.min(((event.registeredCount || 0) / event.capacity) * 100, 100)}%` : '100%' }}
                      ></div>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Map or Location Info */}
              {event.mapUrl && (
                <motion.div 
                  className="bg-gray-800 rounded-xl overflow-hidden shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <iframe 
                    src={event.mapUrl} 
                    width="100%" 
                    height="200" 
                    style={{ border: 0 }} 
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Event Location"
                  ></iframe>
                  
                  <div className="p-4">
                    <h3 className="font-medium mb-2">Event Location</h3>
                    <p className="text-sm text-gray-400">{event.address || event.location}</p>
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(event.address || event.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm mt-2 inline-block"
                    >
                      Get Directions
                    </a>
                  </div>
                </motion.div>
              )}
              
              {/* Related Events or Call to Action */}
              <motion.div 
                className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-xl font-bold mb-4">Interested in More Events?</h3>
                <p className="text-gray-300 mb-4">Join our astronomy club to get early access to events and exclusive member benefits.</p>
                
                <Link 
                  to="/membership" 
                  className="w-full bg-white text-purple-900 hover:bg-gray-100 font-medium py-2 px-4 rounded-lg transition-colors duration-200 inline-block text-center"
                >
                  Become a Member
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EventDetail;