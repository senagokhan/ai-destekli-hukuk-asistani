import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes/AppRoutes';
import { useAuthStore } from '@/auth/useAuthStore';
import { Toaster } from '@/components/ui/toaster';
import { SelectedDocumentProvider } from '@/context/SelectedDocumentContext';

function App() {
  const { bootstrapFromStorage } = useAuthStore();

  useEffect(() => {
    bootstrapFromStorage();
  }, [bootstrapFromStorage]);

  return (
    <SelectedDocumentProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster />
      </BrowserRouter>
    </SelectedDocumentProvider>
  );
}

export default App;
