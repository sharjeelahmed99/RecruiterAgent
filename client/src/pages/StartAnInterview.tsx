
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import QuestionFilters from '@/components/questions/QuestionFilters';
import QuestionsList from '@/components/questions/QuestionsList';
import { type Question, type QuestionFilter, type Candidate } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function StartAnInterview() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [questionFilters, setQuestionFilters] = useState<QuestionFilter | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  // Candidate form state
  const [candidateData, setCandidateData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [interviewTitle, setInterviewTitle] = useState('');

  // File upload mutation
  const { mutate: uploadResume, isPending: isUploading } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        body: formData,
      });
      return response.json();
    },
  });

  // Create candidate mutation
  const { mutate: createCandidate, isPending: isCreatingCandidate } = useMutation({
    mutationFn: async (data: typeof candidateData) => {
      let resumePath = '';
      if (resumeFile) {
        const uploadResult = await uploadResume(resumeFile);
        resumePath = uploadResult.resumeFile;
      }

      const response = await apiRequest('POST', '/api/candidates', {
        ...data,
        resumeFile: resumePath,
      });
      return response.json();
    },
    onSuccess: (candidate) => {
      startInterviewWithCandidate({
        candidateId: candidate.id,
        filter: questionFilters!
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create candidate profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCandidateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    if (!candidateData.name.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter at least the candidate name.',
        variant: 'destructive',
      });
      return;
    }
    createCandidate(candidateData);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Start an Interview</h1>
        <p className="text-gray-600">Create a candidate profile and generate interview questions.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Candidate Profile</CardTitle>
            <CardDescription>Enter candidate information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter candidate name"
                  value={candidateData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="candidate@example.com"
                  value={candidateData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={candidateData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add any relevant notes about the candidate..."
                  value={candidateData.notes}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="resume">Resume</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <p className="text-sm text-gray-500">Accepted formats: PDF, DOC, DOCX</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Interview Setup</h2>
          <QuestionFilters 
            onGenerateQuestions={(filter) => {
              setQuestionFilters(filter);
              setShowPreview(true);
            }}
            onStartInterview={handleSubmit}
            isGenerating={false}
            isPending={isCreatingCandidate}
            onTitleChange={setInterviewTitle}
            showStartButton={true}
            disableStartButton={!candidateData.name.trim()}
          />
        </div>

        {showPreview && (
          <div className="bg-white shadow-sm rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Preview Questions</h2>
            </div>
            <QuestionsList
              questions={previewQuestions}
              isLoading={false}
              isGenerating={false}
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
