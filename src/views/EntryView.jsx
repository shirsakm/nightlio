import { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CloudOff,
  Loader2,
} from 'lucide-react';
import MoodPicker from '../components/mood/MoodPicker';
import MoodDisplay from '../components/mood/MoodDisplay';
import GroupSelector from '../components/groups/GroupSelector';
import GroupManager from '../components/groups/GroupManager';
import MDArea from '../components/MarkdownArea.jsx';
import apiService from '../services/api';
import { useToast } from '../components/ui/ToastProvider';
import { useBurner } from '../contexts/BurnerContext';

const DEFAULT_MARKDOWN = `# How was your day?

Write about your thoughts, feelings, and experiences...`;
const DEFAULT_MARKDOWN_TRIMMED = DEFAULT_MARKDOWN.trim();
const AUTOSAVE_DEBOUNCE_MS = 1200;

const normalizeSelectedOptions = (optionIds = []) => (
  [...optionIds].map((id) => Number(id)).filter((id) => Number.isFinite(id)).sort((a, b) => a - b)
);

const buildSnapshot = ({ mood, content, selectedOptions }) => (
  JSON.stringify({
    mood: mood ?? null,
    content: content ?? '',
    selected_options: normalizeSelectedOptions(selectedOptions),
  })
);

const EntryView = ({
  selectedMood,
  groups,
  onBack,
  onEntryDeleted,
  onCreateGroup,
  onCreateOption,
  onSelectMood,
  editingEntry = null,
  onEntryUpdated,
  onEditMoodSelect,
}) => {
  const isEditing = Boolean(editingEntry);
  const initialSelectionIds = editingEntry?.selections?.map((selection) => selection.id) ?? [];

  const [selectedOptions, setSelectedOptions] = useState(initialSelectionIds);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [markdownContent, setMarkdownContent] = useState(editingEntry?.content || DEFAULT_MARKDOWN);
  const [activeEntryId, setActiveEntryId] = useState(editingEntry?.id ?? null);
  const [saveState, setSaveState] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');

  const markdownRef = useRef();
  const autosaveTimerRef = useRef(null);
  const isHydratingEditorRef = useRef(false);
  const saveInFlightRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const latestPayloadRef = useRef(null);
  const lastSavedSnapshotRef = useRef('');
  const activeEntryIdRef = useRef(activeEntryId);
  const createdByAutosaveRef = useRef(false);
  const skipAutosaveFlushRef = useRef(false);

  const { show } = useToast();
  const { isBurnerMode } = useBurner();

  const clearAutosaveTimer = useCallback(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    activeEntryIdRef.current = activeEntryId;
  }, [activeEntryId]);

  useEffect(() => {
    if (isEditing && editingEntry) {
      createdByAutosaveRef.current = false;
      skipAutosaveFlushRef.current = false;

      const selectionIds = editingEntry.selections?.map((selection) => selection.id) ?? [];
      const content = editingEntry.content || '';

      setSelectedOptions(selectionIds);
      setActiveEntryId(editingEntry.id);
      setMarkdownContent(content);

      isHydratingEditorRef.current = true;
      const instance = markdownRef.current?.getInstance?.();
      if (instance && typeof instance.setMarkdown === 'function') {
        instance.setMarkdown(content);
      }
      queueMicrotask(() => {
        isHydratingEditorRef.current = false;
      });

      lastSavedSnapshotRef.current = buildSnapshot({
        mood: selectedMood ?? editingEntry.mood,
        content,
        selectedOptions: selectionIds,
      });
      setLastSavedAt(new Date());
      setSaveState(isBurnerMode ? 'disabled' : 'saved');
      setSaveErrorMessage('');
      return;
    }

    setSelectedOptions([]);
    setActiveEntryId(null);
    setMarkdownContent(DEFAULT_MARKDOWN);
    createdByAutosaveRef.current = false;
    skipAutosaveFlushRef.current = false;

    isHydratingEditorRef.current = true;
    const instance = markdownRef.current?.getInstance?.();
    if (instance && typeof instance.setMarkdown === 'function') {
      instance.setMarkdown(DEFAULT_MARKDOWN);
    }
    queueMicrotask(() => {
      isHydratingEditorRef.current = false;
    });

    lastSavedSnapshotRef.current = buildSnapshot({
      mood: selectedMood,
      content: DEFAULT_MARKDOWN,
      selectedOptions: [],
    });
    setLastSavedAt(null);
    setSaveState(isBurnerMode ? 'disabled' : 'idle');
    setSaveErrorMessage('');
  }, [isEditing, editingEntry, isBurnerMode]);

  useEffect(() => {
    if (!isEditing) {
      setShowMoodPicker(false);
    }
  }, [isEditing]);

  useEffect(() => {
    if (isBurnerMode) {
      clearAutosaveTimer();
      setSaveState('disabled');
      return;
    }

    if (saveState === 'disabled') {
      setSaveState('idle');
    }
  }, [isBurnerMode, saveState, clearAutosaveTimer]);

  const executeAutosave = useCallback(
    async (payload, snapshot, silentError = false) => {
      if (isBurnerMode) return false;

      if (saveInFlightRef.current) {
        pendingSaveRef.current = true;
        return false;
      }

      saveInFlightRef.current = true;
      setSaveState('saving');
      setSaveErrorMessage('');

      try {
        if (activeEntryIdRef.current) {
          const response = await apiService.updateMoodEntry(activeEntryIdRef.current, payload);
          const updatedEntry = response?.entry
            ? {
                ...response.entry,
                selections: response.entry.selections ?? [],
              }
            : {
                id: activeEntryIdRef.current,
                mood: payload.mood,
                content: payload.content,
                selections: normalizeSelectedOptions(payload.selected_options).map((id) => ({ id })),
              };

          if (typeof onEntryUpdated === 'function') {
            onEntryUpdated(updatedEntry, {
              navigateAfterSave: false,
              refreshAfterSave: false,
            });
          }
        } else {
          const now = new Date();
          const createPayload = {
            ...payload,
            date: now.toLocaleDateString(),
            time: now.toISOString(),
          };

          const response = await apiService.createMoodEntry(createPayload);
          const newEntryId = response?.entry_id;

          if (newEntryId) {
            setActiveEntryId(newEntryId);
            activeEntryIdRef.current = newEntryId;
            createdByAutosaveRef.current = true;

            if (typeof onEntryUpdated === 'function') {
              onEntryUpdated(
                {
                  id: newEntryId,
                  mood: payload.mood,
                  content: payload.content,
                  date: createPayload.date,
                  created_at: createPayload.time,
                  selections: normalizeSelectedOptions(payload.selected_options).map((id) => ({ id })),
                },
                {
                  navigateAfterSave: false,
                  refreshAfterSave: true,
                }
              );
            }
          }

          if (response?.new_achievements?.length) {
            show('Saved. New achievements unlocked.', 'success');
          }
        }

        lastSavedSnapshotRef.current = snapshot;
        setLastSavedAt(new Date());
        setSaveState('saved');
        return true;
      } catch (error) {
        console.error('Autosave failed:', error);
        setSaveState('error');
        setSaveErrorMessage('Autosave failed. Retrying when changes continue.');
        if (!silentError) {
          show('Autosave failed. Your changes are still in the editor.', 'error');
        }
        return false;
      } finally {
        saveInFlightRef.current = false;

        if (pendingSaveRef.current) {
          pendingSaveRef.current = false;
          const latest = latestPayloadRef.current;
          if (latest && latest.snapshot !== lastSavedSnapshotRef.current) {
            void executeAutosave(latest.payload, latest.snapshot, true);
          }
        }
      }
    },
    [isBurnerMode, onEntryUpdated, show]
  );

  const flushPendingSave = useCallback(async () => {
    if (skipAutosaveFlushRef.current) return true;

    clearAutosaveTimer();

    const latest = latestPayloadRef.current;
    if (!latest) return true;
    if (latest.snapshot === lastSavedSnapshotRef.current) return true;

    return executeAutosave(latest.payload, latest.snapshot);
  }, [clearAutosaveTimer, executeAutosave]);

  useEffect(() => {
    return () => {
      clearAutosaveTimer();
    };
  }, [clearAutosaveTimer]);

  useEffect(() => {
    return () => {
      if (!skipAutosaveFlushRef.current) {
        void flushPendingSave();
      }
    };
  }, [flushPendingSave]);

  useEffect(() => {
    if (isBurnerMode) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        void flushPendingSave();
      }
    };

    const handleBeforeUnload = (event) => {
      if (saveState === 'dirty' || saveState === 'saving') {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flushPendingSave, isBurnerMode, saveState]);

  useEffect(() => {
    clearAutosaveTimer();

    const payload = {
      mood: selectedMood ? Number(selectedMood) : null,
      content: markdownContent || '',
      selected_options: normalizeSelectedOptions(selectedOptions),
    };
    const snapshot = buildSnapshot({
      mood: payload.mood,
      content: payload.content,
      selectedOptions: payload.selected_options,
    });

    latestPayloadRef.current = { payload, snapshot };

    if (isBurnerMode) {
      setSaveState('disabled');
      return;
    }

    if (!payload.mood) {
      setSaveState('idle');
      return;
    }

    const trimmed = payload.content.trim();
    const hasMeaningfulContent = Boolean(trimmed) && trimmed !== DEFAULT_MARKDOWN_TRIMMED;

    if (!hasMeaningfulContent) {
      setSaveState(activeEntryIdRef.current ? 'saved' : 'idle');
      return;
    }

    if (snapshot === lastSavedSnapshotRef.current) {
      if (!saveInFlightRef.current) {
        setSaveState('saved');
      }
      return;
    }

    setSaveState('dirty');

    autosaveTimerRef.current = setTimeout(() => {
      const latest = latestPayloadRef.current;
      if (!latest) return;
      if (latest.snapshot === lastSavedSnapshotRef.current) return;
      void executeAutosave(latest.payload, latest.snapshot);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => {
      clearAutosaveTimer();
    };
  }, [
    selectedMood,
    selectedOptions,
    markdownContent,
    isBurnerMode,
    executeAutosave,
    clearAutosaveTimer,
  ]);

  const handleOptionToggle = (optionId) => {
    setSelectedOptions((prev) => (
      prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]
    ));
  };

  const handleMoodSelection = (moodValue) => {
    if (isEditing) {
      if (typeof onEditMoodSelect === 'function') {
        onEditMoodSelect(moodValue);
      }
      setShowMoodPicker(false);
    } else if (typeof onSelectMood === 'function') {
      onSelectMood(moodValue);
    }
  };

  const handleEditorChange = (nextMarkdown) => {
    if (isHydratingEditorRef.current) return;
    setMarkdownContent(nextMarkdown || '');
  };

  const resetDraftComposer = () => {
    isHydratingEditorRef.current = true;
    markdownRef.current?.getInstance?.()?.setMarkdown(DEFAULT_MARKDOWN);
    queueMicrotask(() => {
      isHydratingEditorRef.current = false;
    });

    setMarkdownContent(DEFAULT_MARKDOWN);
    setSelectedOptions([]);
    setShowMoodPicker(false);
    setSaveErrorMessage('');
    setSaveState('disabled');

    const resetSnapshot = buildSnapshot({
      mood: selectedMood,
      content: DEFAULT_MARKDOWN,
      selectedOptions: [],
    });
    lastSavedSnapshotRef.current = resetSnapshot;
    latestPayloadRef.current = {
      payload: {
        mood: selectedMood ? Number(selectedMood) : null,
        content: DEFAULT_MARKDOWN,
        selected_options: [],
      },
      snapshot: resetSnapshot,
    };
  };

  const handleCancel = async () => {
    clearAutosaveTimer();

    if (!isEditing && !isBurnerMode && saveInFlightRef.current && !activeEntryIdRef.current) {
      show('Autosave is still finishing. Please tap Cancel again in a moment.', 'info');
      return;
    }

    skipAutosaveFlushRef.current = true;

    if (isBurnerMode && !isEditing) {
      resetDraftComposer();
    }

    if (!isEditing && createdByAutosaveRef.current && activeEntryIdRef.current) {
      try {
        const draftId = activeEntryIdRef.current;
        await apiService.deleteMoodEntry(draftId);
        if (typeof onEntryDeleted === 'function') {
          onEntryDeleted(draftId);
        }
        show('Draft discarded.', 'success');
      } catch (error) {
        console.error('Failed to discard autosaved draft:', error);
        skipAutosaveFlushRef.current = false;
        show('Could not discard the autosaved draft. Please try again.', 'error');
        return;
      }
    }

    if (typeof onBack === 'function') {
      onBack();
    }
  };

  const saveStatusMeta = (() => {
    if (isBurnerMode) {
      return {
        label: 'Saving is turned off in burner mode.',
        Icon: CloudOff,
      };
    }

    if (saveState === 'saving') {
      return {
        label: 'Saving...',
        Icon: Loader2,
      };
    }

    if (saveState === 'dirty') {
      return {
        label: 'Unsaved changes',
        Icon: AlertCircle,
      };
    }

    if (saveState === 'error') {
      return {
        label: saveErrorMessage || 'Autosave error',
        Icon: AlertCircle,
      };
    }

    if (saveState === 'saved') {
      const timestamp = lastSavedAt
        ? lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';
      return {
        label: timestamp ? `Saved at ${timestamp}` : 'All changes saved',
        Icon: CheckCircle2,
      };
    }

    return {
      label: 'Waiting for changes',
      Icon: Clock3,
    };
  })();

  if (!selectedMood && !isEditing) {
    return (
      <div style={{ marginTop: '1rem' }}>
        <h3 style={{ marginTop: 0 }}>
          Pick your mood to start an entry
        </h3>
        <MoodPicker onMoodSelect={handleMoodSelection} />
      </div>
    );
  }

  return (
    <div className="entry-container" style={{ position: 'relative' }}>
      <div className="entry-grid">
        <div className="entry-left">
          {isEditing && editingEntry && (
            <div style={{
              marginBottom: '0.75rem',
              fontSize: '0.85rem',
              color: 'color-mix(in oklab, var(--text), transparent 40%)',
            }}>
              Editing entry from <strong style={{ color: 'var(--text)' }}>{editingEntry.date}</strong>
            </div>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <MoodDisplay moodValue={selectedMood} showLabel={false}>
              <div className="entry-mood-actions">
                <button
                  type="button"
                  className="entry-icon-button"
                  onClick={handleCancel}
                  aria-label="Cancel"
                  title="Cancel"
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                </button>

                <div className={`entry-autosave-status is-${saveState}`} role="status" aria-live="polite">
                  <saveStatusMeta.Icon
                    size={16}
                    className={saveState === 'saving' ? 'is-spinning' : ''}
                    aria-hidden="true"
                  />
                  <span>{saveStatusMeta.label}</span>
                </div>
              </div>
            </MoodDisplay>
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowMoodPicker(true)}
                style={{
                  marginTop: '0.75rem',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '999px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                }}
              >
                Change mood
              </button>
            )}
          </div>
          {isEditing && showMoodPicker && (
            <div
              style={{
                marginBottom: '1rem',
                padding: '1rem',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <p style={{ marginTop: 0, marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text)' }}>
                Pick a new mood
              </p>
              <MoodPicker onMoodSelect={handleMoodSelection} />
              <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                <button
                  type="button"
                  onClick={() => setShowMoodPicker(false)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    borderRadius: '999px',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    color: 'color-mix(in oklab, var(--text), transparent 30%)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          <GroupSelector
            groups={groups}
            selectedOptions={selectedOptions}
            onOptionToggle={handleOptionToggle}
          />
          <div style={{ marginTop: '1rem' }}>
            <GroupManager
              groups={groups}
              onCreateGroup={onCreateGroup}
              onCreateOption={onCreateOption}
            />
          </div>
        </div>

        <div className="entry-right">
          <MDArea
            ref={markdownRef}
            initialMarkdown={editingEntry?.content || DEFAULT_MARKDOWN}
            onChange={handleEditorChange}
          />
        </div>
      </div>
    </div>
  );
};

export default EntryView;
