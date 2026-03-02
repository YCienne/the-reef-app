import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import CourseCatalog from './pages/CourseCatalog';
import CourseDetail from './pages/CourseDetail';
import CourseContent from './pages/CourseContent';
import Quiz from './pages/Quiz';
import AdminUpload from './admin/AdminUpload';
import AdminEditCourse from './admin/AdminEditCourse';
import ChatWidget from './components/ChatWidget';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardRouter from './pages/DashboardRouter';
import './App.css';

function MainApp() {
  const location = useLocation();

  // Paths where the footer should be hidden
  const hideFooterPaths = ['/dashboard', '/admin/upload'];
  const isLearnPath = location.pathname.startsWith('/learn/');
  const isQuizPath = location.pathname.startsWith('/quiz/');
  const isAdminEditPath = location.pathname.startsWith('/admin/edit/');

  const shouldHideFooter = hideFooterPaths.some(path => location.pathname === path) || isLearnPath || isQuizPath || isAdminEditPath;

  return (
    <div className="App">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardRouter />
            </PrivateRoute>
          } />
          <Route path="/learn/:courseId/:lessonId" element={
            <PrivateRoute>
              <CourseContent />
            </PrivateRoute>
          } />
          <Route path="/quiz/:courseId/:moduleId" element={
            <PrivateRoute>
              <Quiz />
            </PrivateRoute>
          } />
          <Route path="/admin/upload" element={
            <PrivateRoute requiredRole="admin">
              <AdminUpload />
            </PrivateRoute>
          } />
          <Route path="/admin/edit/:id" element={
            <PrivateRoute requiredRole="admin">
              <AdminEditCourse />
            </PrivateRoute>
          } />
        </Routes>
      </main>
      <ChatWidget />
      {!shouldHideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </Router>
  );
}

export default App;