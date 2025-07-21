'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  MapPin, 
  Calendar,
  User,
  BookOpen,
  Heart,
  AlertTriangle,
  Filter,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Loader2,
  Users,
  ToggleLeft,
  ToggleRight,
  Gift
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

interface Child {
  id: string;
  fullName: string;
  mothersName?: string;
  fathersName?: string;
  dateOfBirth: string;
  gender: string;
  currentCity?: string;
  state: string;
  educationType?: string;
  currentSchoolCollegeName?: string;
  currentClassSemester?: string;
  whatsappNumber?: string;
  callingNumber?: string;
  parentGuardianContactNumber?: string;
  background?: string;
  interests: (string | any)[];
  concerns: (string | { id: string; title: string; category: string; severity: string; status: string })[];
  language: string;
  createdAt: string;
  assignments?: {
    volunteer: {
      id: string;
      name: string;
      specialization?: string;
    };
  }[];
  concernRecords?: {
    id: string;
    title: string;
    category: string;
    severity: string;
    status: string;
  }[];
  sessions?: {
    id: string;
    scheduledAt?: string;
    status: string;
    volunteer: {
      name: string;
    };
  }[];
}

interface DeleteDialogState {
  isOpen: boolean;
  child: Child | null;
}

const INDIAN_STATES = [
  "All States", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function ChildrenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('All States');
  const [genderFilter, setGenderFilter] = useState('All');
  const [ageFilter, setAgeFilter] = useState('All');
  const [showAssignedOnly, setShowAssignedOnly] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    child: null
  });
  const [deletingChild, setDeletingChild] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalChildren, setTotalChildren] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    assigned: 0,
    withConcerns: 0,
    withSessions: 0,
    birthdaysToday: 0
  });

  useEffect(() => {
    fetchChildren(1); // Explicitly pass page 1
    fetchStats(); // Fetch stats separately
    
    // Handle success messages
    const message = searchParams?.get('message');
    if (message === 'child-added') {
      toast.success('Child profile added successfully!');
    } else if (message === 'child-updated') {
      toast.success('Child profile updated successfully!');
    } else if (message === 'child-deleted') {
      toast.success('Child profile deleted successfully!');
    }
  }, [searchParams]);

  const fetchStats = async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        return;
      }
      
      const accessToken = session.access_token;
      const response = await fetch('/api/children/stats', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const responseData = await response.json();
        const statsData = responseData.stats;
        setStats({
          total: statsData.totalChildren || 0,
          assigned: statsData.assignedChildren || 0,
          withConcerns: statsData.withConcerns || 0,
          withSessions: statsData.withSessions || 0,
          birthdaysToday: statsData.birthdaysToday || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchChildren = async (page = 1) => {
    try {
      setLoading(true);
      
      // Get the current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session data:', session);
      console.log('Session error:', sessionError);
      
      if (sessionError || !session) {
        throw new Error('No valid session found');
      }
      
      const accessToken = session.access_token;
      console.log('Access token available:', !!accessToken);
      
      // Build query parameters for pagination and filtering
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10', // 10 children per page
        ...(searchTerm && { search: searchTerm }),
        ...(stateFilter && stateFilter !== 'All States' && { state: stateFilter }),
        ...(genderFilter && genderFilter !== 'All' && { gender: genderFilter }),
        ...(ageFilter && ageFilter !== 'All' && { ageFilter }),
        ...(showAssignedOnly && { showAssignedOnly: 'true' })
      });
      
      // Fetch paginated children from API endpoint with auth header
      const response = await fetch(`/api/children?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      console.log('Fetched children response:', responseData);
      
      // Check if the response contains an error
      if (responseData.error) {
        throw new Error(responseData.error);
      }
      
      const childrenData = responseData.children || [];
      const paginationData = responseData.pagination || {};
      
      setChildren(childrenData);
      setCurrentPage(paginationData.page || 1);
      setTotalPages(paginationData.totalPages || 1);
      setTotalChildren(paginationData.total || 0);
      setHasNext(paginationData.hasNext || false);
      setHasPrev(paginationData.hasPrev || false);
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Something went wrong while loading profiles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when filters change
      fetchChildren(1);
      fetchStats(); // Refresh stats when filters change
    }, 300); // Debounce search

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, stateFilter, genderFilter, ageFilter, showAssignedOnly]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchChildren(newPage);
  };

  const handleDeleteClick = (child: Child) => {
    setDeleteDialog({
      isOpen: true,
      child
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.child) return;

    setDeletingChild(true);
    try {
      const response = await fetch(`/api/children/${deleteDialog.child.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDeleteDialog({ isOpen: false, child: null });
        fetchChildren(); // Refresh the list
        toast.success('Child profile deleted successfully');
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to delete child profile');
      }
    } catch (error) {
      console.error('Error deleting child:', error);
      toast.error('Something went wrong while deleting the profile');
    } finally {
      setDeletingChild(false);
    }
  };

  const getGenderBadgeColor = (gender: string) => {
    switch (gender) {
      case 'MALE': return 'bg-blue-100 text-blue-800';
      case 'FEMALE': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if today is the child's birthday
  const isBirthdayToday = (dateOfBirth: string) => {
    if (!dateOfBirth) return false;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    return today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate();
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const filteredChildren = children;

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Children Profiles</h1>
          <p className="text-gray-600">
            {showAssignedOnly 
              ? 'Viewing your assigned children only'
              : 'Viewing all children in the program'
            }
          </p>
        </div>
        <div className="flex items-center gap-4">
          {showAssignedOnly && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">
                My Assigned Only
              </span>
            </div>
          )}
          <Button onClick={() => router.push('/children/add')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Child
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{totalChildren}</p>
                <p className="text-sm text-gray-600">Total Children</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.assigned}
                </p>
                <p className="text-sm text-gray-600">Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.withConcerns}
                </p>
                <p className="text-sm text-gray-600">With Concerns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.withSessions}
                </p>
                <p className="text-sm text-gray-600">With Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-pink-600" />
              <div>
                <p className="text-2xl font-bold text-pink-600">
                  {stats.birthdaysToday}
                </p>
                <p className="text-sm text-gray-600">Birthdays Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search children..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                {INDIAN_STATES.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={genderFilter} onValueChange={setGenderFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Genders</SelectItem>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Ages</SelectItem>
                <SelectItem value="5-10">5-10 years</SelectItem>
                <SelectItem value="11-15">11-15 years</SelectItem>
                <SelectItem value="16-20">16-20 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Children List */}
      <div className="space-y-4">
        {children.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No children found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || stateFilter !== 'All States' || genderFilter !== 'All' || ageFilter !== 'All'
                  ? 'Try adjusting your search filters'
                  : 'No children have been assigned to you yet'
                }
              </p>
              {showAssignedOnly && (
                <Button onClick={() => router.push('/children/add')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Child
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          children.map((child) => (
            <Card key={child.id} className={`hover:shadow-md transition-shadow ${isBirthdayToday(child.dateOfBirth) ? 'border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isBirthdayToday(child.dateOfBirth) ? 'bg-pink-100' : 'bg-blue-100'}`}>
                      {isBirthdayToday(child.dateOfBirth) ? (
                        <Gift className="h-6 w-6 text-pink-600" />
                      ) : (
                        <User className="h-6 w-6 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {child.fullName}
                        {isBirthdayToday(child.dateOfBirth) && (
                          <Badge className="bg-pink-100 text-pink-800 border-pink-300">
                            <Gift className="h-3 w-3 mr-1" />
                            Birthday!
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-4">
                        <span>{calculateAge(child.dateOfBirth) || 'Age not available'} years old</span>
                        <Badge className={getGenderBadgeColor(child.gender)}>
                          {child.gender}
                        </Badge>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {child.currentCity}, {child.state}
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/children/${child.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                    {showAssignedOnly && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/children/${child.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(child)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assigned Volunteer */}
                {child.assignments && Array.isArray(child.assignments) && child.assignments.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Heart className="h-4 w-4 text-green-600" />
                    <span>Assigned to: <strong>{child.assignments[0].volunteer.name}</strong></span>
                    {child.assignments[0].volunteer.specialization && (
                      <Badge variant="outline" className="text-xs">
                        {child.assignments[0].volunteer.specialization}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Education Information */}
                {child.currentClassSemester && (
                  <div className="flex items-center space-x-2 text-sm">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span>{child.educationType}: <strong>{child.currentClassSemester}</strong></span>
                    {child.currentSchoolCollegeName && (
                      <span>at {child.currentSchoolCollegeName}</span>
                    )}
                  </div>
                )}

                {/* Interests */}
                {child.interests && Array.isArray(child.interests) && child.interests.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Interests:</span>
                    <div className="flex flex-wrap gap-1">
                      {child.interests.slice(0, 5).map((interest, index) => (
                        <Badge key={typeof interest === 'string' ? interest : index} variant="outline" className="text-xs">
                          {typeof interest === 'string' ? interest : String(interest)}
                        </Badge>
                      ))}
                      {child.interests.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{child.interests.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Concerns */}
                {child.concerns && Array.isArray(child.concerns) && child.concerns.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Concerns:</span>
                    <div className="flex flex-wrap gap-1">
                      {child.concerns.slice(0, 3).map((concern) => (
                        <Badge key={typeof concern === 'string' ? concern : concern.id} variant="destructive" className="text-xs">
                          {typeof concern === 'string' ? concern : concern.title}
                        </Badge>
                      ))}
                      {child.concerns.length > 3 && (
                        <Badge variant="destructive" className="text-xs">
                          +{child.concerns.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Active Concern Records */}
                {child.concernRecords && Array.isArray(child.concernRecords) && child.concernRecords.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Active Concerns:</span>
                    <div className="flex flex-wrap gap-1">
                      {child.concernRecords.slice(0, 2).map((concern) => (
                        <Badge 
                          key={concern.id} 
                          className={getSeverityColor(concern.severity)}
                        >
                          {concern.title}
                        </Badge>
                      ))}
                      {child.concernRecords.length > 2 && (
                        <Badge className="bg-gray-100 text-gray-800">
                          +{child.concernRecords.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Session */}
                {child.sessions && Array.isArray(child.sessions) && child.sessions.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <Calendar className="inline h-3 w-3 mr-1" />
                    Last session: {child.sessions[0].scheduledAt ? new Date(child.sessions[0].scheduledAt).toLocaleDateString() : 'Date not set'}
                    {child.sessions[0].volunteer && ` with ${child.sessions[0].volunteer.name}`}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Info - Always Show */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalChildren)} of {totalChildren} children
        </div>
        
        {/* Pagination Controls - Only Show When Multiple Pages */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrev}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNext}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setDeleteDialog({ isOpen: false, child: null });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Child Profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteDialog.child?.fullName}'s profile? 
              This action cannot be undone and will remove all associated data including sessions, concerns, and assignments.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ isOpen: false, child: null })}
              disabled={deletingChild}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deletingChild}
            >
              {deletingChild ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Profile
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
