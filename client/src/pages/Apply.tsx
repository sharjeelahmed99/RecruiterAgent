import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { JobApplicationForm } from '@/components/jobs/JobApplicationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function Apply() {
  const [location] = useLocation();
  const jobId = new URLSearchParams(window.location.search).get('jobId');

  const { data: jobs } = useQuery<any[]>({
    queryKey: ["/api/job-positions"],
    enabled: true,
  });

  // Find the specific job by ID
  const job = jobs?.find(j => j.id === parseInt(jobId || '0'));
  
  // Add console.log to debug the job data
  console.log("Jobs data in Apply page:", jobs);
  console.log("Selected job:", job);

  if (!jobId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Invalid Job Application</h2>
              <p className="text-gray-600 mb-4">No job ID provided. Please select a job to apply for.</p>
              <Button onClick={() => window.location.href = '/jobs'}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-4">Job Not Found</h2>
              <p className="text-gray-600 mb-4">The job you're trying to apply for could not be found.</p>
              <Button onClick={() => window.location.href = '/jobs'}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Jobs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Ensure job.title exists before rendering the form
  const jobTitle = job.title || "Position";
  console.log("Job title being passed to form:", jobTitle);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => window.location.href = '/jobs'}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Apply for {jobTitle}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <JobApplicationForm 
              jobId={parseInt(jobId)} 
              jobTitle={jobTitle}
              onClose={() => window.location.href = '/jobs'}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 