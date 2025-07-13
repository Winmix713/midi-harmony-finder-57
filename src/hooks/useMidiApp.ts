import { useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { Midi } from '@tonejs/midi';

export interface MidiData {
  name: string;
  tracks: Array<{ notes: Array<{ midi: number; time: number; duration: number; velocity: number }> }>;
  duration: number;
}

interface MidiAppState {
  files: {
    file1: File | null;
    file2: File | null;
  };
  midiData: {
    data1: MidiData | null;
    data2: MidiData | null;
  };
  ui: {
    isProcessing: boolean;
    processingMode: 'client' | 'server';
  };
}

export function useMidiApp() {
  const [state, setState] = useState<MidiAppState>({
    files: { file1: null, file2: null },
    midiData: { data1: null, data2: null },
    ui: { isProcessing: false, processingMode: 'client' }
  });

  // Optimized MIDI processing with caching
  const processMidiFile = useCallback(async (file: File): Promise<MidiData> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const midi = new Midi(arrayBuffer);
      
      return {
        name: file.name,
        tracks: midi.tracks.map(track => ({
          notes: track.notes.map(note => ({
            midi: note.midi,
            time: note.time,
            duration: note.duration,
            velocity: note.velocity
          }))
        })),
        duration: midi.duration
      };
    } catch (error) {
      console.error('Failed to process MIDI file:', error);
      toast.error(`Failed to process ${file.name}. Please check the file format.`);
      throw error;
    }
  }, []);

  // Batch state updates for better performance
  const updateFiles = useCallback((file1: File | null, file2: File | null) => {
    setState(prev => ({
      ...prev,
      files: { file1, file2 }
    }));
  }, []);

  const updateMidiData = useCallback((data1: MidiData | null, data2: MidiData | null) => {
    setState(prev => ({
      ...prev,
      midiData: { data1, data2 }
    }));
  }, []);

  const setProcessing = useCallback((isProcessing: boolean) => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, isProcessing }
    }));
  }, []);

  const setProcessingMode = useCallback((mode: 'client' | 'server') => {
    setState(prev => ({
      ...prev,
      ui: { ...prev.ui, processingMode: mode }
    }));
  }, []);

  // Optimized file loading with better error handling
  const loadMidiFile = useCallback(async (file: File, slot: 1 | 2) => {
    setProcessing(true);
    
    try {
      const midiData = await processMidiFile(file);
      
      setState(prev => {
        const newFiles = { ...prev.files };
        const newMidiData = { ...prev.midiData };
        
        if (slot === 1) {
          newFiles.file1 = file;
          newMidiData.data1 = midiData;
        } else {
          newFiles.file2 = file;
          newMidiData.data2 = midiData;
        }
        
        return {
          ...prev,
          files: newFiles,
          midiData: newMidiData
        };
      });
      
      toast.success(`${file.name} loaded successfully!`);
      return midiData;
    } catch (error) {
      console.error('Error loading MIDI file:', error);
      throw error;
    } finally {
      setProcessing(false);
    }
  }, [processMidiFile, setProcessing]);

  // Clear specific slot
  const clearSlot = useCallback((slot: 1 | 2) => {
    setState(prev => {
      const newFiles = { ...prev.files };
      const newMidiData = { ...prev.midiData };
      
      if (slot === 1) {
        newFiles.file1 = null;
        newMidiData.data1 = null;
      } else {
        newFiles.file2 = null;
        newMidiData.data2 = null;
      }
      
      return {
        ...prev,
        files: newFiles,
        midiData: newMidiData
      };
    });
  }, []);

  // Reset all data
  const resetAll = useCallback(() => {
    setState({
      files: { file1: null, file2: null },
      midiData: { data1: null, data2: null },
      ui: { isProcessing: false, processingMode: 'client' }
    });
  }, []);

  // Memoized derived state
  const derivedState = useMemo(() => ({
    hasFiles: !!(state.files.file1 && state.files.file2),
    hasMidiData: !!(state.midiData.data1 && state.midiData.data2),
    canCompare: !!(state.midiData.data1 && state.midiData.data2 && !state.ui.isProcessing),
    fileCount: [state.files.file1, state.files.file2].filter(Boolean).length,
    midiDataCount: [state.midiData.data1, state.midiData.data2].filter(Boolean).length
  }), [state]);

  return {
    // State
    ...state,
    ...derivedState,
    
    // Actions
    processMidiFile,
    loadMidiFile,
    updateFiles,
    updateMidiData,
    setProcessing,
    setProcessingMode,
    clearSlot,
    resetAll
  };
}