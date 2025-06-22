// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import MainLayout from './components/layout/MainLayout';
// import AdminLayout from './components/layout/AdminLayout';
// import Home from './pages/Home';
// import About from './pages/About';
// import Events from './pages/Events';
// import EventDetail from './pages/EventDetail';
// import ProposeEvent from './pages/ProposeEvent';
// import Contact from './pages/Contact';
// import Membership from './pages/Membership';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import ForgotPassword from './pages/ForgotPassword';
// import Profile from './pages/Profile';
// import Blog from './pages/Blog';
// import BlogPost from './pages/BlogPost';
// import Forum from './pages/Forum';
// import ForumPost from './pages/ForumPost';
// import PrivateRoute from './components/PrivateRoute';
// import AdminRoute from './components/AdminRoute';
// import AdminDashboard from './pages/admin/Dashboard';
// import AdminUsers from './pages/admin/Users';
// import AdminEvents from './pages/admin/Events';
// import EventProposals from './pages/admin/EventProposals';
// import MembershipApplications from './pages/admin/MembershipApplications';
// import ContactMessages from './pages/admin/ContactMessages';
// import AdminPosts from './pages/admin/Posts';
// import AdminSettings from './pages/admin/Settings';



// // for loader...
// import React, { useState, useEffect } from 'react';
// import Loader from './Loader.jsx';
// // import Home from './components/Home'; // or your main component
// //loader setup done ..



// function App() {

//   //loader setup so that its sees first
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // Simulate loading
//     const timer = setTimeout(() => setLoading(false), 2500);
//     return () => clearTimeout(timer);
//   }, []);

//   if (loading) return <Loader />; // ✅ show loader first




//   return (
//       <AuthProvider>
        
//         <Routes>
//           {/* Public routes with MainLayout */}
//           <Route path="/" element={<MainLayout><Home /></MainLayout>} />
//           <Route path="/about" element={<MainLayout><About /></MainLayout>} />
//           <Route path="/events" element={<MainLayout><Events /></MainLayout>} />
//           <Route path="/events/:eventId" element={<MainLayout><EventDetail /></MainLayout>} />
//           <Route path="/propose-event" element={<MainLayout><PrivateRoute><ProposeEvent /></PrivateRoute></MainLayout>} />
//           <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
//           <Route path="/membership" element={<MainLayout><Membership /></MainLayout>} />
//           <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
//           <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
//           <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
//           <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
//           <Route path="/blog" element={<MainLayout><Blog /></MainLayout>} />
//           <Route path="/blog/:postId" element={<MainLayout><BlogPost /></MainLayout>} />
//           <Route path="/forum" element={<MainLayout><Forum /></MainLayout>} />
//           <Route path="/forum/:postId" element={<MainLayout><ForumPost /></MainLayout>} />
          
//           {/* Admin routes with AdminLayout */}
//           <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
//           <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
//           <Route path="/admin/events" element={<AdminRoute><AdminLayout><AdminEvents /></AdminLayout></AdminRoute>} />
//           <Route path="/admin/event-proposals" element={<AdminRoute><AdminLayout><EventProposals /></AdminLayout></AdminRoute>} />
//           <Route path="/admin/membership-applications" element={<AdminRoute><AdminLayout><MembershipApplications /></AdminLayout></AdminRoute>} />
//           <Route path="/admin/contact-messages" element={<AdminRoute><AdminLayout><ContactMessages /></AdminLayout></AdminRoute>} />
//           <Route path="/admin/posts" element={<AdminRoute><AdminLayout><AdminPosts /></AdminLayout></AdminRoute>} />
//           <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
//         </Routes>
        
//       </AuthProvider>
//   );
// }

// export default App






import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import ProposeEvent from './pages/ProposeEvent';
import Contact from './pages/Contact';
import Membership from './pages/Membership';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Forum from './pages/Forum';
import ForumPost from './pages/ForumPost';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminEvents from './pages/admin/Events';
import EventProposals from './pages/admin/EventProposals';
import MembershipApplications from './pages/admin/MembershipApplications';
import ContactMessages from './pages/admin/ContactMessages';
import AdminPosts from './pages/admin/Posts';
import AdminSettings from './pages/admin/Settings';

// 🔁 React core hooks
import React, { useState, useEffect } from 'react';

// 🟢 New: Import your custom Lottie animation component
import Animation from './components/Animation';

function App() {
  // 🟡 State to control the loader animation
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Show animation for 2.5 seconds
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Show animation before main app loads
  if (loading) return <Animation />;

  // ✅ Main application routes
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes with MainLayout */}
        <Route path="/" element={<MainLayout><Home /></MainLayout>} />
        <Route path="/about" element={<MainLayout><About /></MainLayout>} />
        <Route path="/events" element={<MainLayout><Events /></MainLayout>} />
        <Route path="/events/:eventId" element={<MainLayout><EventDetail /></MainLayout>} />
        <Route path="/propose-event" element={<MainLayout><PrivateRoute><ProposeEvent /></PrivateRoute></MainLayout>} />
        <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
        <Route path="/membership" element={<MainLayout><Membership /></MainLayout>} />
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/register" element={<MainLayout><Register /></MainLayout>} />
        <Route path="/forgot-password" element={<MainLayout><ForgotPassword /></MainLayout>} />
        <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
        <Route path="/blog" element={<MainLayout><Blog /></MainLayout>} />
        <Route path="/blog/:postId" element={<MainLayout><BlogPost /></MainLayout>} />
        <Route path="/forum" element={<MainLayout><Forum /></MainLayout>} />
        <Route path="/forum/:postId" element={<MainLayout><ForumPost /></MainLayout>} />

        {/* Admin routes with AdminLayout */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminLayout><AdminUsers /></AdminLayout></AdminRoute>} />
        <Route path="/admin/events" element={<AdminRoute><AdminLayout><AdminEvents /></AdminLayout></AdminRoute>} />
        <Route path="/admin/event-proposals" element={<AdminRoute><AdminLayout><EventProposals /></AdminLayout></AdminRoute>} />
        <Route path="/admin/membership-applications" element={<AdminRoute><AdminLayout><MembershipApplications /></AdminLayout></AdminRoute>} />
        <Route path="/admin/contact-messages" element={<AdminRoute><AdminLayout><ContactMessages /></AdminLayout></AdminRoute>} />
        <Route path="/admin/posts" element={<AdminRoute><AdminLayout><AdminPosts /></AdminLayout></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;











 ///////////////////////////////////////////////////////////////////////////////////////*********************************** */

// import React from 'react';

// function App() {
//   return (
//     <div style={{ color: 'white', background: 'black', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//       <h1>Hello GaganVedhi</h1>
//     </div>
//   );
// }

// export default App;





// **********************************??
// import Loader from './Loader';

// function App() {
//   return <Loader />;
// }

// export default App; // <-- this is required!



