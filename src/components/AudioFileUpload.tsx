import { useState, useCallback } from 'react';
import { Upload, Music, X, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useAudioToMidi } from '@/hooks/useAudioToMidi';

interface AudioFileUploadProps {
  onMidiGenerated: (midiFile: File) => void;
  className?: string;
}

export function AudioFileUpload({ onMidiGenerated, className }: AudioFileUploadProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { convertAudioToMidi, isConverting, progress } = useAudioToMidi();

  const isAudioFile = (file: File) => {
    const audioTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac'];
    const audioExtensions = ['.mp3', '.wav', '.m4a', '.aac'];
    
    return audioTypes.includes(file.type) || 
           audioExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => isAudioFile(file));
    
    if (audioFile) {
      setAudioFile(audioFile);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isAudioFile(file)) {
      setAudioFile(file);
    }
  }, []);

  const handleConvert = useCallback(async () => {
    if (!audioFile) return;

    try {
      const result = await convertAudioToMidi(audioFile);
      onMidiGenerated(result.midiFile);
      setAudioFile(null); // Clear after successful conversion
    } catch (error) {
      console.error('Conversion failed:', error);
    }
  }, [audioFile, convertAudioToMidi, onMidiGenerated]);

  const clearFile = useCallback(() => {
    setAudioFile(null);
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Convert Audio to MIDI
        </h3>
        <p className="text-sm text-muted-foreground">
          Upload MP3, WAV, or M4A files to automatically generate MIDI
        </p>
      </div>

      {/* File Drop Zone */}
      <Card 
        className={cn(
          "relative h-32 bg-gradient-card border-border transition-all duration-300 cursor-pointer",
          "hover:shadow-glow hover:border-primary/50",
          dragOver && "border-primary shadow-glow scale-[1.02]",
          isConverting && "opacity-50 pointer-events-none"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".mp3,.wav,.m4a,.aac,audio/*"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isConverting}
        />
        
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          {audioFile ? (
            <>
              <Music className="w-8 h-8 text-primary mb-2" />
              <p className="text-sm font-medium text-foreground truncate max-w-full">
                {audioFile.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-destructive/20"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">
                Upload Audio File
              </p>
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to select
              </p>
            </>
          )}
        </div>
      </Card>

      {/* Conversion Progress */}
      {progress && (
        <Card className="p-4 bg-gradient-card border-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {progress.message}
              </span>
              <span className="text-xs text-muted-foreground">
                {progress.progress}%
              </span>
            </div>
            <Progress value={progress.progress} className="h-2" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Converting audio to MIDI...
            </div>
          </div>
        </Card>
      )}

      {/* Convert Button */}
      {audioFile && !isConverting && (
        <div className="flex justify-center">
          <Button 
            onClick={handleConvert}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Music className="w-4 h-4 mr-2" />
            Convert to MIDI
          </Button>
        </div>
      )}
    </div>
  );
}