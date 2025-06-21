import { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  createUserDocument,
  db 
} from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// List of predefined admin emails
const ADMIN_EMAILS = [
  'admin@gaganvedhi.com',
  'president@gaganvedhi.com',
  'secretary@gaganvedhi.com'
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('user'); // Default role
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Check if email is in the predefined admin list
  const isPredefinedAdmin = (email) => {
    return ADMIN_EMAILS.includes(email.toLowerCase());
  };

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    try {
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, { displayName });
      
      // Check if email is in predefined admin list
      const role = isPredefinedAdmin(email) ? 'admin' : 'user';
      
      // Create user document in Firestore
      await createUserDocument(user, { role });
      
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      setError('');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if email is in predefined admin list
      const role = isPredefinedAdmin(user.email) ? 'admin' : 'user';
      
      // Create user document in Firestore if it doesn't exist
      await createUserDocument(user, { role });
      
      return user;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      setError('');
      await signOut(auth);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError('');
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Check if user is admin
  const checkUserRole = async (user) => {
    if (!user) return 'user';
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return userData.role || 'user';
      }
      
      return 'user';
    } catch (err) {
      console.error('Error checking user role:', err);
      return 'user';
    }
  };

  // Update auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        const role = await checkUserRole(user);
        setUserRole(role);
      } else {
        setUserRole('user');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Update user profile
  const updateUserProfile = async (profileData) => {
    try {
      setError('');
      if (!currentUser) throw new Error('No user logged in');
      
      await updateProfile(currentUser, profileData);
      return currentUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };
  
  // Update user role (admin only function)
  const updateUserRole = async (userId, newRole) => {
    try {
      setError('');
      if (!currentUser || userRole !== 'admin') {
        throw new Error('Unauthorized: Only admins can update user roles');
      }
      
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    currentUser,
    userRole,
    isAdmin: userRole === 'admin',
    loading,
    error,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserRole,
    isPredefinedAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}