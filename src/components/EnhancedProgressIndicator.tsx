import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Zap, Music } from 'lucide-react';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
}

interface EnhancedProgressIndicatorProps {
  isVisible: boolean;
  steps?: ProcessingStep[];
  className?: string;
}

const defaultSteps: ProcessingStep[] = [
  { id: 'parse', label: 'Parsing MIDI files', status: 'pending' },
  { id: 'analyze', label: 'Analyzing musical content', status: 'pending' },
  { id: 'compare', label: 'Comparing patterns', status: 'pending' },
  { id: 'generate', label: 'Generating results', status: 'pending' },
];

export function EnhancedProgressIndicator({ 
  isVisible, 
  steps = defaultSteps, 
  className 
}: EnhancedProgressIndicatorProps) {
  const [currentSteps, setCurrentSteps] = useState<ProcessingStep[]>(steps);
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrentSteps(steps.map(step => ({ ...step, status: 'pending', progress: 0 })));
      setOverallProgress(0);
      return;
    }

    // Simulate processing steps
    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        // Set current step to processing
        setCurrentSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'processing' : index < i ? 'completed' : 'pending'
        })));

        // Simulate step progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 100));
          setCurrentSteps(prev => prev.map((step, index) => ({
            ...step,
            progress: index === i ? progress : step.progress
          })));
          setOverallProgress(((i * 100) + progress) / steps.length);
        }

        // Mark step as completed
        setCurrentSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index <= i ? 'completed' : 'pending',
          progress: index === i ? 100 : step.progress
        })));
      }
    };

    processSteps();
  }, [isVisible, steps]);

  if (!isVisible) return null;

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return (
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        );
      case 'error':
        return <div className="w-5 h-5 rounded-full bg-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <Card className={`p-6 bg-card border-border ${className}`}>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Music className="w-8 h-8 text-primary" />
            <Zap className="w-4 h-4 text-primary-glow absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Processing MIDI Files
            </h3>
            <p className="text-sm text-muted-foreground">
              Analyzing musical patterns and generating comparison...
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Overall Progress</span>
            <span className="text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <Progress 
            value={overallProgress} 
            className="h-2"
          />
        </div>

        {/* Step-by-step Progress */}
        <div className="space-y-3">
          {currentSteps.map((step, index) => (
            <div key={step.id} className="space-y-2">
              <div className="flex items-center gap-3">
                {getStepIcon(step)}
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className={`text-sm font-medium ${
                      step.status === 'completed' ? 'text-green-600' :
                      step.status === 'processing' ? 'text-primary' :
                      step.status === 'error' ? 'text-red-500' :
                      'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                    {step.status === 'processing' && step.progress && (
                      <span className="text-xs text-muted-foreground">
                        {step.progress}%
                      </span>
                    )}
                  </div>
                  {step.status === 'processing' && (
                    <Progress 
                      value={step.progress || 0} 
                      className="h-1 mt-1"
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground text-center">
          This may take a few moments depending on file complexity
        </div>
      </div>
    </Card>
  );
}