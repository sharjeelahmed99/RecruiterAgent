import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import JobPositionForm from '@/components/jobs/JobPositionForm';
import { useQuery } from '@tanstack/react-query';

export default function OpenJobs() {
  const [, navigate] = useLocation();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: jobs = [] } = useQuery<any>({
    queryKey: ["/api/job-positions"],
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Open Positions</h1>
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button>Create New Position</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <JobPositionForm onSuccess={() => setIsCreateOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6">
        {jobs.map((job: any) => (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="outline">{job.department}</Badge>
                    <Badge variant="outline">{job.level}</Badge>
                    <Badge variant="outline">{job.location}</Badge>
                  </div>
                </div>
                <Button 
                  onClick={() => navigate('/start-interview', { state: { jobTitle: job.title } })}
                >
                  Create Interview
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{job.description}</p>
              <div>
                <h4 className="font-medium mb-2">Requirements:</h4>
                <ul className="list-disc list-inside text-gray-600">
                  {job.requirements?.map((req: string, index: number) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}