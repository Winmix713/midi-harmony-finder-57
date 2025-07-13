import { useState, useCallback } from 'react';
import { Upload, File, X, Music2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { AudioFileUpload } from './AudioFileUpload';

interface FileUploadProps {
  onFilesSelected: (file1: File | null, file2: File | null) => void;
  onMidiGenerated?: (midiFile: File, slot: 1 | 2) => void;
  isLoading?: boolean;
  file1?: File | null;
  file2?: File | null;
  processMidiFile?: (file: File) => Promise<any>;
}

export function FileUpload({ onFilesSelected, onMidiGenerated, isLoading = false, file1, file2, processMidiFile }: FileUploadProps) {
  const [dragOver, setDragOver] = useState<1 | 2 | null>(null);

  const handleLoadToSlot = useCallback(async (midiFile: File, targetSlot: 1 | 2) => {
    if (targetSlot === 1) {
      onFilesSelected(midiFile, file2 || null);
    } else {
      onFilesSelected(file1 || null, midiFile);
    }
  }, [file1, file2, onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent, slot: 1 | 2) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    const midiFile = files.find(file => file.name.toLowerCase().endsWith('.mid') || file.name.toLowerCase().endsWith('.midi'));
    
    if (midiFile) {
      handleLoadToSlot(midiFile, slot);
    }
  }, [handleLoadToSlot]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLoadToSlot(file, slot);
    }
  }, [handleLoadToSlot]);

  const clearFile = useCallback((slot: 1 | 2) => {
    if (slot === 1) {
      onFilesSelected(null, file2 || null);
    } else {
      onFilesSelected(file1 || null, null);
    }
  }, [file1, file2, onFilesSelected]);

  const FileSlot = ({ slot, file }: { slot: 1 | 2; file: File | null }) => (
    <Card 
      className={cn(
        "relative h-24 sm:h-32 bg-gradient-card border-border transition-all duration-300",
        "hover:shadow-glow hover:border-primary/50",
        dragOver === slot && "border-primary shadow-glow scale-[1.02]",
        isLoading && "opacity-50 pointer-events-none"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(slot);
      }}
      onDragLeave={() => setDragOver(null)}
      onDrop={(e) => handleDrop(e, slot)}
    >
      <input
        type="file"
        accept=".mid,.midi"
        onChange={(e) => handleFileInput(e, slot)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />
      
      <div className="flex flex-col items-center justify-center h-full p-2 sm:p-4 text-center">
        {file ? (
          <>
            <File className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-1 sm:mb-2" />
            <p className="text-xs sm:text-sm font-medium text-foreground truncate max-w-full">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-1 right-1 sm:top-2 sm:right-2 h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-destructive/20"
              onClick={(e) => {
                e.stopPropagation();
                clearFile(slot);
              }}
            >
              <X className="h-2 w-2 sm:h-3 sm:w-3" />
            </Button>
          </>
        ) : (
          <>
            <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mb-1 sm:mb-2" />
            <p className="text-xs sm:text-sm font-medium text-foreground">
              MIDI File {slot}
            </p>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Drag & drop or click to select
            </p>
            <p className="text-xs text-muted-foreground sm:hidden">
              Tap to select
            </p>
          </>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Upload Files for Comparison
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Upload MIDI files directly or convert audio files to MIDI first
        </p>
      </div>

      <Tabs defaultValue="midi" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="midi" className="flex items-center gap-2">
            <File className="w-4 h-4" />
            MIDI Files
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Music2 className="w-4 h-4" />
            Audio to MIDI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="midi" className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Select two MIDI files to compare and analyze their musical similarity
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FileSlot slot={1} file={file1} />
            <FileSlot slot={2} file={file2} />
          </div>

          {file1 && file2 && (
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-sm text-similarity-high">
                <div className="w-2 h-2 bg-similarity-high rounded-full animate-pulse" />
                Ready to compare
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="audio" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-medium text-foreground">Audio File 1</h4>
                <p className="text-xs text-muted-foreground">Convert to MIDI for slot 1</p>
              </div>
              <AudioFileUpload 
                onMidiGenerated={(midiFile) => onMidiGenerated?.(midiFile, 1)}
                onLoadToSlot={handleLoadToSlot}
                slot={1}
              />
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-medium text-foreground">Audio File 2</h4>
                <p className="text-xs text-muted-foreground">Convert to MIDI for slot 2</p>
              </div>
              <AudioFileUpload 
                onMidiGenerated={(midiFile) => onMidiGenerated?.(midiFile, 2)}
                onLoadToSlot={handleLoadToSlot}
                slot={2}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}