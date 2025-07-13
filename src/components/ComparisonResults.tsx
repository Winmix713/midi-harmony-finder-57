import { Download, TrendingUp, Music2, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ComparisonResultsProps {
  similarity: number;
  commonNotes: number;
  totalNotes1: number;
  totalNotes2: number;
  downloadUrl?: string;
  onDownload?: () => void;
  isGenerating?: boolean;
}

export function ComparisonResults({
  similarity,
  commonNotes,
  totalNotes1,
  totalNotes2,
  downloadUrl,
  onDownload,
  isGenerating = false
}: ComparisonResultsProps) {
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
          <h3 className="text-2xl font-bold text-foreground mb-2">Comparison Results</h3>
          <p className="text-muted-foreground">Analysis of musical similarity between your MIDI files</p>
        </div>

        {/* Similarity Score */}
        <div className="text-center space-y-4">
          <div className={cn(
            "inline-flex items-center justify-center w-24 h-24 rounded-full text-3xl font-bold",
            `bg-${colorClass}/20 text-${colorClass} border-2 border-${colorClass}/30`
          )}>
            {similarityPercentage}%
          </div>
          
          <div>
            <h4 className="text-xl font-semibold text-foreground">
              {getSimilarityLabel(similarity)}
            </h4>
            <p className="text-sm text-muted-foreground">Musical Similarity Score</p>
          </div>

          <Progress 
            value={similarityPercentage} 
            className="w-full max-w-md mx-auto"
          />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <Music2 className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-lg font-bold text-foreground">{commonNotes}</p>
            <p className="text-sm text-muted-foreground">Common Notes</p>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-waveform" />
            <p className="text-lg font-bold text-foreground">{totalNotes1}</p>
            <p className="text-sm text-muted-foreground">Notes in File 1</p>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-timeline" />
            <p className="text-lg font-bold text-foreground">{totalNotes2}</p>
            <p className="text-sm text-muted-foreground">Notes in File 2</p>
          </div>
        </div>

        {/* Analysis Details */}
        <div className="bg-muted/20 rounded-lg p-4">
          <h5 className="font-semibold text-foreground mb-3">Analysis Details</h5>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coverage in File 1:</span>
              <Badge variant="outline">
                {totalNotes1 > 0 ? Math.round((commonNotes / totalNotes1) * 100) : 0}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Coverage in File 2:</span>
              <Badge variant="outline">
                {totalNotes2 > 0 ? Math.round((commonNotes / totalNotes2) * 100) : 0}%
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unique to File 1:</span>
              <Badge variant="secondary">
                {totalNotes1 - commonNotes}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unique to File 2:</span>
              <Badge variant="secondary">
                {totalNotes2 - commonNotes}
              </Badge>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="text-center pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Generate a new MIDI file containing only the common notes
          </p>
          
          <Button
            onClick={onDownload}
            disabled={isGenerating || !downloadUrl}
            variant="gradient"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Download Common Notes MIDI'}
          </Button>

          {downloadUrl && (
            <p className="text-xs text-muted-foreground mt-2">
              MIDI file ready for download
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}