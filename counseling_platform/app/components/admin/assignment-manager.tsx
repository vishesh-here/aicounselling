"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { 
  User, Users, UserPlus, Search, Filter, 
  MapPin, AlertCircle, CheckCircle, X
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export function AssignmentManager() {
  const [children, setChildren] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [assignmentFilter, setAssignmentFilter] = useState("all");
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedChild, setSelectedChild] = useState<any>(null);

  useEffect(() => {
    // Fetch children, volunteers, and assignments from API
    const fetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        
        if (!accessToken) {
          toast.error('No valid session');
          return;
        }

        // Fetch children
        const childrenResponse = await fetch('/api/children', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (childrenResponse.ok) {
          const childrenData = await childrenResponse.json();
          setChildren(childrenData.children || []);
        } else {
          toast.error('Failed to fetch children');
        }

        // Fetch volunteers
        const volunteersResponse = await fetch('/api/admin/volunteers', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (volunteersResponse.ok) {
          const volunteersData = await volunteersResponse.json();
          setVolunteers(volunteersData.volunteers || []);
        } else {
          toast.error('Failed to fetch volunteers');
        }

        // Fetch assignments
        const assignmentsResponse = await fetch('/api/admin/assignments', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          setAssignments(assignmentsData.assignments || []);
        } else {
          toast.error('Failed to fetch assignments');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  // Filter children based on search and filters
  const filteredChildren = children.filter(child => {
    const matchesSearch = child.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesState = selectedState === "all" || child.state === selectedState;
    const matchesAssignment = 
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && (child.assignments || []).length > 0) ||
      (assignmentFilter === "unassigned" && (child.assignments || []).length === 0);

    return matchesSearch && matchesState && matchesAssignment;
  });

  // Get unique states for filter
  const uniqueStates = [...new Set(children.map(child => child.state))].sort();

  // Assign volunteer to child
  const assignVolunteer = async (child_id: string, volunteerId: string) => {
    setIsAssigning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        toast.error('No valid session');
        return;
      }

      const response = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'assign',
          child_id,
          volunteerId
        })
      });

      const result = await response.json();
      console.log('Assignment response:', result);
      if (response.ok) {
        toast.success(result.message || 'Assignment created successfully!');
        // Refresh assignments data
        const assignmentsResponse = await fetch(`/api/admin/assignments?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          setAssignments(assignmentsData.assignments || []);
        }
        // Also refresh children data to update the UI
        const childrenResponse = await fetch(`/api/children?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (childrenResponse.ok) {
          const childrenData = await childrenResponse.json();
          setChildren(childrenData.children || []);
        }
        return true; // Indicate success
      } else {
        console.error('Assignment error:', result.error);
        toast.error(result.error || 'Failed to create assignment');
        return false; // Indicate failure
      }
    } catch (error) {
      console.error('Error assigning volunteer:', error);
      toast.error('Failed to create assignment');
      return false; // Indicate failure
    } finally {
      setIsAssigning(false);
    }
  };

  // Remove assignment
  const removeAssignment = async (assignmentId: string) => {
    console.log('Removing assignment with ID:', assignmentId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        toast.error('No valid session');
        return;
      }

      if (!assignmentId) {
        console.error('No assignment ID provided');
        toast.error('Invalid assignment ID');
        return;
      }

      const response = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'remove',
          assignment_id: assignmentId
        })
      });

      const result = await response.json();
      console.log('Remove assignment response:', result);
      
      if (response.ok) {
        toast.success('Assignment removed successfully!');
        // Refresh assignments data
        const assignmentsResponse = await fetch(`/api/admin/assignments?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (assignmentsResponse.ok) {
          const assignmentsData = await assignmentsResponse.json();
          setAssignments(assignmentsData.assignments || []);
        }
        // Also refresh children data to update the UI
        const childrenResponse = await fetch(`/api/children?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        if (childrenResponse.ok) {
          const childrenData = await childrenResponse.json();
          setChildren(childrenData.children || []);
        }
      } else {
        toast.error(result.error || 'Failed to remove assignment');
      }
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error('Failed to remove assignment');
    }
  };



  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search children..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                {uniqueStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Assignment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                <SelectItem value="assigned">Assigned Only</SelectItem>
                <SelectItem value="unassigned">Unassigned Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <h2 className="text-lg font-semibold">Children Management</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChildren.map((child) => (
              <Card key={child.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{child.fullName}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {child.dateOfBirth ? Math.floor((new Date().getTime() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 'N/A'} years old • {child.state}
                      </p>
                    </div>
                    {(child.assignments || []).length > 0 ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Assigned
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-300">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Unassigned
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {(child.assignments || []).length > 0 ? (
                    <div className="space-y-2">
                      {(child.assignments || []).map((assignment: any) => (
                        <div key={assignment.id} className="p-2 bg-gray-50 rounded border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{assignment.volunteer?.name || 'Unknown Volunteer'}</p>
                              <p className="text-xs text-gray-600">{assignment.volunteer?.email || 'No email'}</p>
                              {assignment.volunteer?.specialization && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {assignment.volunteer.specialization}
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                console.log('Assignment object:', assignment);
                                if (assignment.id) {
                                  removeAssignment(assignment.id);
                                } else {
                                  console.error('Assignment ID not found:', assignment);
                                  toast.error('Cannot remove assignment: ID not found');
                                }
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">No assigned volunteer</p>
                      {(child.concerns || []).length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-orange-600 mb-1">
                            Active Concerns: {(child.concerns || []).length}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {(child.concerns || []).slice(0, 2).map((concern: any) => (
                              <Badge key={concern.id} variant="outline" className="text-xs">
                                {concern.category}
                              </Badge>
                            ))}
                            {(child.concerns || []).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(child.concerns || []).length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <Dialog open={selectedChild?.id === child.id} onOpenChange={(open) => !open && setSelectedChild(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => setSelectedChild(child)}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Assign Volunteer
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Assign Volunteer to {child.fullName}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded">
                              <p className="font-medium">{child.fullName}</p>
                              <p className="text-sm text-gray-600">{child.dateOfBirth ? Math.floor((new Date().getTime() - new Date(child.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : 'N/A'} years old • {child.state}</p>
                              {(child.concerns || []).length > 0 && (
                                <p className="text-sm text-orange-600 mt-1">
                                  {(child.concerns || []).length} active concern(s)
                                </p>
                              )}
                            </div>
                            {/* Volunteer Dropdown and Inline Confirmation */}
                            <AssignVolunteerInline
                              child={child}
                              volunteers={volunteers}
                              assignments={assignments}
                              onAssign={assignVolunteer}
                              onClose={() => setSelectedChild(null)}
                              isAssigning={isAssigning}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
    </div>
  );
}

function AssignVolunteerInline({ child, volunteers, assignments, onAssign, onClose, isAssigning }: any) {
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Reset state when modal closes or assignment completes
  useEffect(() => {
    if (!isAssigning) {
      setSelectedVolunteerId("");
      setShowConfirm(false);
    }
  }, [isAssigning]);
  
  // Reset state when onClose is called (modal closes)
  useEffect(() => {
    const resetState = () => {
      setSelectedVolunteerId("");
      setShowConfirm(false);
    };
    
    // This will be called when the modal closes
    return () => {
      resetState();
    };
  }, []);
  const selectedVolunteer = volunteers.find((v: any) => v.id === selectedVolunteerId);
  // Count current mentees for this volunteer (including this assignment if confirmed)
  const currentMenteeCount = assignments.filter((a: any) => a.volunteerId === selectedVolunteerId && a.isActive).length;
  const menteeCountWithNew = selectedVolunteerId ? currentMenteeCount + 1 : 0;

  return (
    <div className="space-y-4">
      <Select value={selectedVolunteerId} onValueChange={setSelectedVolunteerId}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a volunteer" />
        </SelectTrigger>
        <SelectContent>
          {volunteers.map((vol: any) => (
            <SelectItem key={vol.id} value={vol.id}>
              {vol.name} ({vol.state})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedVolunteer && !showConfirm && (
        <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowConfirm(true)}>
          Next
        </Button>
      )}
      {showConfirm && selectedVolunteer && (
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-medium">{selectedVolunteer.name}</span> will now have <span className="font-bold">{menteeCountWithNew}</span> assigned mentee(s). Would you like to confirm?
          </p>
          <div className="flex gap-2">
            <Button
              className="bg-green-600 hover:bg-green-700"
              disabled={isAssigning}
              onClick={async () => {
                const success = await onAssign(child.id, selectedVolunteerId);
                if (success) {
                  onClose();
                }
              }}
            >
              Yes, Assign
            </Button>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              No, Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
