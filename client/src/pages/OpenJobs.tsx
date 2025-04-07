
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import JobPositionForm from '@/components/jobs/JobPositionForm';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function OpenJobs() {
  const [, navigate] = useLocation();

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobPositions'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/job-positions');
      return response.json();
    }
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Open Positions</h1>
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetTrigger asChild>
            <Button>Create New Position</Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <JobPositionForm />
          </SheetContent>
        </Sheet>
      </div>
      
      <div className="grid gap-6">
        {jobs.map((job) => (
  {
    id: 1,
    title: 'Senior Java Developer',
    department: 'Engineering',
    level: 'Senior',
    location: 'Remote',
    description: 'Looking for an experienced Java developer with strong Spring Boot knowledge.',
    requirements: ['8+ years Java experience', 'Spring Boot', 'Microservices', 'SQL'],
  },
  {
    id: 2,
    title: 'Solutions Architect',
    department: 'Architecture',
    level: 'Senior',
    location: 'Hybrid',
    description: 'Seeking a solutions architect to design and oversee enterprise applications.',
    requirements: ['10+ years experience', 'Enterprise Architecture', 'Cloud Platforms', 'Team Leadership'],
  },
  {
    id: 3,
    title: 'Frontend Tech Lead',
    department: 'Engineering',
    level: 'Lead',
    location: 'On-site',
    description: 'Leading our frontend development team and initiatives.',
    requirements: ['React', 'TypeScript', '7+ years experience', 'Team Management'],
  },
];

export default function OpenJobs() {
  const [, navigate] = useLocation();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Open Positions</h1>
      
      <div className="grid gap-6">
        {JOBS.map((job) => (
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
                  {job.requirements.map((req, index) => (
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
