import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { QuestionFilter } from '@shared/schema';

interface QuestionFilterUIProps {
  filters: QuestionFilter;
  onChange: (filters: QuestionFilter) => void;
}

const QuestionFilterUI: React.FC<QuestionFilterUIProps> = ({ filters, onChange }) => {
  const { toast } = useToast();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          // Update filters with default values
          onChange({
            ...filters,
            experienceLevelId: 2, // Default to intermediate
            technologyId: 1, // Default to first technology
            count: 5
          });
        }}
      >
        Generate Questions
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          toast({
            title: "Coming Soon",
            description: "AI-powered question generation will be available in the next phase. This feature will automatically generate relevant questions based on the selected technologies and difficulty levels.",
          });
        }}
      >
        Generate with AI
      </Button>
      <p className="text-sm text-gray-500">
        Customize your interview questions or use AI to generate them automatically
      </p>
    </div>
  );
};

export default QuestionFilterUI; 