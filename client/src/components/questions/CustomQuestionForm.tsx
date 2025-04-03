import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertQuestionSchema, type Technology, type ExperienceLevel, type QuestionType } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Extend the insertQuestionSchema with validation rules
const customQuestionSchema = insertQuestionSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters"),
  content: z.string().min(10, "Question must be at least 10 characters"),
  answer: z.string().min(10, "Answer must be at least 10 characters"),
  technologyId: z.coerce.number().min(1, "Please select a technology"),
  experienceLevelId: z.coerce.number().min(1, "Please select an experience level"),
  questionTypeId: z.coerce.number().min(1, "Please select a question type"),
  evaluatesTechnical: z.boolean().default(true),
  evaluatesProblemSolving: z.boolean().default(false),
  evaluatesCommunication: z.boolean().default(false),
  isCustom: z.boolean().default(true),
});

type CustomQuestionFormValues = z.infer<typeof customQuestionSchema>;

export default function CustomQuestionForm() {
  const { toast } = useToast();
  
  // Fetch technologies, experience levels, and question types
  const { data: technologies = [] } = useQuery<Technology[]>({
    queryKey: ["/api/technologies"],
  });

  const { data: experienceLevels = [] } = useQuery<ExperienceLevel[]>({
    queryKey: ["/api/experience-levels"],
  });

  const { data: questionTypes = [] } = useQuery<QuestionType[]>({
    queryKey: ["/api/question-types"],
  });

  // Create mutation for adding a new question
  const createQuestion = useMutation({
    mutationFn: async (data: CustomQuestionFormValues) => {
      return apiRequest(
        "POST", 
        "/api/questions", 
        data
      );
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your custom question has been created",
      });
      form.reset({
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
      });
      
      // Invalidate queries to refresh question lists
      queryClient.invalidateQueries({ queryKey: ["/api/questions"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create question. Please try again.",
        variant: "destructive",
      });
      console.error("Error creating question:", error);
    },
  });

  // Initialize form with react-hook-form and zod validation
  const form = useForm<CustomQuestionFormValues>({
    resolver: zodResolver(customQuestionSchema),
    defaultValues: {
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
    },
  });

  const onSubmit = (data: CustomQuestionFormValues) => {
    createQuestion.mutate(data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create Custom Question</CardTitle>
        <CardDescription>
          Add a new question to the interview database. Custom questions will be available in the question pool for all interviews.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React Hooks Implementation" {...field} />
                  </FormControl>
                  <FormDescription>
                    A brief, descriptive title for the question
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Explain how React Hooks work and implement a custom Hook that..." 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The full question text as it will be presented to the candidate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Answer</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a comprehensive answer that an interviewer can use as reference..." 
                      rows={5}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A model answer or key points the interviewer should look for
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="technologyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technology</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select technology" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {technologies.map((tech) => (
                          <SelectItem key={tech.id} value={tech.id.toString()}>
                            {tech.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceLevelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.id} value={level.id.toString()}>
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="questionTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {questionTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base">This question evaluates:</Label>
              <div className="flex flex-col gap-3">
                <FormField
                  control={form.control}
                  name="evaluatesTechnical"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Technical Knowledge</FormLabel>
                        <FormDescription>
                          Understanding of technical concepts and implementation details
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="evaluatesProblemSolving"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Problem Solving</FormLabel>
                        <FormDescription>
                          Ability to analyze problems and develop effective solutions
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="evaluatesCommunication"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Communication</FormLabel>
                        <FormDescription>
                          Clarity of explanation and ability to convey complex ideas
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={createQuestion.isPending}
            >
              {createQuestion.isPending ? "Creating..." : "Create Question"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}