import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import QuestionFilters from '@/components/questions/QuestionFilters';
import QuestionsList from '@/components/questions/QuestionsList';
import { type Question, type QuestionFilter, type Candidate } from '@shared/schema';

export default function StartAnInterview() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [questionFilters, setQuestionFilters] = useState<QuestionFilter | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Query for candidates
  const { data: candidates, isLoading: isCandidatesLoading } = useQuery<Candidate[]>({
    queryKey: ['/api/candidates'],
  });

  // Mutation for generating questions
  const { mutate: generateQuestions, isPending: isGeneratingQuestions } = useMutation({
    mutationFn: async (filter: QuestionFilter) => {
      const response = await apiRequest('POST', '/api/questions/filter', filter);
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewQuestions(data);
      setShowPreview(true);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to generate questions. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Mutation for starting an interview
  const { mutate: startInterview, isPending: isStartingInterview } = useMutation({
    mutationFn: async ({ candidateId, filter }: { candidateId: number; filter: QuestionFilter }) => {
      const response = await apiRequest('POST', '/api/interviews', {
        candidateId,
        filter,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setLocation(`/interviews/${data.id}`);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to start interview. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handlePreviewQuestions = (filter: QuestionFilter) => {
    setQuestionFilters(filter);
    generateQuestions(filter);
  };

  const handleStartInterview = (filter: QuestionFilter) => {
    // If there's a selected candidate and filters, create an interview
    if (selectedCandidate) {
      startInterview({
        candidateId: selectedCandidate,
        filter,
      });
    } else {
      toast({
        title: 'Select a candidate',
        description: 'Please select a candidate before starting the interview.',
        variant: 'default',
      });
    }
  };

  const handleCandidateChange = (candidateId: number) => {
    setSelectedCandidate(candidateId);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start an Interview</h1>
        <p className="text-gray-600">Generate questions and start evaluating a candidate.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Setup</h2>
          <QuestionFilters 
            onGenerateQuestions={handlePreviewQuestions}
            onStartInterview={handleStartInterview}
            isGenerating={isGeneratingQuestions}
            isPending={isStartingInterview}
            candidates={candidates || []}
            onCandidateChange={handleCandidateChange}
            showStartButton={true}
            disableStartButton={!selectedCandidate}
          />
        </div>

        {showPreview && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Preview Questions</h2>
              <Button
                onClick={() => {
                  if (questionFilters && selectedCandidate) {
                    startInterview({
                      candidateId: selectedCandidate,
                      filter: questionFilters,
                    });
                  }
                }}
                disabled={isStartingInterview || !selectedCandidate}
              >
                {isStartingInterview ? 'Starting...' : 'Start Interview with These Questions'}
              </Button>
            </div>
            <QuestionsList
              questions={previewQuestions}
              isLoading={isGeneratingQuestions}
              isGenerating={isGeneratingQuestions}
              showAnswers={true}
              showScoreTypes={true}
              isPreview={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}