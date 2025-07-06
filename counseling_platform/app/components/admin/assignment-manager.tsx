"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    // Fetch children, volunteers, and assignments from Supabase
    const fetchData = async () => {
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*, assignments(*, volunteer:users(id, name, specialization)), concerns(*)')
        .eq('isActive', true);
      if (childrenError) toast.error(childrenError.message);
      console.log('Fetched children:', childrenData);
      setChildren(childrenData || []);
      // Fetch all users, then filter for volunteers and admins in client
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, specialization, state, role, isActive');
      if (usersError) toast.error(usersError.message);
      const volunteersData = (allUsers || []).filter(u => {
        const role = u.role;
        return (role === 'VOLUNTEER' || role === 'ADMIN') && u.isActive;
      });
      console.log('Fetched volunteers:', volunteersData);
      setVolunteers(volunteersData);
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*, child_id, volunteerId')
        .eq('isActive', true);
      if (assignmentsError) toast.error(assignmentsError.message);
      console.log('Fetched assignments:', assignmentsData);
      setAssignments(assignmentsData || []);
    };
    fetchData();
  }, []);

  // Filter children based on search and filters
  const filteredChildren = children.filter(child => {
    const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = selectedState === "all" || child.state === selectedState;
    const matchesAssignment = 
      assignmentFilter === "all" ||
      (assignmentFilter === "assigned" && child.assignments.length > 0) ||
      (assignmentFilter === "unassigned" && child.assignments.length === 0);

    return matchesSearch && matchesState && matchesAssignment;
  });

  // Get unique states for filter
  const uniqueStates = [...new Set(children.map(child => child.state))].sort();

  // Assign volunteer to child
  const assignVolunteer = async (child_id: string, volunteerId: string) => {
    setIsAssigning(true);
    const { data, error } = await supabase
      .from('assignments')
      .insert([{ child_id: child_id, volunteerId: volunteerId, isActive: true }]);
    if (error) {
      toast.error(error.message || 'Failed to create assignment');
    } else {
      toast.success('Assignment created successfully!');
      // Refresh data
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('*')
        .eq('isActive', true);
      setAssignments(assignmentsData || []);
    }
    setIsAssigning(false);
  };

  // Remove assignment
  const removeAssignment = async (assignmentId: string) => {
    const { data, error } = await supabase
      .from('assignments')
      .update({ isActive: false })
      .eq('id', assignmentId);
    if (error) {
      toast.error(error.message || 'Failed to remove assignment');
    } else {
      toast.success('Assignment removed successfully!');
      // Refresh data
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('*')
        .eq('isActive', true);
      setAssignments(assignmentsData || []);
    }
  };

  // Bulk assign volunteers based on state matching
  const bulkAssignByState = async () => {
    const unassignedChildren = children.filter(child => child.assignments.length === 0);
    const assignmentPromises = unassignedChildren.map(child => {
      const matchingVolunteer = volunteers.find(volunteer => 
        volunteer.state === child.state && 
        !assignments.some(assignment => assignment.volunteerId === volunteer.id && assignment.isActive)
      );

      if (matchingVolunteer) {
        return assignVolunteer(child.id, matchingVolunteer.id);
      }
      return Promise.resolve();
    });

    try {
      await Promise.all(assignmentPromises);
      toast.success("Bulk assignment completed!");
    } catch (error) {
      toast.error("Some assignments failed");
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
            <Button onClick={bulkAssignByState} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Bulk Assign by State
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="children" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="children" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Children Management
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Current Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="children">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChildren.map((child) => (
              <Card key={child.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      <p className="text-sm text-gray-600">
                        {child.age} years old • {child.state}
                      </p>
                    </div>
                    {child.assignments.length > 0 ? (
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
                  {child.assignments.length > 0 ? (
                    <div className="space-y-2">
                      {child.assignments.map((assignment: any) => (
                        <div key={assignment.id} className="p-2 bg-gray-50 rounded border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{assignment.volunteer.name}</p>
                              <p className="text-xs text-gray-600">{assignment.volunteer.email}</p>
                              {assignment.volunteer.specialization && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {assignment.volunteer.specialization}
                                </Badge>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeAssignment(assignment.id)}
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
                      {child.concerns.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-orange-600 mb-1">
                            Active Concerns: {child.concerns.length}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {child.concerns.slice(0, 2).map((concern: any) => (
                              <Badge key={concern.id} variant="outline" className="text-xs">
                                {concern.category}
                              </Badge>
                            ))}
                            {child.concerns.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{child.concerns.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      <Dialog>
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
                            <DialogTitle>Assign Volunteer to {child.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded">
                              <p className="font-medium">{child.name}</p>
                              <p className="text-sm text-gray-600">{child.age} years old • {child.state}</p>
                              {child.concerns.length > 0 && (
                                <p className="text-sm text-orange-600 mt-1">
                                  {child.concerns.length} active concern(s)
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
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Current Assignments Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          {assignment.child ? (
                            <>
                              <p className="font-medium">{assignment.child.name}</p>
                              <p className="text-sm text-gray-600">
                                {assignment.child.age} years old • {assignment.child.state}
                              </p>
                            </>
                          ) : (
                            <p className="text-red-500 font-medium">Child not found</p>
                          )}
                        </div>
                        <div className="text-gray-400">→</div>
                        <div>
                          {assignment.volunteer ? (
                            <>
                              <p className="font-medium">{assignment.volunteer.name}</p>
                              <p className="text-sm text-gray-600">{assignment.volunteer.email}</p>
                              {assignment.volunteer.specialization && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {assignment.volunteer.specialization}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <p className="text-red-500 font-medium">Volunteer not found</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeAssignment(assignment.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No active assignments found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssignVolunteerInline({ child, volunteers, assignments, onAssign, onClose, isAssigning }: any) {
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);
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
                await onAssign(child.id, selectedVolunteerId);
                onClose();
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
