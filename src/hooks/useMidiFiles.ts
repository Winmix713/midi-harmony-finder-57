import { useState, useCallback } from 'react';
import { Midi } from '@tonejs/midi';

interface MidiData {
  name: string;
  tracks: Array<{ notes: Array<{ midi: number; time: number; duration: number; velocity: number }> }>;
  duration: number;
}

export function useMidiFiles() {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [midiData1, setMidiData1] = useState<MidiData | null>(null);
  const [midiData2, setMidiData2] = useState<MidiData | null>(null);

  const processMidiFile = useCallback(async (file: File): Promise<MidiData> => {
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
  }, []);

  return {
    file1,
    file2,
    midiData1,
    midiData2,
    setFile1,
    setFile2,
    setMidiData1,
    setMidiData2,
    processMidiFile
  };
}