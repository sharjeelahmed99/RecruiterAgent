import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ClockIcon } from 'lucide-react';

interface InterviewTimerProps {
  startTime?: Date;
  onTimeUpdate?: (elapsedTime: number) => void;
}

export default function InterviewTimer({ startTime, onTimeUpdate }: InterviewTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
      if (onTimeUpdate) {
        onTimeUpdate(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-fit bg-white border-2 border-indigo-500 shadow-lg">
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-100 p-2 rounded-full">
            <ClockIcon className="h-4 w-4 text-indigo-600" />
          </div>
          <span className="text-xl font-mono font-semibold text-indigo-600">{formatTime(elapsedTime)}</span>
        </div>
      </CardContent>
    </Card>
  );
} 