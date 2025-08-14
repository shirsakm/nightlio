import { useState } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { Web3Provider } from "./contexts/Web3Context";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Header from "./components/Header";
import Navigation from "./components/Navigation";
import HistoryView from "./views/HistoryView";
import EntryView from "./views/EntryView";
import StatisticsView from "./components/stats/StatisticsView";
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

  return (
    <>
      <Header currentView={currentView} currentStreak={currentStreak} />
      
      <Navigation 
        currentView={currentView} 
        onViewChange={handleViewChange}
        onLoadStatistics={loadStatistics}
      />

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

      {currentView === "achievements" && (
        <AchievementsView />
      )}
    </>
  );
};

function App() {
  return (
    <Web3Provider>
      <AuthProvider>
        <ProtectedRoute>
          <AppContent />
        </ProtectedRoute>
      </AuthProvider>
    </Web3Provider>
  );
}

export default App;