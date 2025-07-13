import { useState, useCallback } from 'react';
import { Midi } from '@tonejs/midi';
import { toast } from 'sonner';
import { enhancedMidiComparison } from '@/lib/serverMidiComparison';

interface MidiData {
  name: string;
  tracks: Array<{ notes: Array<{ midi: number; time: number; duration: number; velocity: number }> }>;
  duration: number;
}

interface ComparisonResult {
  similarity: number;
  commonNotes: number;
  totalNotes1: number;
  totalNotes2: number;
  downloadBlob?: Blob;
}

interface EnhancedComparisonResult extends ComparisonResult {
  harmonicSimilarity: number;
  rhythmSimilarity: number;
  keySimilarity: number;
  analysisDetails: {
    commonChords: string[];
    commonIntervals: number[];
    tempoAnalysis: {
      file1Tempo: number;
      file2Tempo: number;
      tempoSimilarity: number;
    };
    keySignatures: {
      file1Key: string;
      file2Key: string;
      keyDistance: number;
    };
  };
}

export function useMidiComparison() {
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [enhancedResult, setEnhancedResult] = useState<EnhancedComparisonResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const compareMidiFiles = useCallback(async (midi1: MidiData, midi2: MidiData): Promise<ComparisonResult> => {
    // Extract all notes from both MIDI files
    const notes1 = midi1.tracks.flatMap(track => track.notes);
    const notes2 = midi2.tracks.flatMap(track => track.notes);

    // Create simplified note representations for comparison
    const noteSet1 = new Set(notes1.map(note => `${note.midi}_${note.time.toFixed(2)}`));
    const noteSet2 = new Set(notes2.map(note => `${note.midi}_${note.time.toFixed(2)}`));

    // Find common notes
    const commonNotesSet = new Set([...noteSet1].filter(note => noteSet2.has(note)));
    const commonNotes = commonNotesSet.size;

    // Calculate similarity score
    const similarity = commonNotes / Math.max(noteSet1.size, noteSet2.size);

    // Generate new MIDI with common notes
    const commonMidi = new Midi();
    const track = commonMidi.addTrack();
    
    // Add common notes to the new MIDI
    const commonNotesList = notes1.filter(note => 
      commonNotesSet.has(`${note.midi}_${note.time.toFixed(2)}`)
    );

    commonNotesList.forEach(note => {
      track.addNote({
        midi: note.midi,
        time: note.time,
        duration: note.duration || 0.5,
        velocity: note.velocity
      });
    });

    // Convert to downloadable blob
    const midiArray = commonMidi.toArray();
    const blob = new Blob([midiArray], { type: 'audio/midi' });

    return {
      similarity,
      commonNotes,
      totalNotes1: noteSet1.size,
      totalNotes2: noteSet2.size,
      downloadBlob: blob
    };
  }, []);

  const compareFiles = useCallback(async (
    midi1: MidiData, 
    midi2: MidiData, 
    mode: 'client' | 'server'
  ) => {
    setIsProcessing(true);
    
    try {
      if (mode === 'server') {
        // Enhanced server-side comparison
        const result = await enhancedMidiComparison(midi1, midi2);
        setEnhancedResult(result);
        setComparisonResult(null);
        
        // Create download URL
        const url = URL.createObjectURL(result.downloadBlob!);
        setDownloadUrl(url);
        
        toast.success(`Enhanced comparison complete! Similarity: ${Math.round(result.similarity * 100)}%`);
      } else {
        // Standard client-side comparison
        const result = await compareMidiFiles(midi1, midi2);
        setComparisonResult(result);
        setEnhancedResult(null);
        
        // Create download URL
        const url = URL.createObjectURL(result.downloadBlob!);
        setDownloadUrl(url);
        
        toast.success(`Comparison complete! Similarity: ${Math.round(result.similarity * 100)}%`);
      }
    } catch (error) {
      console.error('Error comparing MIDI files:', error);
      toast.error('Failed to compare MIDI files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [compareMidiFiles]);

  const resetResults = useCallback(() => {
    setComparisonResult(null);
    setEnhancedResult(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  }, [downloadUrl]);

  const handleDownload = useCallback((file1: File, file2: File) => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `common_notes_${file1.name}_${file2.name}.mid`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Common notes MIDI file downloaded!');
    }
  }, [downloadUrl]);

  return {
    comparisonResult,
    enhancedResult,
    isProcessing,
    downloadUrl,
    compareFiles,
    resetResults,
    handleDownload
  };
}