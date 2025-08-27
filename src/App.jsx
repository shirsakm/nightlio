import { useEffect, useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { ConfigProvider, useConfig } from "./contexts/ConfigContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Header from "./components/Header";
import Sidebar from "./components/navigation/Sidebar";
import BottomNav from "./components/navigation/BottomNav";
import FAB from "./components/FAB";
import HistoryView from "./views/HistoryView";
import EntryView from "./views/EntryView";
import StatisticsView from "./components/stats/StatisticsView";
import SettingsView from "./views/SettingsView";
import { ToastProvider } from "./components/ui/ToastProvider";
import AchievementsView from "./views/AchievementsView";
import { useMoodData } from "./hooks/useMoodData";
import { useGroups } from "./hooks/useGroups";
import { useStatistics } from "./hooks/useStatistics";
import "./App.css";

const AppContent = () => {
  const [currentView, setCurrentView] = useState("history");
  const [selectedMood, setSelectedMood] = useState(null);
  
  // Custom hooks
  const { pastEntries, setPastEntries, loading: historyLoading, error: historyError, refreshHistory } = useMoodData();
  const { groups, createGroup, createGroupOption } = useGroups();
  const { statistics, currentStreak, loading: statsLoading, error: statsError, loadStatistics } = useStatistics();

  const handleMoodSelect = (moodValue) => {
    setSelectedMood(moodValue);
    setCurrentView("entry");
  };

  const handleBackToHistory = () => {
    setCurrentView("history");
    setSelectedMood(null);
  };

  const handleEntrySubmitted = () => {
    setCurrentView("history");
    setSelectedMood(null);
    refreshHistory();
  };

  const handleEntryDeleted = (deletedEntryId) => {
    // Remove the deleted entry from the local state
    setPastEntries(prev => prev.filter(entry => entry.id !== deletedEntryId));
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  useEffect(() => {
    const handler = () => setCurrentView('entry');
    window.addEventListener('nightlio:new-entry', handler);
    return () => window.removeEventListener('nightlio:new-entry', handler);
  }, []);

  return (
    <>
      <div className={`app-page ${currentView === 'entry' ? 'no-sidebar' : ''}`}>
        <Sidebar
          currentView={currentView}
          onViewChange={handleViewChange}
          onLoadStatistics={loadStatistics}
        />
        
        <div className="app-shell">
          <Header currentView={currentView} currentStreak={currentStreak} />

          <div className="app-layout">

            <main className="app-main">
          {currentView === "history" && (
            <HistoryView
              pastEntries={pastEntries}
              loading={historyLoading}
              error={historyError}
              onMoodSelect={handleMoodSelect}
              onDelete={handleEntryDeleted}
            />
          )}

      {currentView === "entry" && (
            <EntryView
              selectedMood={selectedMood}
              groups={groups}
              onBack={handleBackToHistory}
              onCreateGroup={createGroup}
              onCreateOption={createGroupOption}
              onEntrySubmitted={handleEntrySubmitted}
        onSelectMood={(m) => setSelectedMood(m)}
            />
          )}

          {currentView === "stats" && (
            <StatisticsView
              statistics={statistics}
              pastEntries={pastEntries}
              loading={statsLoading}
              error={statsError}
            />
          )}

              {currentView === "achievements" && <AchievementsView />}
              {currentView === "settings" && <SettingsView />}
            </main>
          </div>
        </div>
      </div>

      <BottomNav
        currentView={currentView}
        onViewChange={handleViewChange}
        onLoadStatistics={loadStatistics}
      />

      <FAB onClick={() => handleViewChange("entry")} />
    </>
  );
};

const RootProviders = ({ children }) => {
  const { config, loading } = useConfig();
  if (loading) return null;
  const content = (
    <AuthProvider>
      <ProtectedRoute>
        {children}
      </ProtectedRoute>
    </AuthProvider>
  );
  return content;
};

function App() {
  return (
    <ConfigProvider>
      <ThemeProvider>
        <ToastProvider>
          <RootProviders>
            <AppContent />
          </RootProviders>
        </ToastProvider>
      </ThemeProvider>
    </ConfigProvider>
  );
}

export default App;