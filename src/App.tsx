import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataSyncProvider } from './context/DataSyncContext';
import { LoginForm } from './components/auth/LoginForm';
import { Navbar } from './components/layout/Navbar';
import { SyncStatusBar } from './components/layout/SyncStatusBar';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/views/Dashboard';
import { Pipelines } from './components/views/Pipelines';
import { CreatePipeline } from './components/views/CreatePipeline';
import { Data } from './components/views/Data';
import { Models } from './components/views/Models';
import { Monitoring } from './components/views/Monitoring';
import { Alerts } from './components/views/Alerts';
import { Logs } from './components/views/Logs';
import { SyncDashboard } from './components/views/SyncDashboard';
import { Settings } from './components/views/Settings';
import { AIAssistant } from './components/ai/AIAssistant';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'pipelines': return <Pipelines />;
      case 'create-pipeline': return <CreatePipeline onBack={() => setActiveView('pipelines')} />;
      case 'data': return <Data />;
      case 'models': return <Models />;
      case 'monitoring': return <Monitoring />;
      case 'alerts': return <Alerts />;
      case 'logs': return <Logs />;
      case 'sync': return <SyncDashboard />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <SyncStatusBar />
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 overflow-auto p-6" style={{ height: 'calc(100vh - 120px)' }}>
          {renderView()}
        </main>
      </div>
      <AIAssistant currentView={activeView} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataSyncProvider>
        <AppContent />
      </DataSyncProvider>
    </AuthProvider>
  );
}

export default App;