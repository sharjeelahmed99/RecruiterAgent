import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusIcon, PlayIcon } from "lucide-react";
import { QuestionFilter } from "@shared/schema";

interface QuestionFiltersProps {
  onGenerateQuestions: (filters: QuestionFilter) => void;
  onStartInterview?: (filters: QuestionFilter) => void;
  isGenerating?: boolean;
  isPending?: boolean;
  disableStartButton?: boolean;
  showStartButton?: boolean;
  candidates?: any[];
  onCandidateChange?: (candidateName: string) => void;
}

export default function QuestionFilters({ 
  onGenerateQuestions, 
  onStartInterview, 
  isGenerating = false, 
  isPending = false,
  disableStartButton = false,
  showStartButton = false,
  candidates = [],
  onCandidateChange
}: QuestionFiltersProps) {
  const [experienceLevelId, setExperienceLevelId] = useState<number | undefined>(undefined);
  const [technologyId, setTechnologyId] = useState<number | undefined>(undefined);
  const [questionTypeId, setQuestionTypeId] = useState<number | undefined>(undefined);
  const [candidateName, setCandidateName] = useState<string>('');
  const [count, setCount] = useState<number>(3);

  const { data: experienceLevels, isLoading: isLoadingExperienceLevels } = useQuery<any[]>({
    queryKey: ["/api/experience-levels"],
  });

  const { data: technologies, isLoading: isLoadingTechnologies } = useQuery<any[]>({
    queryKey: ["/api/technologies"],
  });

  const { data: questionTypes, isLoading: isLoadingQuestionTypes } = useQuery<any[]>({
    queryKey: ["/api/question-types"],
  });

  // Set default values once data is loaded
  useEffect(() => {
    if (technologies && technologies.length > 0 && !technologyId) {
      setTechnologyId(technologies[0].id);
    }
    if (experienceLevels && experienceLevels.length > 0 && !experienceLevelId) {
      setExperienceLevelId(experienceLevels[1].id); // Default to intermediate
    }
  }, [technologies, experienceLevels, technologyId, experienceLevelId]);
  
  // Notify parent component when candidate name changes
  useEffect(() => {
    if (candidateName && onCandidateChange) {
      onCandidateChange(candidateName);
    }
  }, [candidateName, onCandidateChange]);

  const getFilters = (): QuestionFilter => {
    return {
      experienceLevelId,
      technologyId,
      questionTypeId,
      count
    };
  };
  
  const handleGenerateQuestions = () => {
    onGenerateQuestions(getFilters());
  };
  
  const handleStartInterview = () => {
    if (onStartInterview) {
      onStartInterview(getFilters());
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Question Filters</h3>
      
      {/* Show candidate name input field when interviews are being started */}
      {showStartButton && (
        <div className="mb-6">
          <Label htmlFor="candidate" className="block text-sm font-medium text-gray-700 mb-1">
            Candidate Name
          </Label>
          <input
            type="text"
            id="candidate"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="Enter candidate name"
            className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Experience Level */}
        <div>
          <Label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
            Experience Level
          </Label>
          <Select
            disabled={isLoadingExperienceLevels}
            value={experienceLevelId?.toString()}
            onValueChange={(value) => setExperienceLevelId(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels?.map((level) => (
                <SelectItem key={level.id} value={level.id.toString()}>
                  {level.name.charAt(0).toUpperCase() + level.name.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Technology Stack */}
        <div>
          <Label htmlFor="technology" className="block text-sm font-medium text-gray-700 mb-1">
            Technology Stack
          </Label>
          <Select
            disabled={isLoadingTechnologies}
            value={technologyId?.toString()}
            onValueChange={(value) => setTechnologyId(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select technology" />
            </SelectTrigger>
            <SelectContent>
              {technologies?.map((tech) => (
                <SelectItem key={tech.id} value={tech.id.toString()}>
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Question Type */}
        <div>
          <Label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
            Question Type
          </Label>
          <Select
            disabled={isLoadingQuestionTypes}
            value={questionTypeId?.toString() || "all"}
            onValueChange={(value) => setQuestionTypeId(value !== "all" ? parseInt(value) : undefined)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {questionTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 flex justify-end space-x-3">
        {showStartButton && (
          <Button
            disabled={isPending || !technologyId || !experienceLevelId || disableStartButton}
            onClick={handleStartInterview}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlayIcon className="-ml-1 mr-2 h-5 w-5" />
            Start Interview
          </Button>
        )}
        <Button
          disabled={isGenerating || !technologyId || !experienceLevelId}
          onClick={handleGenerateQuestions}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          {showStartButton ? 'Preview Questions' : 'Generate Questions'}
        </Button>
      </div>
    </div>
  );
}
