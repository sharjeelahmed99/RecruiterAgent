import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDownIcon, ChevronUpIcon, BrainIcon, LightbulbIcon, MessagesSquareIcon } from "lucide-react";
import RatingScale from "@/components/ui/RatingScale";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface QuestionCardProps {
  questionId: number;
  interviewQuestionId?: number;
  title: string;
  content: string;
  answer: string;
  technology: {
    id: number;
    name: string;
  };
  experienceLevel: {
    id: number;
    name: string;
  };
  questionType: {
    id: number;
    name: string;
  };
  score?: number | null;
  notes?: string;
  onScoreChange?: (id: number, score: number, notes: string) => void;
  evaluatesTechnical?: boolean;
  evaluatesProblemSolving?: boolean;
  evaluatesCommunication?: boolean;
  isCustom?: boolean;
  showAnswers?: boolean;
  showScoreTypes?: boolean;
}

export default function QuestionCard({
  questionId,
  interviewQuestionId,
  title,
  content,
  answer,
  technology,
  experienceLevel,
  questionType,
  score = null,
  notes = "",
  onScoreChange,
  evaluatesTechnical = false,
  evaluatesProblemSolving = false,
  evaluatesCommunication = false,
  isCustom = false,
  showAnswers = false,
  showScoreTypes = false
}: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(showAnswers);
  const [noteText, setNoteText] = useState(notes || "");
  
  const { mutate, isPending } = useMutation({
    mutationFn: async ({ score, notes }: { score: number; notes: string }) => {
      if (!interviewQuestionId) return null;
      return apiRequest(
        "PUT", 
        `/api/interview-questions/${interviewQuestionId}`, 
        { score, notes }
      );
    },
    onSuccess: () => {
      // Handle success if needed
    },
  });

  const handleScoreChange = (newScore: number) => {
    if (onScoreChange && interviewQuestionId) {
      onScoreChange(interviewQuestionId, newScore, noteText);
      mutate({ score: newScore, notes: noteText });
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newNotes = e.target.value;
    setNoteText(newNotes);
  };

  const handleNotesBlur = () => {
    if (noteText !== notes && onScoreChange && interviewQuestionId) {
      onScoreChange(interviewQuestionId, score || 0, noteText);
      mutate({ score: score || 0, notes: noteText });
    }
  };

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const formatExperienceLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const formatQuestionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card className="bg-white shadow rounded-lg transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="flex gap-2">
            {isCustom && (
              <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                Custom
              </Badge>
            )}
            <Badge variant="outline" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
              {technology.name}
            </Badge>
          </div>
        </div>
        
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-sm text-gray-500">
            {formatExperienceLevel(experienceLevel.name)} • {formatQuestionType(questionType.name)}
          </p>
          
          {/* Show evaluation flags */}
          {showScoreTypes && (
            <div className="flex gap-1 ml-auto">
              {evaluatesTechnical && (
                <Badge variant="outline" className="bg-blue-50 text-blue-800 hover:bg-blue-100 flex items-center gap-1">
                  <BrainIcon className="h-3 w-3" />
                  <span className="text-xs">Technical</span>
                </Badge>
              )}
              {evaluatesProblemSolving && (
                <Badge variant="outline" className="bg-amber-50 text-amber-800 hover:bg-amber-100 flex items-center gap-1">
                  <LightbulbIcon className="h-3 w-3" />
                  <span className="text-xs">Problem Solving</span>
                </Badge>
              )}
              {evaluatesCommunication && (
                <Badge variant="outline" className="bg-violet-50 text-violet-800 hover:bg-violet-100 flex items-center gap-1">
                  <MessagesSquareIcon className="h-3 w-3" />
                  <span className="text-xs">Communication</span>
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Question Content */}
        <div className="mt-4">
          <p className="text-sm text-gray-700">{content}</p>
        </div>
        
        {/* Answer Section (Collapsible) */}
        <div className="mt-6 border-t border-gray-200 pt-4">
          <button 
            className="flex items-center text-sm text-indigo-600 font-medium focus:outline-none" 
            onClick={toggleAnswer}
          >
            {showAnswer ? (
              <ChevronUpIcon className="h-5 w-5 mr-1" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 mr-1" />
            )}
            {showAnswer ? "Hide Expected Answer" : "Show Expected Answer"}
          </button>
          
          {showAnswer && (
            <div className="mt-2 text-sm text-gray-700">
              <p className="mb-2"><strong>Expected Answer:</strong></p>
              <div className="whitespace-pre-wrap">{answer}</div>
            </div>
          )}
        </div>
        
        {/* Scoring Section */}
        {onScoreChange && (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900">Rate Candidate's Response:</h4>
            <div className="mt-2 flex items-center">
              <div className="flex items-center">
                <RatingScale value={score} onChange={handleScoreChange} />
              </div>
              <div className="ml-4 flex-1">
                <Input
                  type="text"
                  className="block w-full"
                  placeholder="Add notes on response..."
                  value={noteText}
                  onChange={handleNotesChange}
                  onBlur={handleNotesBlur}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
