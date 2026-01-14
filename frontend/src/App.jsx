import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/common/Layout';
import Login from './pages/auth/Login';
import Unauthorized from './pages/auth/Unauthorized';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminTeachers from './pages/admin/Teachers';
import AdminClasses from './pages/admin/Classes';
import AdminSubjects from './pages/admin/Subjects';
import AdminExams from './pages/admin/Exams';
import AdminPayments from './pages/admin/Payments';
import AdminSettings from './pages/admin/Settings';
import AdminStudentProfile from './pages/admin/StudentProfile';
import VerifyAccount from './pages/auth/VerifyAccount';
import Splash from './pages/auth/Splash';

import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherClasses from './pages/teacher/Classes';
import TeacherExams from './pages/teacher/Exams';
import TeacherAssignments from './pages/teacher/Assignments';

import StudentDashboard from './pages/student/Dashboard';
import StudentExams from './pages/student/Exams';
import StudentResults from './pages/student/Results';
import StudentAssignments from './pages/student/Assignments';
import Notifications from './pages/common/Notifications';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1e293b',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                backdropFilter: 'blur(8px)',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
                style: {
                  borderLeft: '4px solid #10b981',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
                style: {
                  borderLeft: '4px solid #ef4444',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/verify-account" element={<VerifyAccount />} />

            <Route element={<Layout />}>
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Navigate to="/admin/dashboard" /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
              <Route path="/admin/students/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudentProfile /></ProtectedRoute>} />
              <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><AdminTeachers /></ProtectedRoute>} />
              <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><AdminClasses /></ProtectedRoute>} />
              <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubjects /></ProtectedRoute>} />
              <Route path="/admin/exams" element={<ProtectedRoute allowedRoles={['admin']}><AdminExams /></ProtectedRoute>} />
              <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayments /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
              <Route path="/admin/notifications" element={<ProtectedRoute allowedRoles={['admin']}><Notifications /></ProtectedRoute>} />

              {/* Teacher Routes */}
              <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher']}><Navigate to="/teacher/dashboard" /></ProtectedRoute>} />
              <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
              <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherClasses /></ProtectedRoute>} />
              <Route path="/teacher/exams" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherExams /></ProtectedRoute>} />
              <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherAssignments /></ProtectedRoute>} />
              <Route path="/teacher/notifications" element={<ProtectedRoute allowedRoles={['teacher']}><Notifications /></ProtectedRoute>} />

              {/* Student Routes */}
              <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><Navigate to="/student/dashboard" /></ProtectedRoute>} />
              <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/exams" element={<ProtectedRoute allowedRoles={['student']}><StudentExams /></ProtectedRoute>} />
              <Route path="/student/results" element={<ProtectedRoute allowedRoles={['student']}><StudentResults /></ProtectedRoute>} />
              <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><StudentAssignments /></ProtectedRoute>} />
              <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><Notifications /></ProtectedRoute>} />
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={<Splash />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
