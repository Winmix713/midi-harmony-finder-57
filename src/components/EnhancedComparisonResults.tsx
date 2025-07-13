import { Download, TrendingUp, Music2, Zap, Waves, Clock, Key } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface EnhancedComparisonResultsProps {
  similarity: number;
  commonNotes: number;
  totalNotes1: number;
  totalNotes2: number;
  harmonicSimilarity: number;
  rhythmSimilarity: number;
  keySimilarity: number;
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
  downloadUrl?: string;
  onDownload?: () => void;
  isGenerating?: boolean;
}

export function EnhancedComparisonResults({
  similarity,
  commonNotes,
  totalNotes1,
  totalNotes2,
  harmonicSimilarity,
  rhythmSimilarity,
  keySimilarity,
  analysisDetails,
  downloadUrl,
  onDownload,
  isGenerating = false
}: EnhancedComparisonResultsProps) {
  const getSimilarityColor = (score: number) => {
    if (score >= 0.7) return 'similarity-high';
    if (score >= 0.4) return 'similarity-medium';
    return 'similarity-low';
  };

  const getSimilarityLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Moderate Match';
    if (score >= 0.2) return 'Low Match';
    return 'Minimal Match';
  };

  const colorClass = getSimilarityColor(similarity);
  const similarityPercentage = Math.round(similarity * 100);

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-card">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <Badge variant="default" className="mb-2">Enhanced Analysis</Badge>
          <h3 className="text-2xl font-bold text-foreground mb-2">Advanced Comparison Results</h3>
          <p className="text-muted-foreground">Deep musical analysis using harmonic, rhythmic, and key detection</p>
        </div>

        {/* Overall Similarity Score */}
        <div className="text-center space-y-4">
          <div className={cn(
            "inline-flex items-center justify-center w-28 h-28 rounded-full text-3xl font-bold",
            `bg-${colorClass}/20 text-${colorClass} border-2 border-${colorClass}/30`
          )}>
            {similarityPercentage}%
          </div>
          
          <div>
            <h4 className="text-xl font-semibold text-foreground">
              {getSimilarityLabel(similarity)}
            </h4>
            <p className="text-sm text-muted-foreground">Enhanced Musical Similarity Score</p>
          </div>

          <Progress 
            value={similarityPercentage} 
            className="w-full max-w-md mx-auto"
          />
        </div>

        {/* Multi-dimensional Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <Music2 className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-lg font-bold text-foreground">{Math.round(similarity * 100)}%</p>
            <p className="text-sm text-muted-foreground">Overall</p>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <Waves className="w-6 h-6 mx-auto mb-2 text-waveform" />
            <p className="text-lg font-bold text-foreground">{Math.round(harmonicSimilarity * 100)}%</p>
            <p className="text-sm text-muted-foreground">Harmonic</p>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-timeline" />
            <p className="text-lg font-bold text-foreground">{Math.round(rhythmSimilarity * 100)}%</p>
            <p className="text-sm text-muted-foreground">Rhythm</p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <Key className="w-6 h-6 mx-auto mb-2 text-accent" />
            <p className="text-lg font-bold text-foreground">{Math.round(keySimilarity * 100)}%</p>
            <p className="text-sm text-muted-foreground">Key</p>
          </div>
        </div>

        {/* Detailed Analysis Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="harmony">Harmony</TabsTrigger>
            <TabsTrigger value="rhythm">Rhythm</TabsTrigger>
            <TabsTrigger value="key">Key Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/20 rounded-lg p-4">
                <h5 className="font-semibold text-foreground mb-2">Note Statistics</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Common Notes:</span>
                    <Badge variant="outline">{commonNotes}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File 1 Notes:</span>
                    <Badge variant="outline">{totalNotes1}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File 2 Notes:</span>
                    <Badge variant="outline">{totalNotes2}</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-4">
                <h5 className="font-semibold text-foreground mb-2">Coverage Analysis</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File 1 Coverage:</span>
                    <Badge variant="outline">
                      {totalNotes1 > 0 ? Math.round((commonNotes / totalNotes1) * 100) : 0}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File 2 Coverage:</span>
                    <Badge variant="outline">
                      {totalNotes2 > 0 ? Math.round((commonNotes / totalNotes2) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-4">
                <h5 className="font-semibold text-foreground mb-2">Tempo Analysis</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File 1 BPM:</span>
                    <Badge variant="outline">{analysisDetails.tempoAnalysis.file1Tempo}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File 2 BPM:</span>
                    <Badge variant="outline">{analysisDetails.tempoAnalysis.file2Tempo}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tempo Match:</span>
                    <Badge variant={analysisDetails.tempoAnalysis.tempoSimilarity > 0.8 ? 'default' : 'secondary'}>
                      {Math.round(analysisDetails.tempoAnalysis.tempoSimilarity * 100)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="harmony" className="space-y-4 mt-4">
            <div className="bg-muted/20 rounded-lg p-4">
              <h5 className="font-semibold text-foreground mb-3">Harmonic Analysis</h5>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Common Chord Progressions:</p>
                  <div className="flex flex-wrap gap-2">
                    {analysisDetails.commonChords.length > 0 ? (
                      analysisDetails.commonChords.map((chord, index) => (
                        <Badge key={index} variant="outline">{chord}</Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">No common chords detected</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Harmonic Similarity Score:</p>
                  <Progress value={harmonicSimilarity * 100} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(harmonicSimilarity * 100)}% harmonic content match
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rhythm" className="space-y-4 mt-4">
            <div className="bg-muted/20 rounded-lg p-4">
              <h5 className="font-semibold text-foreground mb-3">Rhythmic Analysis</h5>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Rhythm Pattern Similarity:</p>
                  <Progress value={rhythmSimilarity * 100} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(rhythmSimilarity * 100)}% rhythmic pattern match
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">File 1 Tempo</p>
                    <p className="text-lg font-bold text-primary">{analysisDetails.tempoAnalysis.file1Tempo} BPM</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">File 2 Tempo</p>
                    <p className="text-lg font-bold text-primary">{analysisDetails.tempoAnalysis.file2Tempo} BPM</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="key" className="space-y-4 mt-4">
            <div className="bg-muted/20 rounded-lg p-4">
              <h5 className="font-semibold text-foreground mb-3">Key Signature Analysis</h5>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">File 1 Key</p>
                    <Badge variant="outline" className="text-lg">{analysisDetails.keySignatures.file1Key}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">File 2 Key</p>
                    <Badge variant="outline" className="text-lg">{analysisDetails.keySignatures.file2Key}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Key Compatibility:</p>
                  <Progress value={keySimilarity * 100} className="w-full" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Distance: {analysisDetails.keySignatures.keyDistance} semitones
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Download Section */}
        <div className="text-center pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Generate an enhanced MIDI file containing the musically relevant common elements
          </p>
          
          <Button
            onClick={onDownload}
            disabled={isGenerating || !downloadUrl}
            variant="gradient"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating Enhanced MIDI...' : 'Download Enhanced Common Notes MIDI'}
          </Button>

          {downloadUrl && (
            <p className="text-xs text-muted-foreground mt-2">
              Enhanced MIDI file ready for download
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}