'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Clock, XCircle, User, MapPin, Phone, Mail, Briefcase, Heart, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  state?: string;
  specialization?: string;
  experience?: string;
  motivation?: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
  approver?: {
    name: string;
  };
}

interface ActionDialogState {
  isOpen: boolean;
  user: User | null;
  action: 'approve' | 'reject' | null;
  rejectionReason: string;
}

export default function UserApprovalsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({
    isOpen: false,
    user: null,
    action: null,
    rejectionReason: ''
  });
  const [processingAction, setProcessingAction] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Fetched user:', user);
      const role = user?.user_metadata?.role || user?.app_metadata?.role;
      if (!user || role !== 'ADMIN') {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      setIsAdmin(true);
      // Fetch all users, then filter for volunteers in client
      const { data: allUsers, error: usersError } = await supabase
        .from('users')
        .select('id, name, email, phone, state, specialization, experience, motivation, approval_status, rejection_reason, created_at, approved_by, approved_at, user_metadata, app_metadata');
      if (usersError) toast.error(usersError.message);
      // Filter for volunteers using metadata
      const volunteers = (allUsers || []).filter(u => {
        const role = u.user_metadata?.role || u.app_metadata?.role;
        return role === 'VOLUNTEER';
      });
      setUsers(volunteers);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const handleActionClick = (user: User, action: 'approve' | 'reject') => {
    setActionDialog({
      isOpen: true,
      user,
      action,
      rejectionReason: ''
    });
  };

  const handleActionConfirm = async () => {
    if (!actionDialog.user || !actionDialog.action) return;

    setProcessingAction(true);
    try {
      const response = await fetch('/api/admin/user-approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: actionDialog.user.id,
          action: actionDialog.action,
          rejectionReason: actionDialog.action === 'reject' ? actionDialog.rejectionReason : undefined
        })
      });

      if (response.ok) {
        await fetchUsers(); // Refresh the list
        setActionDialog({
          isOpen: false,
          user: null,
          action: null,
          rejectionReason: ''
        });
      } else {
        console.error('Failed to process action');
      }
    } catch (error) {
      console.error('Error processing action:', error);
    } finally {
      setProcessingAction(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const pendingUsers = users.filter(u => u.approvalStatus === 'PENDING');
  const approvedUsers = users.filter(u => u.approvalStatus === 'APPROVED');
  const rejectedUsers = users.filter(u => u.approvalStatus === 'REJECTED');

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAdmin) return <div>Unauthorized</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Approvals</h1>
          <p className="text-gray-600">Review and manage volunteer applications</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</p>
                <p className="text-sm text-gray-600">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{approvedUsers.length}</p>
                <p className="text-sm text-gray-600">Approved Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{rejectedUsers.length}</p>
                <p className="text-sm text-gray-600">Rejected Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Lists */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingUsers.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedUsers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedUsers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingUsers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No pending applications</p>
              </CardContent>
            </Card>
          ) : (
            pendingUsers.map(user => (
              <UserCard 
                key={user.id} 
                user={user} 
                onAction={handleActionClick}
                showActions={true}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedUsers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No approved users</p>
              </CardContent>
            </Card>
          ) : (
            approvedUsers.map(user => (
              <UserCard 
                key={user.id} 
                user={user} 
                onAction={handleActionClick}
                showActions={false}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedUsers.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">No rejected applications</p>
              </CardContent>
            </Card>
          ) : (
            rejectedUsers.map(user => (
              <UserCard 
                key={user.id} 
                user={user} 
                onAction={handleActionClick}
                showActions={false}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialog.isOpen} onOpenChange={(open) => {
        if (!open) {
          setActionDialog({
            isOpen: false,
            user: null,
            action: null,
            rejectionReason: ''
          });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'approve' ? 'Approve User' : 'Reject Application'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.action === 'approve' 
                ? `Are you sure you want to approve ${actionDialog.user?.name}? They will be able to access the platform and start counseling sessions.`
                : `Are you sure you want to reject ${actionDialog.user?.name}'s application?`
              }
            </DialogDescription>
          </DialogHeader>

          {actionDialog.action === 'reject' && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Reason for rejection *</Label>
              <Textarea
                id="rejectionReason"
                value={actionDialog.rejectionReason}
                onChange={(e) => setActionDialog(prev => ({
                  ...prev,
                  rejectionReason: e.target.value
                }))}
                placeholder="Please provide a reason for rejecting this application..."
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({
                isOpen: false,
                user: null,
                action: null,
                rejectionReason: ''
              })}
              disabled={processingAction}
            >
              Cancel
            </Button>
            <Button
              onClick={handleActionConfirm}
              disabled={
                processingAction || 
                (actionDialog.action === 'reject' && !actionDialog.rejectionReason?.trim())
              }
              variant={actionDialog.action === 'approve' ? 'default' : 'destructive'}
            >
              {processingAction ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                actionDialog.action === 'approve' ? 'Approve' : 'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface UserCardProps {
  user: User;
  onAction: (user: User, action: 'approve' | 'reject') => void;
  showActions: boolean;
}

function UserCard({ user, onAction, showActions }: UserCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <CardDescription className="flex items-center space-x-1">
                <span>Applied on {new Date(user.createdAt).toLocaleDateString()}</span>
              </CardDescription>
            </div>
          </div>
          <Badge className={`${getStatusColor(user.approvalStatus)} flex items-center space-x-1`}>
            {getStatusIcon(user.approvalStatus)}
            <span>{user.approvalStatus}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{user.phone}</span>
            </div>
          )}
          {user.state && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{user.state}</span>
            </div>
          )}
          {user.specialization && (
            <div className="flex items-center space-x-2 text-sm">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span>{user.specialization}</span>
            </div>
          )}
        </div>

        {/* Experience */}
        {user.experience && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Experience & Background</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {user.experience}
            </p>
          </div>
        )}

        {/* Motivation */}
        {user.motivation && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>Motivation</span>
            </h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {user.motivation}
            </p>
          </div>
        )}

        {/* Rejection Reason */}
        {user.approvalStatus === 'REJECTED' && user.rejectionReason && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-red-700">Rejection Reason</h4>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {user.rejectionReason}
            </p>
          </div>
        )}

        {/* Approval Information */}
        {user.approvalStatus === 'APPROVED' && user.approver && user.approvedAt && (
          <div className="text-sm text-gray-500">
            Approved by {user.approver.name} on {new Date(user.approvedAt).toLocaleDateString()}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex space-x-2 pt-4 border-t">
            <Button
              onClick={() => onAction(user, 'approve')}
              className="flex-1"
              size="sm"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={() => onAction(user, 'reject')}
              variant="destructive"
              className="flex-1"
              size="sm"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
