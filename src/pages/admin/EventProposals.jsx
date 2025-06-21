import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiCalendar, FiClock, FiMapPin, FiUser, FiCheck, FiX, FiTrash2, FiEye } from 'react-icons/fi';

export default function EventProposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Fetch event proposals
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const proposalsCollection = collection(db, 'eventProposals');
        const proposalsQuery = query(proposalsCollection, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(proposalsQuery);
        
        const proposalsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || 'Unknown date'
        }));
        
        setProposals(proposalsList);
      } catch (error) {
        console.error('Error fetching event proposals:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProposals();
  }, []);
  
  // Handle approve proposal
  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      const proposalRef = doc(db, 'eventProposals', id);
      await updateDoc(proposalRef, {
        status: 'approved',
        updatedAt: new Date()
      });
      
      // Update local state
      setProposals(prevProposals => 
        prevProposals.map(proposal => 
          proposal.id === id ? { ...proposal, status: 'approved' } : proposal
        )
      );
      
      // Close modal if open
      if (isModalOpen && selectedProposal?.id === id) {
        setSelectedProposal({ ...selectedProposal, status: 'approved' });
      }
    } catch (error) {
      console.error('Error approving proposal:', error);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle reject proposal
  const handleReject = async (id) => {
    try {
      setActionLoading(true);
      const proposalRef = doc(db, 'eventProposals', id);
      await updateDoc(proposalRef, {
        status: 'rejected',
        updatedAt: new Date()
      });
      
      // Update local state
      setProposals(prevProposals => 
        prevProposals.map(proposal => 
          proposal.id === id ? { ...proposal, status: 'rejected' } : proposal
        )
      );
      
      // Close modal if open
      if (isModalOpen && selectedProposal?.id === id) {
        setSelectedProposal({ ...selectedProposal, status: 'rejected' });
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Handle delete proposal
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      return;
    }
    
    try {
      setActionLoading(true);
      const proposalRef = doc(db, 'eventProposals', id);
      await deleteDoc(proposalRef);
      
      // Update local state
      setProposals(prevProposals => 
        prevProposals.filter(proposal => proposal.id !== id)
      );
      
      // Close modal if open
      if (isModalOpen && selectedProposal?.id === id) {
        setIsModalOpen(false);
        setSelectedProposal(null);
      }
    } catch (error) {
      console.error('Error deleting proposal:', error);
    } finally {
      setActionLoading(false);
    }
  };
  
  // Open proposal details modal
  const openProposalModal = (proposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };
  
  // Close proposal details modal
  const closeProposalModal = () => {
    setIsModalOpen(false);
    setSelectedProposal(null);
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Event Proposals</h1>
        <p className="text-gray-600">Review and manage event proposals submitted by members</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCalendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Event Proposals</h3>
          <p className="text-gray-600">There are no event proposals to review at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proposals.map((proposal) => (
            <div 
              key={proposal.id} 
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{proposal.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(proposal.status)}`}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiCalendar className="mr-2 text-gray-400" />
                    <span>{proposal.date || 'No date specified'}</span>
                  </div>
                  
                  {proposal.time && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiClock className="mr-2 text-gray-400" />
                      <span>{proposal.time}</span>
                    </div>
                  )}
                  
                  {proposal.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiMapPin className="mr-2 text-gray-400" />
                      <span>{proposal.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <FiUser className="mr-2 text-gray-400" />
                    <span>{proposal.organizer}</span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {proposal.description}
                </div>
                
                <div className="text-xs text-gray-500 mb-4">
                  Submitted: {proposal.createdAt}
                </div>
                
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => openProposalModal(proposal)}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                  >
                    <FiEye className="mr-1" /> View Details
                  </button>
                  
                  <div className="flex space-x-2">
                    {proposal.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(proposal.id)}
                          disabled={actionLoading}
                          className="p-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 disabled:opacity-50"
                          title="Approve"
                        >
                          <FiCheck className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleReject(proposal.id)}
                          disabled={actionLoading}
                          className="p-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 disabled:opacity-50"
                          title="Reject"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => handleDelete(proposal.id)}
                      disabled={actionLoading}
                      className="p-1.5 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 disabled:opacity-50"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Proposal Details Modal */}
      {isModalOpen && selectedProposal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{selectedProposal.title}</h2>
                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(selectedProposal.status)}`}>
                  {selectedProposal.status.charAt(0).toUpperCase() + selectedProposal.status.slice(1)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Event Details</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600 block">Date:</span>
                      <span className="text-gray-800">{selectedProposal.date || 'Not specified'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 block">Time:</span>
                      <span className="text-gray-800">{selectedProposal.time || 'Not specified'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 block">Location:</span>
                      <span className="text-gray-800">{selectedProposal.location || 'Not specified'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 block">Category:</span>
                      <span className="text-gray-800 capitalize">{selectedProposal.category || 'Not specified'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 block">Capacity:</span>
                      <span className="text-gray-800">{selectedProposal.capacity || 'Not specified'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 block">Registration Required:</span>
                      <span className="text-gray-800">{selectedProposal.registrationRequired ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Organizer Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600 block">Name:</span>
                      <span className="text-gray-800">{selectedProposal.organizer || 'Not specified'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 block">Email:</span>
                      <span className="text-gray-800">{selectedProposal.organizerEmail || 'Not specified'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 block">Phone:</span>
                      <span className="text-gray-800">{selectedProposal.organizerPhone || 'Not specified'}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-600 block">Submitted On:</span>
                      <span className="text-gray-800">{selectedProposal.createdAt}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Event Description</h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-line">{selectedProposal.description}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <button
                  onClick={closeProposalModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
                
                <div className="flex space-x-3">
                  {selectedProposal.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(selectedProposal.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                      >
                        <FiCheck className="mr-2" /> Approve
                      </button>
                      
                      <button
                        onClick={() => handleReject(selectedProposal.id)}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                      >
                        <FiX className="mr-2" /> Reject
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => handleDelete(selectedProposal.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 flex items-center"
                  >
                    <FiTrash2 className="mr-2" /> Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}