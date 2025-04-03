import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Route } from "wouter";
import { type Question } from "@shared/schema";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import CustomQuestionForm from "@/components/questions/CustomQuestionForm";
import QuestionsList from "@/components/questions/QuestionsList";

export default function CustomQuestions() {
  const [activeTab, setActiveTab] = useState("add");
  
  // Fetch custom questions (filtering on the client side is fine for this feature)
  const { data: questions = [], isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });
  
  // Filter to show only custom questions
  const customQuestions = questions.filter((q: Question) => q.isCustom === true);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Custom Questions</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="add">Add Question</TabsTrigger>
          <TabsTrigger value="manage">Manage Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="add" className="py-4">
          <CustomQuestionForm />
        </TabsContent>
        
        <TabsContent value="manage" className="py-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Questions Library</CardTitle>
              <CardDescription>
                View and manage your custom interview questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">No custom questions found</p>
                  <p className="text-sm text-gray-400">
                    Create your first custom question using the "Add Question" tab
                  </p>
                </div>
              ) : (
                <QuestionsList 
                  questions={customQuestions} 
                  isLoading={questionsLoading}
                  showAnswers={true}
                  showScoreTypes={true}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}