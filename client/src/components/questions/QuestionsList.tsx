import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionCard from "./QuestionCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface QuestionListProps {
  questions: any[];
  onGenerateMore?: () => void;
  onScoreChange?: (id: number, score: number, notes: string) => void;
  onSkipToggle?: (id: number, skipped: boolean) => void;
  isGenerating?: boolean;
  isLoading?: boolean;
  showAnswers?: boolean;
  showScoreTypes?: boolean;
  isPreview?: boolean;
}

export default function QuestionsList({ 
  questions, 
  onGenerateMore, 
  onScoreChange,
  onSkipToggle,
  isGenerating = false,
  isLoading = false,
  showAnswers = false,
  showScoreTypes = false,
  isPreview = false
}: QuestionListProps) {
  const [activeTab, setActiveTab] = useState("current");
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">Loading questions...</p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500 mb-4">No questions available. {onGenerateMore ? "Generate some questions to get started." : ""}</p>
        {onGenerateMore && (
          <Button onClick={onGenerateMore} disabled={isGenerating}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Generate Questions
          </Button>
        )}
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    if (value !== "current") {
      toast({
        title: "Feature not available",
        description: "This feature is not implemented in the demo version.",
        variant: "default",
      });
      return;
    }
    setActiveTab(value);
  };

  // Helper function to determine if this is an interview question list or regular question list
  const isInterviewQuestionsList = questions.length > 0 && 'question' in questions[0];

  // If we're in preview mode, show a simplified view without tabs
  if (isPreview) {
    return (
      <div className="space-y-4 pb-10">
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-amber-700">
                These are preview questions only. Start the interview to score and evaluate the candidate.
              </p>
            </div>
          </div>
        </div>
        
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            questionId={q.id}
            title={q.title}
            content={q.content}
            answer={q.answer}
            technology={{ id: q.technologyId, name: q.technology?.name || "Unknown" }}
            experienceLevel={{ id: q.experienceLevelId, name: q.experienceLevel?.name || "Unknown" }}
            questionType={{ id: q.questionTypeId, name: q.questionType?.name || "Unknown" }}
            evaluatesTechnical={q.evaluatesTechnical}
            evaluatesProblemSolving={q.evaluatesProblemSolving}
            evaluatesCommunication={q.evaluatesCommunication}
            isCustom={q.isCustom}
            showAnswers={true}
            showScoreTypes={true}
          />
        ))}
        
        {/* Add More Questions Button */}
        {onGenerateMore && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={onGenerateMore}
              disabled={isGenerating}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              Generate More Questions
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {isInterviewQuestionsList ? (
        // Display for interview questions (with tabs)
        <Tabs defaultValue="current" className="w-full mb-6">
          <TabsList className="border-b border-gray-200 w-full justify-start mb-0 rounded-none bg-transparent">
            <TabsTrigger 
              value="current"
              onClick={() => handleTabChange("current")}
              className="border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 rounded-none px-1 py-4 bg-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Current Questions
            </TabsTrigger>
            <TabsTrigger 
              value="previous"
              onClick={() => handleTabChange("previous")}
              className="ml-8 border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 rounded-none px-1 py-4 bg-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Previous Questions
            </TabsTrigger>
            <TabsTrigger 
              value="saved"
              onClick={() => handleTabChange("saved")}
              className="ml-8 border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:text-indigo-600 rounded-none px-1 py-4 bg-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Saved Questions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="current" className="pt-4">
            <div className="space-y-4 pb-10">
              {questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  questionId={q.question.id}
                  interviewQuestionId={q.id}
                  title={q.question.title}
                  content={q.question.content}
                  answer={q.question.answer}
                  technology={q.question.technology}
                  experienceLevel={q.question.experienceLevel}
                  questionType={q.question.questionType}
                  score={q.score}
                  notes={q.notes}
                  skipped={q.skipped}
                  onScoreChange={onScoreChange}
                  onSkipToggle={onSkipToggle}
                  evaluatesTechnical={q.question.evaluatesTechnical}
                  evaluatesProblemSolving={q.question.evaluatesProblemSolving}
                  evaluatesCommunication={q.question.evaluatesCommunication}
                  showAnswers={showAnswers}
                  showScoreTypes={showScoreTypes}
                />
              ))}
              
              {/* Add More Questions Button */}
              {onGenerateMore && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={onGenerateMore}
                    disabled={isGenerating}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                    Generate More Questions
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="previous">
            <div className="py-12 text-center text-gray-500">
              Previous questions will appear here.
            </div>
          </TabsContent>
          <TabsContent value="saved">
            <div className="py-12 text-center text-gray-500">
              Saved questions will appear here.
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Display for regular question list (custom questions, etc.)
        <div className="space-y-4 pb-10">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              questionId={q.id}
              title={q.title}
              content={q.content}
              answer={q.answer}
              technology={{ id: q.technologyId, name: q.technology?.name || "Unknown" }}
              experienceLevel={{ id: q.experienceLevelId, name: q.experienceLevel?.name || "Unknown" }}
              questionType={{ id: q.questionTypeId, name: q.questionType?.name || "Unknown" }}
              evaluatesTechnical={q.evaluatesTechnical}
              evaluatesProblemSolving={q.evaluatesProblemSolving}
              evaluatesCommunication={q.evaluatesCommunication}
              isCustom={q.isCustom}
              showAnswers={showAnswers}
              showScoreTypes={showScoreTypes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
