import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertJobPositionSchema } from "@shared/schema";

export default function JobPositionForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm({
    resolver: zodResolver(insertJobPositionSchema),
    defaultValues: {
      title: "",
      department: "",
      level: "",
      location: "",
      description: "",
      requirements: [],
    },
  });

  const createJobPosition = useMutation({
    mutationFn: async (data: any) => {
      try {
        const response = await fetch('/api/job-positions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create job position');
        return response.json();
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast({
        title: "Success",
        description: "Job position created successfully",
      });
      form.reset();
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create job position",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Ensure requirements is an array
    // Convert textarea input into array of strings
    const requirements = data.requirements
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);
    
    // Ensure we send proper data matching the schema
    const formData = {
      title: data.title,
      department: data.department,
      level: data.level,
      location: data.location, 
      description: data.description,
      requirements: requirements
    };
    createJobPosition.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Job Position</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior Java Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Senior" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Remote" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter job description..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Requirements (one per line)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter requirements, one per line..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={createJobPosition.isPending}
            >
              {createJobPosition.isPending ? "Creating..." : "Create Job Position"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}