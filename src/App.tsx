import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Builder from './components/Builder';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#111315] text-[#f3ead9]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#ff6b3d]"></div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#aca18f]">Loading workspace</p>
        </div>
      </div>
    );
  }

  return user ? <Builder /> : <Auth />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
