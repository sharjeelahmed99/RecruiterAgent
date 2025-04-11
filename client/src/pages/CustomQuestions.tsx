import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type Question } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import AddQuestion from "@/components/questions/AddQuestion";
import ManageQuestions from "@/components/questions/ManageQuestions";

export default function CustomQuestions() {
  const [activeTab, setActiveTab] = useState("add");

  const { data: questions, isLoading } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/questions");
      return response.json();
    },
  });

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Questions Library</h1>
        <div className="mt-8">
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="add">Add Question</TabsTrigger>
                  <TabsTrigger value="manage">Manage Questions</TabsTrigger>
                </TabsList>
                <TabsContent value="add">
                  <AddQuestion />
                </TabsContent>
                <TabsContent value="manage">
                  <ManageQuestions 
                    questions={questions || []} 
                    isLoading={isLoading} 
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}