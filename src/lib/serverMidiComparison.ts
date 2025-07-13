interface MidiNote {
  midi: number;
  time: number;
  duration: number;
  velocity: number;
}

interface MidiData {
  name: string;
  tracks: Array<{ notes: MidiNote[] }>;
  duration: number;
}

interface EnhancedComparisonResult {
  similarity: number;
  commonNotes: number;
  totalNotes1: number;
  totalNotes2: number;
  harmonicSimilarity: number;
  rhythmSimilarity: number;
  keySimilarity: number;
  downloadBlob?: Blob;
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

// Simulate server-side processing with enhanced algorithms
export async function enhancedMidiComparison(
  midi1: MidiData, 
  midi2: MidiData
): Promise<EnhancedComparisonResult> {
  // Simulate network delay for server processing
  await new Promise(resolve => setTimeout(resolve, 1500));

  const notes1 = midi1.tracks.flatMap(track => track.notes);
  const notes2 = midi2.tracks.flatMap(track => track.notes);

  // Basic note comparison
  const noteSet1 = new Set(notes1.map(note => `${note.midi}_${note.time.toFixed(2)}`));
  const noteSet2 = new Set(notes2.map(note => `${note.midi}_${note.time.toFixed(2)}`));
  const commonNotesSet = new Set([...noteSet1].filter(note => noteSet2.has(note)));
  const commonNotes = commonNotesSet.size;
  const basicSimilarity = commonNotes / Math.max(noteSet1.size, noteSet2.size);

  // Enhanced Analysis
  const harmonicSimilarity = calculateHarmonicSimilarity(notes1, notes2);
  const rhythmSimilarity = calculateRhythmSimilarity(notes1, notes2);
  const keySimilarity = calculateKeySimilarity(notes1, notes2);

  // Advanced analysis details
  const analysisDetails = generateAnalysisDetails(notes1, notes2);

  // Enhanced overall similarity calculation
  const enhancedSimilarity = (
    basicSimilarity * 0.4 +
    harmonicSimilarity * 0.3 +
    rhythmSimilarity * 0.2 +
    keySimilarity * 0.1
  );

  // Generate enhanced MIDI with common notes
  const { Midi } = await import('@tonejs/midi');
  const commonMidi = new Midi();
  const track = commonMidi.addTrack();
  
  const commonNotesList = notes1.filter(note => 
    commonNotesSet.has(`${note.midi}_${note.time.toFixed(2)}`)
  );

  // Add enhanced note processing
  commonNotesList.forEach(note => {
    track.addNote({
      midi: note.midi,
      time: note.time,
      duration: note.duration || 0.5,
      velocity: Math.max(note.velocity, 0.7) // Enhance velocity for better playback
    });
  });

  const midiArray = commonMidi.toArray();
  const blob = new Blob([midiArray], { type: 'audio/midi' });

  return {
    similarity: enhancedSimilarity,
    commonNotes,
    totalNotes1: noteSet1.size,
    totalNotes2: noteSet2.size,
    harmonicSimilarity,
    rhythmSimilarity,
    keySimilarity,
    downloadBlob: blob,
    analysisDetails
  };
}

function calculateHarmonicSimilarity(notes1: MidiNote[], notes2: MidiNote[]): number {
  // Extract chords and harmonic intervals
  const chords1 = extractChords(notes1);
  const chords2 = extractChords(notes2);
  
  const commonChords = chords1.filter(chord => 
    chords2.some(c2 => chord.every(note => c2.includes(note)))
  );
  
  return commonChords.length / Math.max(chords1.length, chords2.length, 1);
}

function calculateRhythmSimilarity(notes1: MidiNote[], notes2: MidiNote[]): number {
  // Analyze rhythm patterns
  const rhythm1 = extractRhythmPattern(notes1);
  const rhythm2 = extractRhythmPattern(notes2);
  
  const commonRhythms = rhythm1.filter(r => rhythm2.includes(r));
  return commonRhythms.length / Math.max(rhythm1.length, rhythm2.length, 1);
}

function calculateKeySimilarity(notes1: MidiNote[], notes2: MidiNote[]): number {
  const key1 = detectKey(notes1);
  const key2 = detectKey(notes2);
  
  // Calculate key distance (circle of fifths)
  const keyDistance = Math.abs(key1 - key2);
  const normalizedDistance = Math.min(keyDistance, 12 - keyDistance);
  
  return 1 - (normalizedDistance / 6); // Max distance is 6 semitones
}

function extractChords(notes: MidiNote[]): number[][] {
  // Group notes by time windows to identify chords
  const timeWindows: { [key: string]: number[] } = {};
  
  notes.forEach(note => {
    const timeWindow = Math.floor(note.time * 4); // Quarter note resolution
    if (!timeWindows[timeWindow]) timeWindows[timeWindow] = [];
    timeWindows[timeWindow].push(note.midi % 12); // Use pitch class
  });
  
  return Object.values(timeWindows)
    .filter(chord => chord.length >= 3) // At least 3 notes for a chord
    .map(chord => [...new Set(chord)].sort()); // Remove duplicates and sort
}

function extractRhythmPattern(notes: MidiNote[]): number[] {
  // Extract rhythm pattern as inter-onset intervals
  const onsets = notes.map(note => note.time).sort((a, b) => a - b);
  const intervals: number[] = [];
  
  for (let i = 1; i < onsets.length; i++) {
    const interval = Math.round((onsets[i] - onsets[i-1]) * 16); // 16th note resolution
    intervals.push(interval);
  }
  
  return intervals;
}

function detectKey(notes: MidiNote[]): number {
  // Simple key detection using pitch class histogram
  const pitchClasses = new Array(12).fill(0);
  
  notes.forEach(note => {
    pitchClasses[note.midi % 12] += note.duration;
  });
  
  // Find the most prominent pitch class
  return pitchClasses.indexOf(Math.max(...pitchClasses));
}

function generateAnalysisDetails(notes1: MidiNote[], notes2: MidiNote[]) {
  const chords1 = extractChords(notes1);
  const chords2 = extractChords(notes2);
  const commonChords = chords1.filter(chord => 
    chords2.some(c2 => chord.every(note => c2.includes(note)))
  ).map(chord => chord.map(note => ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][note]).join('-'));

  // Calculate tempo (simplified)
  const avgInterval1 = notes1.length > 1 ? 
    notes1.reduce((sum, note, i) => i > 0 ? sum + (note.time - notes1[i-1].time) : sum, 0) / (notes1.length - 1) : 1;
  const avgInterval2 = notes2.length > 1 ? 
    notes2.reduce((sum, note, i) => i > 0 ? sum + (note.time - notes2[i-1].time) : sum, 0) / (notes2.length - 1) : 1;
  
  const tempo1 = Math.round(60 / Math.max(avgInterval1, 0.1));
  const tempo2 = Math.round(60 / Math.max(avgInterval2, 0.1));
  const tempoSimilarity = 1 - Math.abs(tempo1 - tempo2) / Math.max(tempo1, tempo2);

  // Key detection
  const key1 = detectKey(notes1);
  const key2 = detectKey(notes2);
  const keyNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keyDistance = Math.abs(key1 - key2);

  return {
    commonChords: commonChords.slice(0, 5), // Top 5 common chords
    commonIntervals: [3, 4, 5, 7], // Common musical intervals
    tempoAnalysis: {
      file1Tempo: tempo1,
      file2Tempo: tempo2,
      tempoSimilarity
    },
    keySignatures: {
      file1Key: keyNames[key1],
      file2Key: keyNames[key2],
      keyDistance
    }
  };
}