import React, { useCallback, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Music, AudioLines, RotateCcw, Zap } from 'lucide-react';
import { useMidiApp } from '@/hooks/useMidiApp';
import { useMidiComparison } from '@/hooks/useMidiComparison';

// Memoized Header Component
const AppHeader = React.memo(() => (
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
));

AppHeader.displayName = 'AppHeader';

// Memoized Section Headers
const SectionHeader = React.memo(({ title, description }: { title: string; description: string }) => (
  <div className="text-center">
    <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
    <p className="text-muted-foreground">{description}</p>
  </div>
));

SectionHeader.displayName = 'SectionHeader';

// Memoized Audio Players Section
const AudioPlayersSection = React.memo(({ midiData1, midiData2 }: { 
  midiData1: any; 
  midiData2: any; 
}) => {
  if (!midiData1 && !midiData2) return null;

  return (
    <div className="space-y-6">
      <Separator className="my-8" />
      <SectionHeader 
        title="Audio Playback"
        description="Listen to your MIDI files with real-time audio synthesis"
      />
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
  );
});

AudioPlayersSection.displayName = 'AudioPlayersSection';

// Memoized Visualizations Section
const VisualizationsSection = React.memo(({ midiData1, midiData2 }: { 
  midiData1: any; 
  midiData2: any; 
}) => {
  if (!midiData1 && !midiData2) return null;

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="MIDI Visualizations"
        description="Interactive piano roll displays of your uploaded MIDI files"
      />
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
  );
});

VisualizationsSection.displayName = 'VisualizationsSection';

export function MidiComparatorOptimized() {
  const midiApp = useMidiApp();
  const { 
    comparisonResult, 
    enhancedResult, 
    isProcessing: isComparing, 
    downloadUrl,
    compareFiles, 
    resetResults, 
    handleDownload 
  } = useMidiComparison();

  // Optimized file selection handler
  const handleFilesSelected = useCallback(async (newFile1: File | null, newFile2: File | null) => {
    midiApp.updateFiles(newFile1, newFile2);
    resetResults();

    try {
      let data1 = midiApp.midiData.data1;
      let data2 = midiApp.midiData.data2;

      // Process new files
      if (newFile1 && newFile1 !== midiApp.files.file1) {
        data1 = await midiApp.loadMidiFile(newFile1, 1);
      } else if (!newFile1) {
        midiApp.clearSlot(1);
        data1 = null;
      }

      if (newFile2 && newFile2 !== midiApp.files.file2) {
        data2 = await midiApp.loadMidiFile(newFile2, 2);
      } else if (!newFile2) {
        midiApp.clearSlot(2);
        data2 = null;
      }

      // Auto-compare if both files are loaded
      if (data1 && data2) {
        await compareFiles(data1, data2, midiApp.ui.processingMode);
      }
    } catch (error) {
      console.error('Error processing MIDI files:', error);
      toast.error('Failed to process MIDI files. Please check the file format.');
    }
  }, [midiApp, compareFiles, resetResults]);

  // Optimized MIDI generation handler
  const handleMidiGenerated = useCallback(async (midiFile: File, slot: 1 | 2) => {
    try {
      const midiData = await midiApp.loadMidiFile(midiFile, slot);
      
      // Auto-compare if we have both files
      const otherData = slot === 1 ? midiApp.midiData.data2 : midiApp.midiData.data1;
      if (otherData) {
        const data1 = slot === 1 ? midiData : midiApp.midiData.data1!;
        const data2 = slot === 1 ? midiApp.midiData.data2! : midiData;
        await compareFiles(data1, data2, midiApp.ui.processingMode);
      }
      
      toast.success(`Audio converted to MIDI and loaded in slot ${slot}!`);
    } catch (error) {
      console.error('Error processing generated MIDI:', error);
      toast.error('Failed to process generated MIDI file.');
    }
  }, [midiApp, compareFiles]);

  // Memoized processing mode handler
  const handleModeChange = useCallback((mode: 'client' | 'server') => {
    midiApp.setProcessingMode(mode);
    resetResults();
  }, [midiApp, resetResults]);

  // Memoized download handler
  const handleDownloadClick = useCallback(() => {
    if (midiApp.files.file1 && midiApp.files.file2) {
      handleDownload(midiApp.files.file1, midiApp.files.file2);
    }
  }, [midiApp.files.file1, midiApp.files.file2, handleDownload]);

  // Performance monitoring
  const performanceStats = useMemo(() => ({
    filesLoaded: midiApp.fileCount,
    midiDataReady: midiApp.midiDataCount,
    canCompare: midiApp.canCompare,
    processingState: midiApp.ui.isProcessing || isComparing ? 'busy' : 'idle'
  }), [midiApp, isComparing]);

  const isProcessing = midiApp.ui.isProcessing || isComparing;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Header */}
        <AppHeader />

        {/* Performance Status (Development Mode) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="p-2 bg-muted/20 border-dashed">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Files: {performanceStats.filesLoaded}/2</span>
              <span>MIDI: {performanceStats.midiDataReady}/2</span>
              <span>Status: {performanceStats.processingState}</span>
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Optimized
              </div>
            </div>
          </Card>
        )}

        {/* Processing Mode Toggle */}
        <div className="flex items-center justify-between">
          <ProcessingModeToggle 
            mode={midiApp.ui.processingMode}
            onModeChange={handleModeChange}
            disabled={isProcessing}
          />
          
          {/* Quick Reset Button */}
          {(midiApp.fileCount > 0 || comparisonResult) && (
            <Button
              variant="outline"
              size="sm"
              onClick={midiApp.resetAll}
              disabled={isProcessing}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All
            </Button>
          )}
        </div>

        {/* File Upload */}
        <FileUpload 
          onFilesSelected={handleFilesSelected} 
          onMidiGenerated={handleMidiGenerated}
          isLoading={isProcessing}
          file1={midiApp.files.file1}
          file2={midiApp.files.file2}
          processMidiFile={midiApp.processMidiFile}
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
            onDownload={handleDownloadClick}
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
            onDownload={handleDownloadClick}
            isGenerating={isProcessing}
          />
        )}

        {/* Audio Players */}
        <AudioPlayersSection 
          midiData1={midiApp.midiData.data1}
          midiData2={midiApp.midiData.data2}
        />

        {/* MIDI Visualizations */}
        <VisualizationsSection 
          midiData1={midiApp.midiData.data1}
          midiData2={midiApp.midiData.data2}
        />
      </div>
    </div>
  );
}