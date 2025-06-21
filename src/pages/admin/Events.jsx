import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';

export default function AdminEvents() {
  const { currentUser, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Form state for creating/editing events
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    status: 'upcoming',
    capacity: '',
    registrationRequired: false,
    imageFile: null,
    imagePreview: null
  });
  
  useEffect(() => {
    const fetchEvents = async () => {
      if (!currentUser || userRole !== 'admin') return;
      
      try {
        setLoading(true);
        
        // Create query based on sort options
        const eventsQuery = query(
          collection(db, 'events'), 
          orderBy(sortBy, sortDirection)
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore timestamp to JS Date for easier handling
          date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date(doc.data().date)
        }));
        
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching events:', error);
        setMessage({
          text: 'Failed to load events. Please try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [currentUser, userRole, sortBy, sortDirection]);
  
  // Redirect if not admin
  if (!loading && (!currentUser || userRole !== 'admin')) {
    return <Navigate to="/" />;
  }
  
  // Filter events based on search term and status filter
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventForm({
        ...eventForm,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventForm({
      ...eventForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Open create event modal
  const openCreateModal = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      status: 'upcoming',
      capacity: '',
      registrationRequired: false,
      imageFile: null,
      imagePreview: null
    });
    setIsCreateModalOpen(true);
  };
  
  // Open edit event modal
  const openEditModal = (event) => {
    // Format date for input field (YYYY-MM-DD)
    const formattedDate = event.date ? new Date(event.date).toISOString().split('T')[0] : '';
    
    // Extract time if available
    let formattedTime = '';
    if (event.time) {
      formattedTime = event.time;
    } else if (event.date) {
      const date = new Date(event.date);
      formattedTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      date: formattedDate,
      time: formattedTime,
      location: event.location || '',
      status: event.status || 'upcoming',
      capacity: event.capacity || '',
      registrationRequired: event.registrationRequired || false,
      imageFile: null,
      imagePreview: event.imageURL || null
    });
    
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  
  // Handle event creation
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    try {
      setActionLoading(true);
      
      // Validate form
      if (!eventForm.title || !eventForm.description || !eventForm.date || !eventForm.location) {
        setMessage({
          text: 'Please fill in all required fields.',
          type: 'error'
        });
        setActionLoading(false);
        return;
      }
      
      // Prepare event data
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        date: new Date(`${eventForm.date}T${eventForm.time || '00:00'}`),
        location: eventForm.location,
        status: eventForm.status,
        capacity: eventForm.capacity ? parseInt(eventForm.capacity) : null,
        registrationRequired: eventForm.registrationRequired,
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid
      };
      
      // Upload image if provided
      if (eventForm.imageFile) {
        const imageRef = ref(storage, `events/${Date.now()}_${eventForm.imageFile.name}`);
        await uploadBytes(imageRef, eventForm.imageFile);
        const imageURL = await getDownloadURL(imageRef);
        eventData.imageURL = imageURL;
      }
      
      // Add event to Firestore
      const docRef = await addDoc(collection(db, 'events'), eventData);
      
      // Update local state
      const newEvent = {
        id: docRef.id,
        ...eventData,
        date: eventData.date // Already a JS Date object
      };
      
      setEvents([newEvent, ...events]);
      
      setMessage({
        text: 'Event created successfully!',
        type: 'success'
      });
      
      // Close modal
      setIsCreateModalOpen(false);
      
      // Reset form
      setEventForm({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        status: 'upcoming',
        capacity: '',
        registrationRequired: false,
        imageFile: null,
        imagePreview: null
      });
      
    } catch (error) {
      console.error('Error creating event:', error);
      setMessage({
        text: 'Failed to create event. Please try again.',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle event update
  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) return;
    
    try {
      setActionLoading(true);
      
      // Validate form
      if (!eventForm.title || !eventForm.description || !eventForm.date || !eventForm.location) {
        setMessage({
          text: 'Please fill in all required fields.',
          type: 'error'
        });
        setActionLoading(false);
        return;
      }
      
      // Prepare event data
      const eventData = {
        title: eventForm.title,
        description: eventForm.description,
        date: new Date(`${eventForm.date}T${eventForm.time || '00:00'}`),
        location: eventForm.location,
        status: eventForm.status,
        capacity: eventForm.capacity ? parseInt(eventForm.capacity) : null,
        registrationRequired: eventForm.registrationRequired,
        updatedAt: serverTimestamp()
      };
      
      // Upload image if provided
      if (eventForm.imageFile) {
        const imageRef = ref(storage, `events/${Date.now()}_${eventForm.imageFile.name}`);
        await uploadBytes(imageRef, eventForm.imageFile);
        const imageURL = await getDownloadURL(imageRef);
        eventData.imageURL = imageURL;
      }
      
      // Update event in Firestore
      const eventRef = doc(db, 'events', selectedEvent.id);
      await updateDoc(eventRef, eventData);
      
      // Update local state
      setEvents(events.map(event => 
        event.id === selectedEvent.id ? { 
          ...event, 
          ...eventData,
          date: eventData.date // Already a JS Date object
        } : event
      ));
      
      setMessage({
        text: 'Event updated successfully!',
        type: 'success'
      });
      
      // Close modal
      setIsModalOpen(false);
      setSelectedEvent(null);
      
    } catch (error) {
      console.error('Error updating event:', error);
      setMessage({
        text: 'Failed to update event. Please try again.',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle event deletion
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      
      const eventRef = doc(db, 'events', eventId);
      await deleteDoc(eventRef);
      
      // Update local state
      setEvents(events.filter(event => event.id !== eventId));
      
      setMessage({
        text: 'Event deleted successfully!',
        type: 'success'
      });
      
      // Close modal if open
      if (isModalOpen) {
        setIsModalOpen(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setMessage({
        text: 'Failed to delete event. Please try again.',
        type: 'error'
      });
    } finally {
      setActionLoading(false);
    }
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
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
  
  return (
    <div className="bg-black text-white min-h-screen py-12">
      {/* Background with stars */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="stars-small opacity-30"></div>
        <div className="stars-medium opacity-20"></div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-black z-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div variants={fadeIn} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Event <span className="text-gradient">Management</span></h1>
              <p className="text-gray-300">
                Create, edit, and manage events for the Gaganvedhi Astronomy Club.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <button
                onClick={openCreateModal}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Event
              </button>
              <Link to="/admin/dashboard" className="text-purple-400 hover:text-purple-300 flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
          
          {/* Message display */}
          {message.text && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 mb-6 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}
            >
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {message.text}
              </div>
            </motion.div>
          )}
          
          {/* Filters and Search */}
          <motion.div variants={fadeIn} className="mb-6 bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl p-6 border border-purple-900/50 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">Search Events</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full pl-10 p-2.5 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Search by title, description, or location"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Status Filter */}
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-400 mb-1">Filter by Status</label>
                <select
                  id="status-filter"
                  className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              {/* Sort By */}
              <div>
                <label htmlFor="sort-by" className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
                <select
                  id="sort-by"
                  className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                  value={`${sortBy}-${sortDirection}`}
                  onChange={(e) => {
                    const [field, direction] = e.target.value.split('-');
                    setSortBy(field);
                    setSortDirection(direction);
                  }}
                >
                  <option value="date-desc">Date (Newest First)</option>
                  <option value="date-asc">Date (Oldest First)</option>
                  <option value="title-asc">Title (A-Z)</option>
                  <option value="title-desc">Title (Z-A)</option>
                  <option value="createdAt-desc">Recently Created</option>
                  <option value="createdAt-asc">Oldest Created</option>
                </select>
              </div>
            </div>
          </motion.div>
          
          {/* Events Grid */}
          <motion.div variants={fadeIn}>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <svg className="animate-spin h-10 w-10 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <div 
                    key={event.id} 
                    className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl overflow-hidden border border-purple-900/50 shadow-xl hover:shadow-2xl transition-shadow group"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {event.imageURL ? (
                        <img 
                          src={event.imageURL} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                          <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-0 right-0 p-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${event.status === 'upcoming' ? 'bg-green-900 text-green-200' : event.status === 'ongoing' ? 'bg-blue-900 text-blue-200' : event.status === 'completed' ? 'bg-gray-700 text-gray-300' : 'bg-red-900 text-red-200'}`}>
                          {event.status || 'upcoming'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{event.title}</h3>
                      
                      <div className="flex items-center text-sm text-gray-400 mb-3">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(event.date)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-400 mb-4">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                      
                      <p className="text-gray-300 mb-4 line-clamp-2">{event.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => openEditModal(event)}
                          className="text-purple-400 hover:text-purple-300 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-400 hover:text-red-300 flex items-center"
                          disabled={actionLoading}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-xl border border-purple-900/50 shadow-xl">
                <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-xl font-medium text-gray-300">No events found</h3>
                <p className="mt-1 text-gray-400">Try adjusting your search or filter criteria.</p>
                <button
                  onClick={openCreateModal}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Event
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom bg-gray-800 bg-opacity-90 backdrop-blur-xl rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-purple-900/50"
            >
              <form onSubmit={handleCreateEvent}>
                <div className="px-4 pt-5 pb-4 sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-2xl leading-6 font-bold text-white mb-4" id="modal-title">
                        Create New Event
                      </h3>
                      
                      <div className="mt-2 space-y-4">
                        {/* Event Title */}
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">Event Title *</label>
                          <input
                            type="text"
                            id="title"
                            name="title"
                            className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter event title"
                            value={eventForm.title}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        {/* Event Description */}
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
                          <textarea
                            id="description"
                            name="description"
                            rows="3"
                            className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter event description"
                            value={eventForm.description}
                            onChange={handleInputChange}
                            required
                          ></textarea>
                        </div>
                        
                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-400 mb-1">Date *</label>
                            <input
                              type="date"
                              id="date"
                              name="date"
                              className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                              value={eventForm.date}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                            <input
                              type="time"
                              id="time"
                              name="time"
                              className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                              value={eventForm.time}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        {/* Location */}
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-400 mb-1">Location *</label>
                          <input
                            type="text"
                            id="location"
                            name="location"
                            className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter event location"
                            value={eventForm.location}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        {/* Status and Capacity */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                            <select
                              id="status"
                              name="status"
                              className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                              value={eventForm.status}
                              onChange={handleInputChange}
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="ongoing">Ongoing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-400 mb-1">Capacity</label>
                            <input
                              type="number"
                              id="capacity"
                              name="capacity"
                              className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Max attendees"
                              value={eventForm.capacity}
                              onChange={handleInputChange}
                              min="1"
                            />
                          </div>
                        </div>
                        
                        {/* Registration Required */}
                        <div className="flex items-center">
                          <input
                            id="registrationRequired"
                            name="registrationRequired"
                            type="checkbox"
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                            checked={eventForm.registrationRequired}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="registrationRequired" className="ml-2 text-sm font-medium text-gray-300">
                            Registration required for this event
                          </label>
                        </div>
                        
                        {/* Event Image */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Event Image</label>
                          <div className="mt-1 flex items-center space-x-4">
                            <div className="flex-shrink-0 h-16 w-16 bg-gray-700 rounded-md overflow-hidden">
                              {eventForm.imagePreview ? (
                                <img src={eventForm.imagePreview} alt="Preview" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-700">
                                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-md text-sm transition-colors">
                              Choose File
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                            {eventForm.imageFile && (
                              <span className="text-sm text-gray-400">{eventForm.imageFile.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="submit" 
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Creating...' : 'Create Event'}
                  </button>
                  <button 
                    type="button" 
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsCreateModalOpen(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
      
      {/* Edit Event Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-black bg-opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-block align-bottom bg-gray-800 bg-opacity-90 backdrop-blur-xl rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-purple-900/50"
            >
              <form onSubmit={handleUpdateEvent}>
                <div className="px-4 pt-5 pb-4 sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-2xl leading-6 font-bold text-white mb-4" id="modal-title">
                        Edit Event
                      </h3>
                      
                      <div className="mt-2 space-y-4">
                        {/* Event Title */}
                        <div>
                          <label htmlFor="edit-title" className="block text-sm font-medium text-gray-400 mb-1">Event Title *</label>
                          <input
                            type="text"
                            id="edit-title"
                            name="title"
                            className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter event title"
                            value={eventForm.title}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        {/* Event Description */}
                        <div>
                          <label htmlFor="edit-description" className="block text-sm font-medium text-gray-400 mb-1">Description *</label>
                          <textarea
                            id="edit-description"
                            name="description"
                            rows="3"
                            className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter event description"
                            value={eventForm.description}
                            onChange={handleInputChange}
                            required
                          ></textarea>
                        </div>
                        
                        {/* Date and Time */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="edit-date" className="block text-sm font-medium text-gray-400 mb-1">Date *</label>
                            <input
                              type="date"
                              id="edit-date"
                              name="date"
                              className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                              value={eventForm.date}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor="edit-time" className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                            <input
                              type="time"
                              id="edit-time"
                              name="time"
                              className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                              value={eventForm.time}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        
                        {/* Location */}
                        <div>
                          <label htmlFor="edit-location" className="block text-sm font-medium text-gray-400 mb-1">Location *</label>
                          <input
                            type="text"
                            id="edit-location"
                            name="location"
                            className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter event location"
                            value={eventForm.location}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        {/* Status and Capacity */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="edit-status" className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                            <select
                              id="edit-status"
                              name="status"
                              className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                              value={eventForm.status}
                              onChange={handleInputChange}
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="ongoing">Ongoing</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div>
                            <label htmlFor="edit-capacity" className="block text-sm font-medium text-gray-400 mb-1">Capacity</label>
                            <input
                              type="number"
                              id="edit-capacity"
                              name="capacity"
                              className="bg-gray-700 bg-opacity-50 border border-gray-600 text-white rounded-lg block w-full p-2.5 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Max attendees"
                              value={eventForm.capacity}
                              onChange={handleInputChange}
                              min="1"
                            />
                          </div>
                        </div>
                        
                        {/* Registration Required */}
                        <div className="flex items-center">
                          <input
                            id="edit-registrationRequired"
                            name="registrationRequired"
                            type="checkbox"
                            className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                            checked={eventForm.registrationRequired}
                            onChange={handleInputChange}
                          />
                          <label htmlFor="edit-registrationRequired" className="ml-2 text-sm font-medium text-gray-300">
                            Registration required for this event
                          </label>
                        </div>
                        
                        {/* Event Image */}
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Event Image</label>
                          <div className="mt-1 flex items-center space-x-4">
                            <div className="flex-shrink-0 h-16 w-16 bg-gray-700 rounded-md overflow-hidden">
                              {eventForm.imagePreview ? (
                                <img src={eventForm.imagePreview} alt="Preview" className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-700">
                                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white py-2 px-3 rounded-md text-sm transition-colors">
                              Choose File
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </label>
                            {eventForm.imageFile && (
                              <span className="text-sm text-gray-400">{eventForm.imageFile.name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="submit" 
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Updating...' : 'Update Event'}
                  </button>
                  <button 
                    type="button" 
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedEvent(null);
                    }}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}