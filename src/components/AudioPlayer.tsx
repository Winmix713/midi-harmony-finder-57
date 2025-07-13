import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react';
import * as Tone from 'tone';
import { toast } from 'sonner';

interface AudioPlayerProps {
  midiData: {
    name: string;
    tracks: Array<{ notes: Array<{ midi: number; time: number; duration: number; velocity: number }> }>;
    duration: number;
  };
  className?: string;
}

export function AudioPlayer({ midiData, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState([0.7]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const partsRef = useRef<Tone.Part[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Initialize synthesizer
    synthRef.current = new Tone.PolySynth().toDestination();
    synthRef.current.volume.value = Tone.gainToDb(volume[0]);

    return () => {
      stop();
      synthRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.volume.value = isMuted ? -Infinity : Tone.gainToDb(volume[0]);
    }
  }, [volume, isMuted]);

  const updateProgress = useCallback(() => {
    if (isPlaying) {
      setCurrentTime(Tone.Transport.seconds);
      animationRef.current = requestAnimationFrame(updateProgress);
    }
  }, [isPlaying]);

  const play = useCallback(async () => {
    if (!synthRef.current) return;

    try {
      setIsLoading(true);
      
      // Start audio context if needed
      if (Tone.context.state !== 'running') {
        await Tone.start();
      }

      // Clear existing parts
      partsRef.current.forEach(part => part.dispose());
      partsRef.current = [];

      // Create parts for each track
      midiData.tracks.forEach((track, trackIndex) => {
        if (track.notes.length === 0) return;

        const part = new Tone.Part((time, noteData: any) => {
          if (synthRef.current && noteData) {
            synthRef.current.triggerAttackRelease(
              Tone.Frequency(noteData.midi, 'midi').toFrequency(),
              noteData.duration,
              time,
              noteData.velocity / 127
            );
          }
        }, track.notes.map(note => [note.time, note]));

        part.start(0);
        partsRef.current.push(part);
      });

      // Start transport
      Tone.Transport.start();
      setIsPlaying(true);
      updateProgress();
      
      toast.success(`Playing ${midiData.name}`);
    } catch (error) {
      console.error('Error playing MIDI:', error);
      toast.error('Failed to play MIDI file');
    } finally {
      setIsLoading(false);
    }
  }, [midiData, updateProgress]);

  const pause = useCallback(() => {
    Tone.Transport.pause();
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const stop = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Clear parts
    partsRef.current.forEach(part => part.dispose());
    partsRef.current = [];
  }, []);

  const handleSeek = useCallback((value: number[]) => {
    const newTime = (value[0] / 100) * midiData.duration;
    Tone.Transport.seconds = newTime;
    setCurrentTime(newTime);
  }, [midiData.duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = midiData.duration > 0 ? (currentTime / midiData.duration) * 100 : 0;

  return (
    <Card className={`p-4 bg-card border-border ${className}`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground truncate">
            {midiData.name}
          </h3>
          <div className="text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(midiData.duration)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
            disabled={isLoading}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isPlaying ? pause : play}
              disabled={isLoading}
              className="min-w-[80px]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Play
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={stop}
              disabled={isLoading}
            >
              <Square className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Slider
              value={isMuted ? [0] : volume}
              onValueChange={setVolume}
              max={1}
              step={0.01}
              className="flex-1"
              disabled={isMuted}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}