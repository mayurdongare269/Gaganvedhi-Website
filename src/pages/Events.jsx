import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, getFirestore } from 'firebase/firestore';

export default function Events() {
  // State for filtering events
  const [filter, setFilter] = useState('upcoming');
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Meteor Shower Observation',
      date: '2023-12-14',
      time: '11:00 PM - 3:00 AM',
      location: 'Himalayan Astronomical Observatory',
      description: 'Join us for an unforgettable night observing the Geminid meteor shower, one of the most spectacular meteor showers of the year. We will have telescopes set up and experts on hand to guide your viewing experience.',
      image: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'observation',
      status: 'upcoming',
      registrationRequired: true,
      capacity: 30,
      spotsLeft: 12
    },
    {
      id: 2,
      title: 'Introduction to Astrophotography',
      date: '2023-12-20',
      time: '6:00 PM - 9:00 PM',
      location: 'Gaganvedhi Headquarters',
      description: 'Learn the basics of astrophotography in this hands-on workshop. Topics include equipment selection, camera settings, and post-processing techniques. Bring your DSLR camera if you have one.',
      image: 'https://images.unsplash.com/photo-1519638399535-1b036603ac77?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'workshop',
      status: 'upcoming',
      registrationRequired: true,
      capacity: 20,
      spotsLeft: 5
    },
    {
      id: 3,
      title: 'Solar Eclipse Viewing',
      date: '2024-01-15',
      time: '10:00 AM - 1:00 PM',
      location: 'City Central Park',
      description: 'Experience the partial solar eclipse with proper viewing equipment provided by our club. Learn about the science behind eclipses and their cultural significance throughout history.',
      image: 'https://images.unsplash.com/photo-1532798369041-b33eb576ef16?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'public',
      status: 'upcoming',
      registrationRequired: false,
      capacity: 100,
      spotsLeft: 100
    },
    {
      id: 4,
      title: 'Astronomy for Beginners',
      date: '2023-11-05',
      time: '5:00 PM - 7:00 PM',
      location: 'Virtual Event',
      description: 'An introductory session for those new to astronomy. We covered basic concepts, how to get started with stargazing, and recommended resources for further learning.',
      image: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'educational',
      status: 'past',
      registrationRequired: true,
      capacity: 50,
      spotsLeft: 0
    },
    {
      id: 5,
      title: 'Lunar Observation Night',
      date: '2023-10-28',
      time: '8:00 PM - 11:00 PM',
      location: 'University Observatory',
      description: 'A focused observation session of the Moon during its first quarter phase. Participants observed various lunar features including craters, maria, and mountain ranges.',
      image: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'observation',
      status: 'past',
      registrationRequired: true,
      capacity: 25,
      spotsLeft: 0
    },
    {
      id: 6,
      title: 'Space Mission Symposium',
      date: '2023-09-15',
      time: '10:00 AM - 4:00 PM',
      location: 'Science Convention Center',
      description: 'A day-long symposium featuring talks from space agency representatives and researchers about current and upcoming space missions.',
      image: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'conference',
      status: 'past',
      registrationRequired: true,
      capacity: 200,
      spotsLeft: 0
    }
  ]);
  const [loading, setLoading] = useState(false);
  
  // Example of how you might fetch events from Firebase:
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const db = getFirestore();
        const eventsCollection = collection(db, "events");
        const eventsQuery = query(eventsCollection, orderBy('date'));
        const eventsSnapshot = await getDocs(eventsQuery);
        
        const eventsList = eventsSnapshot.docs.map(doc => {
          const data = doc.data();
          // Determine if event is upcoming or past based on date
          const eventDate = new Date(data.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
          
          const status = eventDate >= today ? 'upcoming' : 'past';
          
          return {
            id: doc.id,
            ...data,
            status
          };
        });
        
        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events:', error);
        // We'll keep using the sample data if fetch fails
      } finally {
        setLoading(false);
      }
    };
    
    // Uncomment to fetch from Firebase
    // fetchEvents();
  }, []);

  // Filter events based on selected filter
  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  }).sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (filter === 'upcoming' || (filter === 'all' && a.status === 'upcoming' && b.status === 'upcoming')) {
      // Sort upcoming events in ascending order (soonest first)
      return dateA - dateB;
    } else if (filter === 'past' || (filter === 'all' && a.status === 'past' && b.status === 'past')) {
      // Sort past events in descending order (most recent first)
      return dateB - dateA;
    } else if (filter === 'all') {
      // For 'all' filter, if comparing different status events
      if (a.status !== b.status) {
        // Show upcoming events first, then past events
        return a.status === 'upcoming' ? -1 : 1;
      }
    }
    
    // Default sorting
    return dateA - dateB;
  });

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
      transition: { duration: 0.5 }
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
              Astronomy <span className="text-gradient">Events</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover our upcoming stargazing sessions, workshops, and educational programs. Join us as we explore the wonders of the universe together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events Filter Section */}
      <section className="py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              All Events
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${filter === 'upcoming' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${filter === 'past' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Past Events
            </button>
          </div>
        </div>
      </section>

      {/* Events List Section */}
      <section className="py-12 bg-black">
        <div className="container mx-auto px-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-medium text-gray-400">No events found</h3>
              <p className="mt-4 text-gray-500">Try changing your filter or check back later for new events.</p>
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl overflow-hidden border border-purple-900/50 shadow-xl hover:shadow-purple-500/20 transition-all duration-300 group"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-1 m-2 rounded-full text-sm font-medium">
                      {event.category}
                    </div>
                    {event.status === 'upcoming' && event.registrationRequired && (
                      <div className="absolute bottom-0 left-0 bg-blue-600 text-white px-3 py-1 m-2 rounded-full text-sm font-medium">
                        {event.spotsLeft > 0 ? `${event.spotsLeft} spots left` : 'Fully Booked'}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-white">{event.title}</h3>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${event.status === 'upcoming' ? 'bg-green-900/50 text-green-400' : 'bg-gray-700/50 text-gray-400'}`}>
                        {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center text-gray-400 mb-2">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{event.date}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-400 mb-2">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{event.time}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-6 line-clamp-3">{event.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <Link 
                        to={`/events/${event.id}`} 
                        className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                      >
                        View Details
                      </Link>
                      
                      {event.status === 'upcoming' && event.registrationRequired && event.spotsLeft > 0 && (
                        <Link 
                          to={`/events/${event.id}/register`} 
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 text-sm"
                        >
                          Register
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Host an Event CTA */}
      <section className="py-20 relative overflow-hidden">
        {/* Background with stars */}
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
            <h2 className="text-3xl font-bold mb-6 text-white">
              Want to <span className="text-purple-500">Host an Event</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Are you a member with an idea for an astronomy event? We welcome proposals from our community. Share your passion and expertise with fellow stargazers.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/propose-event"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
              >
                Propose an Event
              </Link>
              
              <Link 
                to="/event-guidelines"
                className="px-8 py-4 bg-transparent border-2 border-purple-500 text-purple-400 font-medium rounded-lg hover:bg-purple-500/10 transition-all duration-300 transform hover:scale-105"
              >
                View Guidelines
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}