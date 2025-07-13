import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, Clock, Hash } from 'lucide-react';

interface MidiNote {
  midi: number;
  time: number;
  duration: number;
  velocity: number;
}

interface MidiVisualizerProps {
  midiData: {
    name: string;
    tracks: Array<{ notes: MidiNote[] }>;
    duration: number;
  } | null;
  title?: string;
}

export function MidiVisualizer({ midiData, title = "MIDI Visualization" }: MidiVisualizerProps) {
  const processedData = useMemo(() => {
    if (!midiData) return null;

    const allNotes = midiData.tracks.flatMap(track => track.notes);
    const sortedNotes = allNotes.sort((a, b) => a.time - b.time);
    
    // Get note range for piano roll
    const midiNumbers = allNotes.map(note => note.midi);
    const minMidi = Math.min(...midiNumbers);
    const maxMidi = Math.max(...midiNumbers);
    
    // Create piano roll data
    const pianoRollHeight = maxMidi - minMidi + 1;
    const timeScale = 800 / (midiData.duration || 1); // Scale to fit 800px width
    
    return {
      notes: sortedNotes,
      minMidi,
      maxMidi,
      pianoRollHeight,
      timeScale,
      totalNotes: allNotes.length,
      avgVelocity: allNotes.reduce((sum, note) => sum + note.velocity, 0) / allNotes.length
    };
  }, [midiData]);

  const getNoteColor = (velocity: number) => {
    const intensity = velocity / 127;
    if (intensity > 0.8) return 'bg-primary';
    if (intensity > 0.6) return 'bg-timeline';
    if (intensity > 0.4) return 'bg-waveform';
    return 'bg-primary/60';
  };

  const getMidiNoteName = (midi: number) => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midi / 12) - 1;
    const note = noteNames[midi % 12];
    return `${note}${octave}`;
  };

  if (!midiData || !processedData) {
    return (
      <Card className="p-8 bg-gradient-card border-border">
        <div className="text-center text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No MIDI data to visualize</p>
          <p className="text-sm">Upload a MIDI file to see the piano roll</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card border-border">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-muted">
              <Clock className="w-3 h-3 mr-1" />
              {midiData.duration.toFixed(1)}s
            </Badge>
            <Badge variant="secondary" className="bg-muted">
              <Hash className="w-3 h-3 mr-1" />
              {processedData.totalNotes} notes
            </Badge>
          </div>
        </div>

        {/* Piano Roll */}
        <div className="relative bg-card rounded-lg p-4 overflow-hidden">
          <div className="relative" style={{ height: '300px' }}>
            {/* Piano keys on the left */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-piano border-r border-border">
              {Array.from({ length: Math.min(20, processedData.pianoRollHeight) }).map((_, i) => {
                const midiNote = processedData.maxMidi - i;
                const isBlackKey = [1, 3, 6, 8, 10].includes(midiNote % 12);
                
                return (
                  <div
                    key={i}
                    className={`h-4 border-b border-border/50 flex items-center justify-end pr-2 text-xs ${
                      isBlackKey ? 'bg-piano-black text-piano-white' : 'bg-piano-white text-piano-black'
                    }`}
                    style={{ height: '15px' }}
                  >
                    {getMidiNoteName(midiNote)}
                  </div>
                );
              })}
            </div>

            {/* Timeline */}
            <div className="absolute left-16 right-0 top-0 bottom-0 bg-muted/20">
              {/* Grid lines */}
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 w-px bg-border/30"
                  style={{ left: `${(i * 12.5)}%` }}
                />
              ))}

              {/* Notes */}
              {processedData.notes.slice(0, 200).map((note, i) => { // Limit for performance
                const x = (note.time * processedData.timeScale) % 800;
                const y = ((processedData.maxMidi - note.midi) * 15);
                const width = Math.max(2, note.duration * processedData.timeScale);
                
                if (y < 0 || y > 300) return null; // Skip notes outside visible range
                
                return (
                  <div
                    key={i}
                    className={`absolute rounded-sm ${getNoteColor(note.velocity)} opacity-80 hover:opacity-100 transition-opacity`}
                    style={{
                      left: `${x}px`,
                      top: `${y}px`,
                      width: `${width}px`,
                      height: '14px',
                    }}
                    title={`${getMidiNoteName(note.midi)} - Velocity: ${note.velocity}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">File Name</p>
            <p className="font-semibold text-foreground truncate">{midiData.name}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Note Range</p>
            <p className="font-semibold text-foreground">
              {getMidiNoteName(processedData.minMidi)} - {getMidiNoteName(processedData.maxMidi)}
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Avg Velocity</p>
            <p className="font-semibold text-foreground">{processedData.avgVelocity.toFixed(0)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Tracks</p>
            <p className="font-semibold text-foreground">{midiData.tracks.length}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}