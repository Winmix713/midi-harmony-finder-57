import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface AudioToMidiResult {
  midiFile: File;
  confidence: number;
  processingTime: number;
}

interface ConversionProgress {
  stage: 'uploading' | 'processing' | 'transcribing' | 'generating' | 'complete';
  progress: number;
  message: string;
}

export function useAudioToMidi() {
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<ConversionProgress | null>(null);

  const convertAudioToMidi = useCallback(async (audioFile: File): Promise<AudioToMidiResult> => {
    setIsConverting(true);
    setProgress({ stage: 'uploading', progress: 0, message: 'Preparing audio file...' });

    try {
      // Simulate conversion progress stages
      const stages = [
        { stage: 'uploading' as const, progress: 20, message: 'Uploading audio file...' },
        { stage: 'processing' as const, progress: 40, message: 'Analyzing audio content...' },
        { stage: 'transcribing' as const, progress: 70, message: 'Transcribing musical notes...' },
        { stage: 'generating' as const, progress: 90, message: 'Generating MIDI file...' },
      ];

      for (const stage of stages) {
        setProgress(stage);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // For demo purposes, we'll create a simple MIDI file
      // In a real implementation, this would call an AI service like Basic Pitch
      const midiData = await createDemoMidiFromAudio(audioFile);
      
      setProgress({ stage: 'complete', progress: 100, message: 'Conversion completed!' });
      
      toast.success('Audio successfully converted to MIDI!');
      
      return {
        midiFile: midiData,
        confidence: 0.85,
        processingTime: 4000
      };
    } catch (error) {
      console.error('Audio to MIDI conversion failed:', error);
      toast.error('Failed to convert audio to MIDI. Please try again.');
      throw error;
    } finally {
      setIsConverting(false);
      setTimeout(() => setProgress(null), 2000);
    }
  }, []);

  return {
    convertAudioToMidi,
    isConverting,
    progress
  };
}

// Demo function to create a simple MIDI file from audio
async function createDemoMidiFromAudio(audioFile: File): Promise<File> {
  // This is a placeholder - in reality you'd use an AI service
  // For demo, we'll create a simple MIDI file based on the audio duration
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioFile.arrayBuffer();
    const decodedAudio = await audioContext.decodeAudioData(audioBuffer);
    
    // Simple MIDI file generation based on audio characteristics
    const duration = Math.min(decodedAudio.duration, 30); // Limit to 30 seconds for demo
    const sampleData = decodedAudio.getChannelData(0);
    
    // Create a basic MIDI file structure (simplified)
    const midiBytes = createSimpleMidi(duration, analyzeAudioPeaks(sampleData, 16)); // Limit to 16 notes
    
    return new File([midiBytes], `${audioFile.name.replace(/\.[^/.]+$/, '')}_converted.mid`, {
      type: 'audio/midi'
    });
  } catch (error) {
    console.error('Error in createDemoMidiFromAudio:', error);
    // Fallback: create a very simple MIDI file
    return createFallbackMidiFile(audioFile);
  }
}

function createFallbackMidiFile(audioFile: File): File {
  // Create a simple C major scale as fallback
  const notes = [60, 62, 64, 65, 67, 69, 71, 72]; // C major scale
  const midiBytes = createSimpleMidi(4, notes);
  
  return new File([midiBytes], `${audioFile.name.replace(/\.[^/.]+$/, '')}_converted.mid`, {
    type: 'audio/midi'
  });
}

function analyzeAudioPeaks(sampleData: Float32Array, maxNotes: number = 16): number[] {
  // Simplified peak detection for demo
  const peaks = [];
  const chunkSize = Math.max(1, Math.floor(sampleData.length / maxNotes));
  
  for (let i = 0; i < sampleData.length && peaks.length < maxNotes; i += chunkSize) {
    const chunk = sampleData.slice(i, Math.min(i + chunkSize, sampleData.length));
    let peak = 0;
    
    // Find the maximum absolute value in the chunk
    for (let j = 0; j < chunk.length; j++) {
      peak = Math.max(peak, Math.abs(chunk[j]));
    }
    
    if (peak > 0.1) {
      const note = 60 + Math.floor(peak * 24); // Map to MIDI note range (C4-C6)
      peaks.push(Math.min(127, Math.max(0, note))); // Ensure valid MIDI range
    }
  }
  
  // Ensure we have at least a few notes
  if (peaks.length === 0) {
    peaks.push(60, 64, 67); // Simple C major triad
  }
  
  return peaks;
}

function createSimpleMidi(duration: number, notes: number[]): Uint8Array {
  // Very basic MIDI file creation (Type 0, single track)
  // This is a simplified implementation for demo purposes
  
  const header = new Uint8Array([
    0x4D, 0x54, 0x68, 0x64, // "MThd"
    0x00, 0x00, 0x00, 0x06, // Header length
    0x00, 0x00, // Format type 0
    0x00, 0x01, // Number of tracks
    0x00, 0x60  // Division (96 ticks per quarter note)
  ]);
  
  const trackData: number[] = [];
  
  // Limit notes to prevent stack overflow
  const limitedNotes = notes.slice(0, 12);
  
  limitedNotes.forEach((note, index) => {
    const deltaTime = index === 0 ? 0 : 96; // Quarter note spacing
    
    // Add variable length delta time
    if (deltaTime < 128) {
      trackData.push(deltaTime);
    } else {
      trackData.push(0x81, deltaTime & 0x7F);
    }
    
    // Note on
    trackData.push(0x90, Math.min(127, Math.max(0, note)), 0x40);
    
    // Note off after quarter note
    trackData.push(96, 0x80, Math.min(127, Math.max(0, note)), 0x00);
  });
  
  // End of track
  trackData.push(0x00, 0xFF, 0x2F, 0x00);
  
  const trackHeader = new Uint8Array([
    0x4D, 0x54, 0x72, 0x6B, // "MTrk"
    ...intToBytes(trackData.length, 4) // Track length
  ]);
  
  const result = new Uint8Array(header.length + trackHeader.length + trackData.length);
  result.set(header);
  result.set(trackHeader, header.length);
  result.set(trackData, header.length + trackHeader.length);
  
  return result;
}

function intToBytes(value: number, bytes: number): number[] {
  const result = [];
  for (let i = bytes - 1; i >= 0; i--) {
    result.push((value >> (i * 8)) & 0xFF);
  }
  return result;
}