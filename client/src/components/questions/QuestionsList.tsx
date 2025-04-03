import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionCard from "./QuestionCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuestionListProps {
  questions: any[];
  onGenerateMore: () => void;
  onScoreChange: (id: number, score: number, notes: string) => void;
  isGenerating?: boolean;
}

export default function QuestionsList({ 
  questions, 
  onGenerateMore, 
  onScoreChange,
  isGenerating = false 
}: QuestionListProps) {
  const [activeTab, setActiveTab] = useState("current");
  const { toast } = useToast();

  if (!questions || questions.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500 mb-4">No questions available. Generate some questions to get started.</p>
        <Button onClick={onGenerateMore} disabled={isGenerating}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Generate Questions
        </Button>
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

  return (
    <div>
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
                onScoreChange={onScoreChange}
              />
            ))}
            
            {/* Add More Questions Button */}
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
    </div>
  );
}
