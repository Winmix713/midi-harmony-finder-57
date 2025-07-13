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
  
  const audioBuffer = await audioFile.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const decodedAudio = await audioContext.decodeAudioData(audioBuffer);
  
  // Simple MIDI file generation based on audio characteristics
  const duration = decodedAudio.duration;
  const sampleData = decodedAudio.getChannelData(0);
  
  // Create a basic MIDI file structure (simplified)
  const midiBytes = createSimpleMidi(duration, analyzeAudioPeaks(sampleData));
  
  return new File([midiBytes], `${audioFile.name.replace(/\.[^/.]+$/, '')}_converted.mid`, {
    type: 'audio/midi'
  });
}

function analyzeAudioPeaks(sampleData: Float32Array): number[] {
  // Simplified peak detection for demo
  const peaks = [];
  const chunkSize = Math.floor(sampleData.length / 20);
  
  for (let i = 0; i < sampleData.length; i += chunkSize) {
    const chunk = sampleData.slice(i, i + chunkSize);
    const peak = Math.max(...chunk.map(Math.abs));
    if (peak > 0.1) {
      peaks.push(60 + Math.floor(peak * 24)); // Map to MIDI note range
    }
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
  
  const trackData = [];
  let time = 0;
  
  notes.forEach((note, index) => {
    const deltaTime = index === 0 ? 0 : 96; // Quarter note spacing
    
    // Note on
    trackData.push(
      deltaTime, 0x90, note, 0x40 // Note on, velocity 64
    );
    
    // Note off after quarter note
    trackData.push(
      96, 0x80, note, 0x00 // Note off
    );
  });
  
  // End of track
  trackData.push(0x00, 0xFF, 0x2F, 0x00);
  
  const track = new Uint8Array([
    0x4D, 0x54, 0x72, 0x6B, // "MTrk"
    ...intToBytes(trackData.length, 4), // Track length
    ...trackData
  ]);
  
  const result = new Uint8Array(header.length + track.length);
  result.set(header);
  result.set(track, header.length);
  
  return result;
}

function intToBytes(value: number, bytes: number): number[] {
  const result = [];
  for (let i = bytes - 1; i >= 0; i--) {
    result.push((value >> (i * 8)) & 0xFF);
  }
  return result;
}