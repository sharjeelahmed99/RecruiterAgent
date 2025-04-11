import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface JobApplicationFormProps {
  jobId: number;
  jobTitle: string;
  onClose: () => void;
}

interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  resume: string;
  resumeFile: File | null;
  coverLetter: string;
}

export function JobApplicationForm({ jobId, jobTitle, onClose }: JobApplicationFormProps) {
  console.log("Job Title in JobApplicationForm:", jobTitle);
  console.log("Job ID in JobApplicationForm:", jobId);
  
  const displayTitle = jobTitle || "Position";
  console.log("Display title:", displayTitle);
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '',
    email: '',
    phone: '',
    resume: '',
    resumeFile: null,
    coverLetter: '',
  });
  const [errors, setErrors] = useState<Partial<ApplicationFormData>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Partial<ApplicationFormData> = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.resume && !formData.resumeFile) newErrors.resume = 'Either resume URL or file is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applicationMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          jobId,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to submit application');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Application Submitted',
        description: 'Your application has been submitted successfully.',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      applicationMutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ApplicationFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, resumeFile: file }));
      
      // Auto-populate candidate information from the resume filename
      const fileName = file.name;
      const nameFromFile = fileName.split('.')[0].replace(/_/g, ' ').replace(/-/g, ' ');
      
      // Only update if the name field is empty
      if (!formData.fullName) {
        setFormData(prev => ({ 
          ...prev, 
          fullName: nameFromFile,
          email: `${nameFromFile.toLowerCase().replace(/\s+/g, '.')}@example.com`
        }));
      }
      
      // Set placeholder technologies based on the file name
      const techKeywords = {
        'javascript': ['JavaScript', 'React', 'Node.js'],
        'typescript': ['TypeScript', 'React', 'Node.js'],
        'react': ['React', 'JavaScript', 'TypeScript'],
        'angular': ['Angular', 'TypeScript', 'JavaScript'],
        'vue': ['Vue', 'JavaScript', 'TypeScript'],
        'python': ['Python', 'Django', 'Flask'],
        'java': ['Java', 'Spring', 'Hibernate'],
        'csharp': ['C#', '.NET', 'ASP.NET'],
        'php': ['PHP', 'Laravel', 'MySQL'],
        'ruby': ['Ruby', 'Rails', 'PostgreSQL'],
        'go': ['Go', 'Gin', 'Docker'],
        'rust': ['Rust', 'Cargo', 'WebAssembly'],
        'sql': ['SQL', 'PostgreSQL', 'MySQL'],
        'mongodb': ['MongoDB', 'Node.js', 'Express'],
        'aws': ['AWS', 'Docker', 'Kubernetes'],
        'azure': ['Azure', 'Docker', 'Kubernetes'],
        'docker': ['Docker', 'Kubernetes', 'CI/CD'],
        'kubernetes': ['Kubernetes', 'Docker', 'Helm'],
        'git': ['Git', 'GitHub', 'CI/CD']
      };
      
      // Check if any tech keywords are in the filename
      const fileNameLower = fileName.toLowerCase();
      const matchedTechs = Object.entries(techKeywords)
        .filter(([keyword]) => fileNameLower.includes(keyword))
        .flatMap(([_, techs]) => techs);
      
      if (matchedTechs.length > 0) {
        // We don't have a way to set technologies in the application form yet
        // This would be useful for future enhancement
      }
      
      toast({
        title: "Resume uploaded",
        description: "Candidate information has been auto-populated from the resume.",
        variant: "default",
      });
      
      if (errors.resume) {
        setErrors(prev => ({ ...prev, resume: undefined }));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Apply for {displayTitle}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium mb-1">
              Full Name
            </label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="resume" className="block text-sm font-medium mb-1">
              Resume URL
            </label>
            <Input
              id="resume"
              name="resume"
              value={formData.resume}
              onChange={handleChange}
              className={errors.resume ? 'border-red-500' : ''}
              placeholder="Paste your resume URL (e.g., Google Drive, Dropbox)"
            />
            {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume}</p>}
          </div>

          <div>
            <label htmlFor="resumeFile" className="block text-sm font-medium mb-1">
              Or Upload Resume
            </label>
            <Input
              id="resumeFile"
              name="resumeFile"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 font-medium">Auto-populate feature</p>
              <p className="text-sm text-blue-700 mt-1">
                Uploading a resume will automatically populate candidate information such as name and email based on the resume filename.
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="coverLetter" className="block text-sm font-medium mb-1">
              Cover Letter
            </label>
            <Textarea
              id="coverLetter"
              name="coverLetter"
              value={formData.coverLetter}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us why you're a great fit for this position..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={applicationMutation.isPending}>
              {applicationMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 