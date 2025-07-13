import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Cpu, Cloud, Zap, Shield } from 'lucide-react';

interface ProcessingModeToggleProps {
  mode: 'client' | 'server';
  onModeChange: (mode: 'client' | 'server') => void;
  disabled?: boolean;
}

export function ProcessingModeToggle({ mode, onModeChange, disabled = false }: ProcessingModeToggleProps) {
  return (
    <Card className="p-4 bg-gradient-card border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Client-side</span>
          </div>
          
          <Switch
            checked={mode === 'server'}
            onCheckedChange={(checked) => onModeChange(checked ? 'server' : 'client')}
            disabled={disabled}
          />
          
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Server-side</span>
          </div>
        </div>

        <Badge variant={mode === 'server' ? 'default' : 'secondary'}>
          {mode === 'server' ? 'Enhanced' : 'Standard'}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className={`p-3 rounded-lg border transition-colors ${
          mode === 'client' 
            ? 'bg-primary/10 border-primary/30' 
            : 'bg-muted/30 border-border'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Client-side Processing</span>
          </div>
          <ul className="text-muted-foreground space-y-1">
            <li>• Instant processing</li>
            <li>• Works offline</li>
            <li>• Basic comparison</li>
            <li>• Privacy focused</li>
          </ul>
        </div>

        <div className={`p-3 rounded-lg border transition-colors ${
          mode === 'server' 
            ? 'bg-primary/10 border-primary/30' 
            : 'bg-muted/30 border-border'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Server-side Processing</span>
          </div>
          <ul className="text-muted-foreground space-y-1">
            <li>• Advanced algorithms</li>
            <li>• Harmonic analysis</li>
            <li>• Rhythm detection</li>
            <li>• Key signature matching</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}