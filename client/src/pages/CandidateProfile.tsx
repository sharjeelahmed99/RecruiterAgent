import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { UserIcon, MailIcon, PhoneIcon, CalendarIcon, PlusIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone?: string;
  technologies?: string[];
  notes?: string;
  status: 'new' | 'in_progress' | 'hired' | 'rejected';
  lastInterviewDate?: string;
}

interface Interview {
  id: number;
  title: string;
  date: string;
  status: string;
  overallScore: number | null;
  notes?: string;
}

export default function CandidateProfile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCandidate, setEditedCandidate] = useState<Partial<Candidate>>({});

  // Fetch candidate data
  const { data: candidate, isLoading } = useQuery<Candidate>({
    queryKey: [`/api/candidates/${id}`],
  });

  // Fetch interviews
  const { data: interviews, isLoading: isLoadingInterviews } = useQuery<Interview[]>({
    queryKey: [`/api/candidates/${id}/interviews`],
    enabled: !!id,
  });

  // Update candidate mutation
  const updateCandidateMutation = useMutation({
    mutationFn: async (data: Partial<Candidate>) => {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update candidate');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/candidates/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Candidate profile updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update candidate profile.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setEditedCandidate(candidate || {});
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editedCandidate) return;
    updateCandidateMutation.mutate(editedCandidate);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedCandidate({});
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">New</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case "hired":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Hired</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64 mb-4" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Candidate not found</h3>
                <p className="mt-1 text-sm text-gray-500">The candidate you're looking for doesn't exist or you don't have access.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Candidate Profile</CardTitle>
            <div className="space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleCancel} variant="outline">Cancel</Button>
                  <Button onClick={handleSave} disabled={updateCandidateMutation.isPending}>
                    {updateCandidateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>Edit Profile</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedCandidate.name || ''}
                        onChange={(e) => setEditedCandidate({ ...editedCandidate, name: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center mt-1">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{candidate.name}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editedCandidate.email || ''}
                        onChange={(e) => setEditedCandidate({ ...editedCandidate, email: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center mt-1">
                        <MailIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{candidate.email}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Phone</Label>
                    {isEditing ? (
                      <Input
                        value={editedCandidate.phone || ''}
                        onChange={(e) => setEditedCandidate({ ...editedCandidate, phone: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center mt-1">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{candidate.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Status</Label>
                    {isEditing ? (
                      <Select
                        value={editedCandidate.status || candidate.status}
                        onValueChange={(value) => setEditedCandidate({ ...editedCandidate, status: value as Candidate['status'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="hired">Hired</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        {getStatusBadge(candidate.status)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Notes</Label>
                    {isEditing ? (
                      <Textarea
                        value={editedCandidate.notes || ''}
                        onChange={(e) => setEditedCandidate({ ...editedCandidate, notes: e.target.value })}
                        className="mt-1"
                        rows={4}
                      />
                    ) : (
                      <p className="mt-1 text-gray-600">{candidate.notes || 'No notes available'}</p>
                    )}
                  </div>
                  {candidate.lastInterviewDate && (
                    <div>
                      <Label>Last Interview</Label>
                      <div className="flex items-center mt-1">
                        <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{new Date(candidate.lastInterviewDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Interview History */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Interview History</h2>
                {isLoadingInterviews ? (
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : interviews && interviews.length > 0 ? (
                  <div className="space-y-4">
                    {interviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              {interview.title || "Position not specified"}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(interview.date).toLocaleString()}
                            </p>
                          </div>
                          {getStatusBadge(interview.status)}
                        </div>
                        {interview.overallScore !== null && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Score:</p>
                            <p className="text-sm text-gray-600">{interview.overallScore}/5</p>
                          </div>
                        )}
                        {interview.notes && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Notes:</p>
                            <p className="text-sm text-gray-600">{interview.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No interviews scheduled yet</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setLocation(`/schedule-interview?candidateId=${id}`)}
                    >
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Schedule Interview
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 