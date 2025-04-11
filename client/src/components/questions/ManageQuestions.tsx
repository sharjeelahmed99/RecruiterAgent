import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Question } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ManageQuestionsProps {
  questions: Question[];
  isLoading: boolean;
}

export default function ManageQuestions({ questions, isLoading }: ManageQuestionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedValues, setEditedValues] = useState({
    title: "",
    content: "",
    answer: "",
    evaluatesTechnical: false,
    evaluatesProblemSolving: false,
    evaluatesCommunication: false,
  });

  const { mutate: updateQuestion } = useMutation({
    mutationFn: async (data: Partial<Question>) => {
      const response = await apiRequest("PUT", `/api/questions/${editingQuestion?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Question updated",
        description: "The question has been updated successfully.",
        variant: "default",
      });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteQuestion } = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/questions/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
      toast({
        title: "Question deleted",
        description: "The question has been deleted successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete question. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setEditedValues({
      title: question.title,
      content: question.content,
      answer: question.answer,
      evaluatesTechnical: question.evaluatesTechnical,
      evaluatesProblemSolving: question.evaluatesProblemSolving,
      evaluatesCommunication: question.evaluatesCommunication,
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingQuestion) return;
    updateQuestion({
      ...editedValues,
      id: editingQuestion.id,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      deleteQuestion(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Evaluates</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell className="font-medium">{question.title}</TableCell>
              <TableCell>{question.content}</TableCell>
              <TableCell>
                <div className="flex gap-1 flex-wrap">
                  {question.evaluatesTechnical && (
                    <Badge variant="secondary">Technical</Badge>
                  )}
                  {question.evaluatesProblemSolving && (
                    <Badge variant="secondary">Problem Solving</Badge>
                  )}
                  {question.evaluatesCommunication && (
                    <Badge variant="secondary">Communication</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(question)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(question.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Make changes to the question below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={editedValues.title}
                onChange={(e) =>
                  setEditedValues((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Question</Label>
              <Textarea
                id="content"
                value={editedValues.content}
                onChange={(e) =>
                  setEditedValues((prev) => ({ ...prev, content: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                value={editedValues.answer}
                onChange={(e) =>
                  setEditedValues((prev) => ({ ...prev, answer: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>Evaluates</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editedValues.evaluatesTechnical}
                    onChange={(e) =>
                      setEditedValues((prev) => ({
                        ...prev,
                        evaluatesTechnical: e.target.checked,
                      }))
                    }
                  />
                  Technical
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editedValues.evaluatesProblemSolving}
                    onChange={(e) =>
                      setEditedValues((prev) => ({
                        ...prev,
                        evaluatesProblemSolving: e.target.checked,
                      }))
                    }
                  />
                  Problem Solving
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editedValues.evaluatesCommunication}
                    onChange={(e) =>
                      setEditedValues((prev) => ({
                        ...prev,
                        evaluatesCommunication: e.target.checked,
                      }))
                    }
                  />
                  Communication
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 