import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Toaster } from 'react-hot-toast';
import Layout from './components/common/Layout';
import PageLoader from './components/common/PageLoader';

// Lazy Load Pages for Performance
const Login = lazy(() => import('./pages/auth/Login'));
const Unauthorized = lazy(() => import('./pages/auth/Unauthorized'));
const VerifyAccount = lazy(() => import('./pages/auth/VerifyAccount'));
const Splash = lazy(() => import('./pages/auth/Splash'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminStudents = lazy(() => import('./pages/admin/Students'));
const AdminTeachers = lazy(() => import('./pages/admin/Teachers'));
const AdminClasses = lazy(() => import('./pages/admin/Classes'));
const AdminClassDetails = lazy(() => import('./pages/admin/ClassDetails'));
const AdminSubjects = lazy(() => import('./pages/admin/Subjects'));
const AdminExams = lazy(() => import('./pages/admin/Exams'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminStudentProfile = lazy(() => import('./pages/admin/StudentProfile'));
const StudentSearch = lazy(() => import('./pages/admin/StudentSearch'));
const TeacherSearch = lazy(() => import('./pages/admin/TeacherSearch'));

// Teacher Pages
const TeacherDashboard = lazy(() => import('./pages/teacher/Dashboard'));
const TeacherClasses = lazy(() => import('./pages/teacher/Classes'));
const TeacherExams = lazy(() => import('./pages/teacher/Exams'));
const TeacherAssignments = lazy(() => import('./pages/teacher/Assignments'));

// Student Pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const StudentExams = lazy(() => import('./pages/student/Exams'));
const StudentResults = lazy(() => import('./pages/student/Results'));
const StudentAssignments = lazy(() => import('./pages/student/Assignments'));

// Common Pages
const Notifications = lazy(() => import('./pages/common/Notifications'));

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/verify-account" element={<VerifyAccount />} />

              <Route element={<Layout />}>
                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Navigate to="/admin/dashboard" /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudents /></ProtectedRoute>} />
                <Route path="/admin/students/search" element={<ProtectedRoute allowedRoles={['admin']}><StudentSearch /></ProtectedRoute>} />
                <Route path="/admin/students/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudentProfile /></ProtectedRoute>} />
                <Route path="/admin/teachers" element={<ProtectedRoute allowedRoles={['admin']}><AdminTeachers /></ProtectedRoute>} />
                <Route path="/admin/teachers/search" element={<ProtectedRoute allowedRoles={['admin']}><TeacherSearch /></ProtectedRoute>} />
                <Route path="/admin/classes" element={<ProtectedRoute allowedRoles={['admin']}><AdminClasses /></ProtectedRoute>} />
                <Route path="/admin/classes/:id" element={<ProtectedRoute allowedRoles={['admin']}><AdminClassDetails /></ProtectedRoute>} />
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
          </Suspense>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
