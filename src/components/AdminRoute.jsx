import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // If not authenticated, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // If authenticated but not admin, redirect to home page
  if (userRole !== 'admin') {
    return <Navigate to="/" />;
  }
  
  // If authenticated and admin, render the protected component
  return children;
};

export default AdminRoute;