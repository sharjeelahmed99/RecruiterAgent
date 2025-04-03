import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import { QuestionFilter } from "@shared/schema";

interface QuestionFiltersProps {
  onGenerateQuestions: (filters: QuestionFilter) => void;
  isGenerating?: boolean;
}

export default function QuestionFilters({ onGenerateQuestions, isGenerating = false }: QuestionFiltersProps) {
  const [experienceLevelId, setExperienceLevelId] = useState<number | undefined>(undefined);
  const [technologyId, setTechnologyId] = useState<number | undefined>(undefined);
  const [questionTypeId, setQuestionTypeId] = useState<number | undefined>(undefined);
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

  const handleGenerateQuestions = () => {
    onGenerateQuestions({
      experienceLevelId,
      technologyId,
      questionTypeId,
      count
    });
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Question Filters</h3>
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
            value={questionTypeId?.toString() || ""}
            onValueChange={(value) => setQuestionTypeId(value ? parseInt(value) : undefined)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {questionTypes?.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          disabled={isGenerating || !technologyId || !experienceLevelId}
          onClick={handleGenerateQuestions}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
          Generate Questions
        </Button>
      </div>
    </div>
  );
}
