import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  // If not authenticated, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute;