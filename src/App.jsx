import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import DashboardHome from './pages/DashboardHome';
import CourseLibrary from './pages/CourseLibrary';
import LessonPlayer from './pages/LessonPlayer';
import SpeechPractice from './pages/SpeechPractice';
import DyslexiaCenter from './pages/DyslexiaCenter';
import NLPWritingAssistant from './pages/NLPWritingAssistant';

import Register from './pages/Register';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import AdminDashboard from './pages/AdminDashboard';
import GuardianDashboard from './pages/GuardianDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseBuilder from './pages/CourseBuilder';
import Forum from './pages/Forum';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="student"><DashboardHome /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute requiredRole="student"><CourseLibrary /></ProtectedRoute>} />
        <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/lesson/:courseId" element={<ProtectedRoute requiredRole="student"><LessonPlayer /></ProtectedRoute>} />
        <Route path="/quiz/:courseId" element={<ProtectedRoute requiredRole="student"><Quiz /></ProtectedRoute>} />
        <Route path="/speech-practice" element={<ProtectedRoute requiredRole="student"><SpeechPractice /></ProtectedRoute>} />
        <Route path="/dyslexia-center" element={<ProtectedRoute requiredRole="student"><DyslexiaCenter /></ProtectedRoute>} />
        <Route path="/nlp-lab" element={<ProtectedRoute requiredRole="student"><NLPWritingAssistant /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/guardian-dashboard"
          element={
            <ProtectedRoute requiredRole="parent">
              <GuardianDashboard />
            </ProtectedRoute>
          }
        />

        {/* Teacher Routes */}
        <Route
          path="/teacher-dashboard"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher/course-builder/:courseId"
          element={
            <ProtectedRoute requiredRole="teacher">
              <CourseBuilder />
            </ProtectedRoute>
          }
        />

        {/* Add more routes here */}
      </Routes>
    </Router>
  );
}




export default App;
