import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import LoginPage from "./components/auth/LoginPage";
import NotFound from "./views/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { ConfigProvider, useConfig } from "./contexts/ConfigContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Header from "./components/Header";
import Sidebar from "./components/navigation/Sidebar";
import BottomNav from "./components/navigation/BottomNav";
import FAB from "./components/FAB";
import HistoryView from "./views/HistoryView";
import HistoryList from "./components/history/HistoryList";
import GoalsSection from "./components/goals/GoalsSection";
import EntryView from "./views/EntryView";
import StatisticsView from "./components/stats/StatisticsView";
import SettingsView from "./views/SettingsView";
import GoalsView from "./views/GoalsView";
import { ToastProvider } from "./components/ui/ToastProvider";
import AchievementsView from "./views/AchievementsView";
import LandingPage from "./views/LandingPage";
import AboutPage from "./views/AboutPage";
import { useMoodData } from "./hooks/useMoodData";
import { useGroups } from "./hooks/useGroups";
import { useStatistics } from "./hooks/useStatistics";
import "./App.css";

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Custom hooks
  const { pastEntries, setPastEntries, loading: historyLoading, error: historyError, refreshHistory } = useMoodData();
  const { groups, createGroup, createGroupOption, deleteGroup } = useGroups();
  const { statistics, currentStreak, loading: statsLoading, error: statsError, loadStatistics } = useStatistics();

  const handleMoodSelect = (moodValue) => {
    navigate('/dashboard/entry', { state: { mood: moodValue } });
  };

  const handleBackToHistory = () => {
    navigate('/dashboard');
  };

  const handleEntrySubmitted = () => {
    navigate('/dashboard');
    refreshHistory();
  };

  const handleEntryDeleted = (deletedEntryId) => {
    // Remove the deleted entry from the local state
    setPastEntries(prev => prev.filter(entry => entry.id !== deletedEntryId));
  };

  const handleStartEdit = (entry) => {
    navigate('/dashboard/entry', { state: { entry: entry, mood: entry.mood } });
  };

  const handleEditMoodSelect = (moodValue) => {
    navigate('.', { state: { ...location.state, mood: moodValue }, replace: true });
  };

  const handleEntryUpdated = (updatedEntry) => {
    setPastEntries(prev => prev.map(entry => (
      entry.id === updatedEntry.id ? { ...entry, ...updatedEntry } : entry
    )));
    navigate('/dashboard');
    refreshHistory();
  };

  // Helper to get state from location
  const locationState = location.state || {};
  const { mood: selectedMood, entry: editingEntry } = locationState;
  
  // Determine if we are in entry view for layout purposes (no sidebar)
  const isEntryView = location.pathname.endsWith('/entry');

  useEffect(() => {
    const handler = () => {
      if (!location.pathname.startsWith('/dashboard')) {
        navigate('/dashboard');
        return;
      }

      // Navigate to the new entry page
      navigate('/dashboard/entry');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('nightlio:new-entry', handler);
    return () => window.removeEventListener('nightlio:new-entry', handler);
  }, [location.pathname, navigate]);

  return (
    <>
      <div className={`app-page ${isEntryView ? 'no-sidebar' : ''}`}>
        <Sidebar
          onLoadStatistics={loadStatistics}
        />
        
        <div className="app-shell">
          <Header currentStreak={currentStreak} />

          <div className="app-layout">

            <main className="app-main">
              <Routes>
                <Route index element={
                  <HistoryView
                    pastEntries={pastEntries}
                    loading={historyLoading}
                    error={historyError}
                    onMoodSelect={handleMoodSelect}
                    onDelete={handleEntryDeleted}
                    onEdit={handleStartEdit}
                    renderOnlyHeader={true}
                  />
                } />
                <Route path="entry" element={
                  <EntryView
                    selectedMood={selectedMood}
                    groups={groups}
                    onBack={handleBackToHistory}
                    onCreateGroup={createGroup}
                    onCreateOption={createGroupOption}
                    onDeleteGroup={deleteGroup}
                    onEntrySubmitted={handleEntrySubmitted}
                    editingEntry={editingEntry}
                    onEntryUpdated={handleEntryUpdated}
                    onEditMoodSelect={handleEditMoodSelect}
                    onSelectMood={handleMoodSelect}
                  />
                } />
                <Route path="stats" element={
                  <StatisticsView
                    statistics={statistics}
                    pastEntries={pastEntries}
                    loading={statsLoading}
                    error={statsError}
                  />
                } />
                <Route path="achievements" element={<AchievementsView />} />
                <Route path="goals" element={<GoalsView />} />
                <Route path="settings" element={<SettingsView />} />
              </Routes>
            </main>
            
            <Routes>
              <Route index element={
                <>
                  <section className="app-wide" aria-label="Goals section">
                    <GoalsSection onNavigateToGoals={() => navigate('/dashboard/goals')} />
                  </section>
                  <section className="app-wide" aria-label="History entries">
                    <h2 style={{ margin: '0 0 var(--space-1) 0', paddingLeft: 'calc(var(--space-1) / 2)', paddingTop: 0, paddingBottom: 'calc(var(--space-1) / 2)', color: 'var(--text)' }}>History</h2>
                    <HistoryList 
                      entries={pastEntries}
                      loading={historyLoading}
                      error={historyError}
                      onDelete={handleEntryDeleted}
                      onEdit={handleStartEdit}
                    />
                  </section>
                </>
              } />
            </Routes>
          </div>
        </div>
      </div>

      <BottomNav
        onLoadStatistics={loadStatistics}
      />

      <FAB
        onClick={() => {
          if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            navigate('/dashboard');
          }
        }}
        label="Scroll to top"
      />
    </>
  );
};

function App() {
  return (
    <ConfigProvider>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <AppContent />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;
