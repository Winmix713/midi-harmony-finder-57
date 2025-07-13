import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { FileUpload } from './FileUpload';
import { MidiVisualizer } from './MidiVisualizer';
import { ComparisonResults } from './ComparisonResults';
import { ProcessingModeToggle } from './ProcessingModeToggle';
import { EnhancedComparisonResults } from './EnhancedComparisonResults';
import { AudioPlayer } from './AudioPlayer';
import { EnhancedProgressIndicator } from './EnhancedProgressIndicator';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Music, AudioLines } from 'lucide-react';
import { useMidiFiles } from '@/hooks/useMidiFiles';
import { useMidiComparison } from '@/hooks/useMidiComparison';

export function MidiComparator() {
  const { 
    file1, file2, midiData1, midiData2, 
    setFile1, setFile2, setMidiData1, setMidiData2, 
    processMidiFile 
  } = useMidiFiles();
  
  const { 
    comparisonResult, enhancedResult, isProcessing, downloadUrl,
    compareFiles, resetResults, handleDownload 
  } = useMidiComparison();
  
  const [processingMode, setProcessingMode] = useState<'client' | 'server'>('client');


  const handleMidiGenerated = useCallback(async (midiFile: File, slot: 1 | 2) => {
    try {
      const midiData = await processMidiFile(midiFile);
      
      if (slot === 1) {
        setFile1(midiFile);
        setMidiData1(midiData);
        
        // Auto-compare if we have both files
        if (file2 && midiData2) {
          await compareFiles(midiData, midiData2, processingMode);
        }
      } else {
        setFile2(midiFile);
        setMidiData2(midiData);
        
        // Auto-compare if we have both files
        if (file1 && midiData1) {
          await compareFiles(midiData1, midiData, processingMode);
        }
      }
      
      toast.success(`Audio converted to MIDI and loaded in slot ${slot}!`);
    } catch (error) {
      console.error('Error processing generated MIDI:', error);
      toast.error('Failed to process generated MIDI file.');
    }
  }, [file1, file2, midiData1, midiData2, processMidiFile, compareFiles, processingMode, setFile1, setFile2, setMidiData1, setMidiData2]);

  const handleFilesSelected = useCallback(async (newFile1: File | null, newFile2: File | null) => {
    setFile1(newFile1);
    setFile2(newFile2);
    resetResults();

    try {
      // Process first file
      if (newFile1 && newFile1 !== file1) {
        const data1 = await processMidiFile(newFile1);
        setMidiData1(data1);
      } else if (!newFile1) {
        setMidiData1(null);
      }

      // Process second file
      if (newFile2 && newFile2 !== file2) {
        const data2 = await processMidiFile(newFile2);
        setMidiData2(data2);
      } else if (!newFile2) {
        setMidiData2(null);
      }

      // Compare files if both are loaded
      if (newFile1 && newFile2 && (newFile1 !== file1 || newFile2 !== file2)) {
        const data1 = midiData1 || await processMidiFile(newFile1);
        const data2 = midiData2 || await processMidiFile(newFile2);
        await compareFiles(data1, data2, processingMode);
      }
    } catch (error) {
      console.error('Error processing MIDI files:', error);
      toast.error('Failed to process MIDI files. Please check the file format.');
    }
  }, [file1, file2, midiData1, midiData2, processMidiFile, compareFiles, processingMode, resetResults, setFile1, setFile2, setMidiData1, setMidiData2]);


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <Card className="p-4 sm:p-8 bg-gradient-card border-border text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Music className="w-12 h-12 text-primary" />
              <AudioLines className="w-6 h-6 text-primary-glow absolute -top-1 -right-1" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            MIDI Comparison Studio
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Analyze and compare MIDI files to discover musical similarities, extract common patterns, 
            and generate new compositions from shared musical elements.
          </p>
        </Card>

        {/* Processing Mode Toggle */}
        <ProcessingModeToggle 
          mode={processingMode}
          onModeChange={(mode) => {
            setProcessingMode(mode);
            resetResults();
          }}
          disabled={isProcessing}
        />

        {/* File Upload */}
        <FileUpload 
          onFilesSelected={handleFilesSelected} 
          onMidiGenerated={handleMidiGenerated}
          isLoading={isProcessing}
          file1={file1}
          file2={file2}
          processMidiFile={processMidiFile}
        />

        {/* Enhanced Progress Indicator */}
        <EnhancedProgressIndicator isVisible={isProcessing} />

        {/* Results Section */}
        {comparisonResult && (
          <ComparisonResults
            similarity={comparisonResult.similarity}
            commonNotes={comparisonResult.commonNotes}
            totalNotes1={comparisonResult.totalNotes1}
            totalNotes2={comparisonResult.totalNotes2}
            downloadUrl={downloadUrl || undefined}
            onDownload={() => file1 && file2 && handleDownload(file1, file2)}
            isGenerating={isProcessing}
          />
        )}

        {/* Enhanced Results Section */}
        {enhancedResult && (
          <EnhancedComparisonResults
            similarity={enhancedResult.similarity}
            commonNotes={enhancedResult.commonNotes}
            totalNotes1={enhancedResult.totalNotes1}
            totalNotes2={enhancedResult.totalNotes2}
            harmonicSimilarity={enhancedResult.harmonicSimilarity}
            rhythmSimilarity={enhancedResult.rhythmSimilarity}
            keySimilarity={enhancedResult.keySimilarity}
            analysisDetails={enhancedResult.analysisDetails}
            downloadUrl={downloadUrl || undefined}
            onDownload={() => file1 && file2 && handleDownload(file1, file2)}
            isGenerating={isProcessing}
          />
        )}

        {/* Audio Players */}
        {(midiData1 || midiData2) && (
          <div className="space-y-6">
            <Separator className="my-8" />
            
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Audio Playback</h2>
              <p className="text-muted-foreground">
                Listen to your MIDI files with real-time audio synthesis
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {midiData1 && (
                <AudioPlayer 
                  midiData={midiData1} 
                  className="w-full"
                />
              )}
              {midiData2 && (
                <AudioPlayer 
                  midiData={midiData2} 
                  className="w-full"
                />
              )}
            </div>
          </div>
        )}

        {/* MIDI Visualizations */}
        {(midiData1 || midiData2) && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">MIDI Visualizations</h2>
              <p className="text-muted-foreground">
                Interactive piano roll displays of your uploaded MIDI files
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {midiData1 && (
                <MidiVisualizer 
                  midiData={midiData1} 
                  title="MIDI File 1"
                />
              )}
              {midiData2 && (
                <MidiVisualizer 
                  midiData={midiData2} 
                  title="MIDI File 2"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}