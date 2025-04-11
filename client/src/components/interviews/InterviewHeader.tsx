import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ShareIcon, FileTextIcon } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface InterviewHeaderProps {
  title: string;
  candidateName: string;
  date: string;
  status: string;
  onGenerateReport: () => void;
  isGeneratingReport?: boolean;
}

export default function InterviewHeader({
  title,
  candidateName,
  date,
  status,
  onGenerateReport,
  isGeneratingReport = false
}: InterviewHeaderProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const formattedDate = format(new Date(date), "MMM d, yyyy");
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({
      title: "Link copied to clipboard",
      description: "You can now share this interview session with others.",
      variant: "default",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const formatStatus = (status: string) => {
    return status.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6 mt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">
            Candidate: <span className="font-medium">{candidateName}</span> • 
            Date: <span className="font-medium">{formattedDate}</span>
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
            <svg className="-ml-1 mr-1.5 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            {formatStatus(status)}
          </span>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleShare}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ShareIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Share
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={onGenerateReport}
              disabled={isGeneratingReport}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FileTextIcon className="-ml-1 mr-2 h-5 w-5" />
              Generate Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
