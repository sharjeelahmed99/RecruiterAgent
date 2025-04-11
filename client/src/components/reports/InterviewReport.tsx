import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileTextIcon, DownloadIcon, ShareIcon } from "lucide-react";
import { format } from "date-fns";
import PdfViewer from "@/components/ui/pdf-viewer";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";

interface InterviewReportProps {
  interview: any;
}

export default function InterviewReport({ interview }: InterviewReportProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  const [hrNotes, setHrNotes] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Clean up PDF URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const { mutate: updateHrDecision, isPending: isUpdatingHrDecision } = useMutation({
    mutationFn: async ({ decision, notes }: { decision: string, notes: string }) => {
      const response = await apiRequest("PUT", `/api/interviews/${interview.id}/hr-decision`, {
        decision,
        notes
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/interviews/${interview.id}/details`] });
      toast({
        title: "Decision updated",
        description: "The HR decision has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating decision",
        description: error.message || "Failed to update HR decision.",
        variant: "destructive",
      });
    }
  });

  const handleHrDecision = (decision: string) => {
    updateHrDecision({ decision, notes: hrNotes });
    // Invalidate candidate listing to refresh the list with updated status
    queryClient.invalidateQueries({ queryKey: ["/api/candidates"] });
  };

  const { mutate: generatePdf, isPending } = useMutation({
    mutationFn: async () => {
      // In a real implementation, this would call a server endpoint to generate a PDF
      const response = await createPdfReport(interview);
      return response;
    },
    onSuccess: (blob) => {
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowPdf(true);
      
      toast({
        title: "Report generated",
        description: "Your PDF report has been generated successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating PDF",
        description: error.message || "Failed to generate PDF report.",
        variant: "destructive",
      });
    }
  });

  // This function simulates PDF generation on the client side
  // In a real implementation, this would be handled by the server
  const createPdfReport = async (interview: any): Promise<Blob> => {
    // Simulate server processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a simple HTML representation for the PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Interview Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          h1 { color: #4F46E5; }
          .header { border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          table, th, td { border: 1px solid #ddd; }
          th, td { padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .score { font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${interview.title}</h1>
          <p>Candidate: ${interview.candidate.name}</p>
          <p>Date: ${format(new Date(interview.date), "MMMM d, yyyy")}</p>
          <p>Status: ${interview.status.replace('_', ' ')}</p>
        </div>
        
        <div class="section">
          <h2>Scoring Summary</h2>
          <table>
            <tr>
              <th>Category</th>
              <th>Score</th>
            </tr>
            <tr>
              <td>Technical Knowledge</td>
              <td class="score">${interview.technicalScore !== null ? interview.technicalScore + '/5' : 'N/A'}</td>
            </tr>
            <tr>
              <td>Problem Solving</td>
              <td class="score">${interview.problemSolvingScore !== null ? interview.problemSolvingScore + '/5' : 'N/A'}</td>
            </tr>
            <tr>
              <td>Communication</td>
              <td class="score">${interview.communicationScore !== null ? interview.communicationScore + '/5' : 'N/A'}</td>
            </tr>
            <tr>
              <td><strong>Overall Score</strong></td>
              <td class="score">${interview.overallScore !== null ? interview.overallScore + '/5' : 'N/A'}</td>
            </tr>
          </table>
        </div>
        
        <div class="section">
          <h2>Questions and Ratings</h2>
          ${interview.questions.map((q: any, i: number) => `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
              <h3>${i+1}. ${q.question.title}</h3>
              <p><strong>Technology:</strong> ${q.question.technology.name}</p>
              <p><strong>Experience Level:</strong> ${q.question.experienceLevel.name}</p>
              <p><strong>Question Type:</strong> ${q.question.questionType.name}</p>
              <p><strong>Score:</strong> ${q.score !== null ? q.score + '/5' : 'Not rated'}</p>
              ${q.notes ? `<p><strong>Notes:</strong> ${q.notes}</p>` : ''}
            </div>
          `).join('')}
        </div>
        
        <div class="section">
          <h2>Interviewer Notes</h2>
          <p>${interview.notes || 'No notes provided.'}</p>
        </div>
        
        <div class="section">
          <h2>Recommendation</h2>
          <p class="score">${interview.recommendation ? interview.recommendation.replace('_', ' ').toUpperCase() : 'No recommendation provided.'}</p>
        </div>
      </body>
      </html>
    `;
    
    // Convert HTML to a Blob
    const blob = new Blob([html], { type: 'text/html' });
    return blob;
  };

  const getRecommendationBadge = () => {
    const recommendation = interview.recommendation;
    if (!recommendation) return null;
    
    let className = "";
    switch (recommendation) {
      case "strong_hire":
        className = "bg-green-100 text-green-800";
        break;
      case "hire":
        className = "bg-blue-100 text-blue-800";
        break;
      case "consider":
        className = "bg-yellow-100 text-yellow-800";
        break;
      case "pass":
        className = "bg-red-100 text-red-800";
        break;
      case "not_recommended":
        className = "bg-red-100 text-red-800";
        break;
      default:
        className = "bg-gray-100 text-gray-800";
    }
    
    return (
      <Badge className={className}>
        {recommendation.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <div>
      <Card className="mb-6">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{interview.title}</CardTitle>
            {getRecommendationBadge()}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            <p>Candidate: <span className="font-medium">{interview.candidate.name}</span></p>
            <p>Date: <span className="font-medium">{formatDate(interview.date)}</span></p>
            {interview.assignee && (
              <p>Interviewer: <span className="font-medium">{interview.assignee.name}</span></p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Technical</div>
              <div className="text-2xl font-bold">{interview.technicalScore !== null ? interview.technicalScore : 'N/A'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Problem Solving</div>
              <div className="text-2xl font-bold">{interview.problemSolvingScore !== null ? interview.problemSolvingScore : 'N/A'}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500">Communication</div>
              <div className="text-2xl font-bold">{interview.communicationScore !== null ? interview.communicationScore : 'N/A'}</div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
            <p className="text-sm text-gray-700">{interview.notes || 'No notes provided.'}</p>
          </div>

          {/* HR Decision Section */}
          {interview.status === "completed" && !interview.hrNotes && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-4">HR Decision</h4>
              <div className="space-y-4">
                <Textarea
                  placeholder="Add your notes about the candidate..."
                  value={hrNotes}
                  onChange={(e) => setHrNotes(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1 bg-red-50 text-red-700 hover:bg-red-100"
                    onClick={() => handleHrDecision("rejected")}
                    disabled={isUpdatingHrDecision}
                  >
                    Reject Candidate
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 bg-green-50 text-green-700 hover:bg-green-100"
                    onClick={() => handleHrDecision("accepted")}
                    disabled={isUpdatingHrDecision}
                  >
                    Accept Candidate
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Display HR Decision if made */}
          {interview.status === "completed" && interview.hrNotes && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">HR Decision</h4>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className={
                  interview.candidate?.status === "hired" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                }>
                  {interview.candidate?.status === "hired" 
                    ? "Accepted" 
                    : "Rejected"}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{interview.hrNotes}</p>
            </div>
          )}
          
          <div className="flex justify-end mt-6 space-x-2">
            <Button 
              variant="outline"
              onClick={() => {}}>
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={() => generatePdf()}
              disabled={isPending}>
              {isPending ? (
                <>
                  <FileTextIcon className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileTextIcon className="h-4 w-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {showPdf && pdfUrl && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Interview Report Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[600px]">
              <PdfViewer url={pdfUrl} fileName={`${interview.title}.html`} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
