import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from '@/auth/RequireAuth';
import { AppLayout } from '@/layouts/AppLayout';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Dashboard } from '@/pages/Dashboard';
import { Documents } from '@/pages/Documents';
import { DocumentDetail } from '@/pages/DocumentDetail';
import { Cases } from '@/pages/Cases';
import { CaseDetail } from '@/pages/CaseDetail';
import { Profile } from '@/pages/Profile';
import ChatPage from "@/pages/ChatPage";
import { NotFound } from '@/pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppLayout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/documents/:id" element={<DocumentDetail />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </RequireAuth>
        }
      />
    </Routes>
  );
};
