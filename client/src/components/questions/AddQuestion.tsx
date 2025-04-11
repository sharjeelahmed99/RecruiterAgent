import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

interface AddQuestionFormData {
  title: string;
  content: string;
  answer: string;
  technologyId: number;
  experienceLevelId: number;
  questionTypeId: number;
  evaluatesTechnical: boolean;
  evaluatesProblemSolving: boolean;
  evaluatesCommunication: boolean;
  isCustom: boolean;
}

const initialFormData: AddQuestionFormData = {
  title: "",
  content: "",
  answer: "",
  technologyId: 0,
  experienceLevelId: 0,
  questionTypeId: 0,
  evaluatesTechnical: true,
  evaluatesProblemSolving: false,
  evaluatesCommunication: false,
  isCustom: true,
};

export default function AddQuestion() {
  const [formData, setFormData] = useState<AddQuestionFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof AddQuestionFormData, string>>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch technologies, experience levels, and question types
  const { data: technologies } = useQuery({
    queryKey: ["/api/technologies"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/technologies");
      return response.json();
    },
  });

  const { data: experienceLevels } = useQuery({
    queryKey: ["/api/experience-levels"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/experience-levels");
      return response.json();
    },
  });

  const { data: questionTypes } = useQuery({
    queryKey: ["/api/question-types"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/question-types");
      return response.json();
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddQuestionFormData, string>> = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    }

    if (!formData.content.trim()) {
      newErrors.content = "Question content is required";
      isValid = false;
    }

    if (!formData.answer.trim()) {
      newErrors.answer = "Answer is required";
      isValid = false;
    }

    if (!formData.technologyId) {
      newErrors.technologyId = "Technology is required";
      isValid = false;
    }

    if (!formData.experienceLevelId) {
      newErrors.experienceLevelId = "Experience level is required";
      isValid = false;
    }

    if (!formData.questionTypeId) {
      newErrors.questionTypeId = "Question type is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const addQuestionMutation = useMutation({
    mutationFn: async (data: AddQuestionFormData) => {
      const response = await apiRequest("POST", "/api/questions", {
        body: JSON.stringify({
          ...data,
          isCustom: true,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Success",
        description: "Question added successfully",
      });
      setFormData(initialFormData);
      setErrors({});
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      addQuestionMutation.mutate(formData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof AddQuestionFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    if (errors[name as keyof AddQuestionFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Question Title</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          required
          placeholder="Enter question title..."
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Question Content</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          required
          placeholder="Enter your question here..."
          className={`min-h-[100px] ${errors.content ? "border-red-500" : ""}`}
        />
        {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="answer">Model Answer</Label>
        <Textarea
          id="answer"
          name="answer"
          value={formData.answer}
          onChange={handleInputChange}
          required
          placeholder="Enter the model answer..."
          className={`min-h-[100px] ${errors.answer ? "border-red-500" : ""}`}
        />
        {errors.answer && <p className="text-sm text-red-500">{errors.answer}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="technologyId">Technology</Label>
          <Select
            value={formData.technologyId.toString()}
            onValueChange={(value) => handleSelectChange("technologyId", value)}
          >
            <SelectTrigger className={errors.technologyId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select technology" />
            </SelectTrigger>
            <SelectContent>
              {technologies?.map((tech: { id: number; name: string }) => (
                <SelectItem key={tech.id} value={tech.id.toString()}>
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.technologyId && <p className="text-sm text-red-500">{errors.technologyId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceLevelId">Experience Level</Label>
          <Select
            value={formData.experienceLevelId.toString()}
            onValueChange={(value) => handleSelectChange("experienceLevelId", value)}
          >
            <SelectTrigger className={errors.experienceLevelId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels?.map((level: { id: number; name: string }) => (
                <SelectItem key={level.id} value={level.id.toString()}>
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.experienceLevelId && <p className="text-sm text-red-500">{errors.experienceLevelId}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="questionTypeId">Question Type</Label>
          <Select
            value={formData.questionTypeId.toString()}
            onValueChange={(value) => handleSelectChange("questionTypeId", value)}
          >
            <SelectTrigger className={errors.questionTypeId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {questionTypes?.map((type: { id: number; name: string }) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.questionTypeId && <p className="text-sm text-red-500">{errors.questionTypeId}</p>}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Evaluation Criteria</Label>
        <div className="flex flex-col gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="evaluatesTechnical"
              checked={formData.evaluatesTechnical}
              onCheckedChange={(checked) => handleCheckboxChange("evaluatesTechnical", checked as boolean)}
            />
            <Label htmlFor="evaluatesTechnical">Evaluates Technical Skills</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="evaluatesProblemSolving"
              checked={formData.evaluatesProblemSolving}
              onCheckedChange={(checked) => handleCheckboxChange("evaluatesProblemSolving", checked as boolean)}
            />
            <Label htmlFor="evaluatesProblemSolving">Evaluates Problem Solving</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="evaluatesCommunication"
              checked={formData.evaluatesCommunication}
              onCheckedChange={(checked) => handleCheckboxChange("evaluatesCommunication", checked as boolean)}
            />
            <Label htmlFor="evaluatesCommunication">Evaluates Communication</Label>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={addQuestionMutation.isPending}
      >
        {addQuestionMutation.isPending ? "Adding..." : "Add Question"}
      </Button>
    </form>
  );
} 