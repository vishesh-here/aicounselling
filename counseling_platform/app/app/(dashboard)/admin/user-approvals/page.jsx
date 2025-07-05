"use strict";
'use client';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const tabs_1 = require("@/components/ui/tabs");
const dialog_1 = require("@/components/ui/dialog");
const textarea_1 = require("@/components/ui/textarea");
const label_1 = require("@/components/ui/label");
const lucide_react_1 = require("lucide-react");
const alert_1 = require("@/components/ui/alert");
function UserApprovalsPage() {
    var _a, _b, _c, _d;
    const [users, setUsers] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [actionDialog, setActionDialog] = (0, react_1.useState)({
        isOpen: false,
        user: null,
        action: null,
        rejectionReason: ''
    });
    const [processingAction, setProcessingAction] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        fetchUsers();
    }, []);
    const fetchUsers = () => __awaiter(this, void 0, void 0, function* () {
        try {
            setLoading(true);
            const response = yield fetch('/api/admin/user-approvals');
            if (response.ok) {
                const data = yield response.json();
                setUsers(data.users);
            }
            else {
                console.error('Failed to fetch users');
            }
        }
        catch (error) {
            console.error('Error fetching users:', error);
        }
        finally {
            setLoading(false);
        }
    });
    const handleActionClick = (user, action) => {
        setActionDialog({
            isOpen: true,
            user,
            action,
            rejectionReason: ''
        });
    };
    const handleActionConfirm = () => __awaiter(this, void 0, void 0, function* () {
        if (!actionDialog.user || !actionDialog.action)
            return;
        setProcessingAction(true);
        try {
            const response = yield fetch('/api/admin/user-approvals', {
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
                yield fetchUsers(); // Refresh the list
                setActionDialog({
                    isOpen: false,
                    user: null,
                    action: null,
                    rejectionReason: ''
                });
            }
            else {
                console.error('Failed to process action');
            }
        }
        catch (error) {
            console.error('Error processing action:', error);
        }
        finally {
            setProcessingAction(false);
        }
    });
    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <lucide_react_1.Clock className="h-4 w-4"/>;
            case 'APPROVED':
                return <lucide_react_1.CheckCircle className="h-4 w-4"/>;
            case 'REJECTED':
                return <lucide_react_1.XCircle className="h-4 w-4"/>;
            default:
                return null;
        }
    };
    const getStatusColor = (status) => {
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
    if (((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
        console.log('User Approvals (JSX) user:', session?.user);
        const userRole = session?.user?.user_metadata?.role || session?.user?.app_metadata?.role;
        if (userRole !== 'ADMIN') {
            return (<div className="p-6">
            <alert_1.Alert variant="destructive">
              <lucide_react_1.AlertCircle className="h-4 w-4"/>
              <alert_1.AlertDescription>
                You don't have permission to access this page.
              </alert_1.AlertDescription>
            </alert_1.Alert>
          </div>);
        }
    }
    if (loading) {
        return (<div className="p-6">
        <div className="flex items-center justify-center h-64">
          <lucide_react_1.Loader2 className="h-8 w-8 animate-spin"/>
        </div>
      </div>);
    }
    return (<div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Approvals</h1>
          <p className="text-gray-600">Review and manage volunteer applications</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Clock className="h-5 w-5 text-yellow-600"/>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</p>
                <p className="text-sm text-gray-600">Pending Approval</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <lucide_react_1.CheckCircle className="h-5 w-5 text-green-600"/>
              <div>
                <p className="text-2xl font-bold text-green-600">{approvedUsers.length}</p>
                <p className="text-sm text-gray-600">Approved Users</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <lucide_react_1.XCircle className="h-5 w-5 text-red-600"/>
              <div>
                <p className="text-2xl font-bold text-red-600">{rejectedUsers.length}</p>
                <p className="text-sm text-gray-600">Rejected Applications</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* User Lists */}
      <tabs_1.Tabs defaultValue="pending" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="pending">
            Pending ({pendingUsers.length})
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="approved">
            Approved ({approvedUsers.length})
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="rejected">
            Rejected ({rejectedUsers.length})
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="pending" className="space-y-4">
          {pendingUsers.length === 0 ? (<card_1.Card>
              <card_1.CardContent className="p-6 text-center">
                <p className="text-gray-500">No pending applications</p>
              </card_1.CardContent>
            </card_1.Card>) : (pendingUsers.map(user => (<UserCard key={user.id} user={user} onAction={handleActionClick} showActions={true}/>)))}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="approved" className="space-y-4">
          {approvedUsers.length === 0 ? (<card_1.Card>
              <card_1.CardContent className="p-6 text-center">
                <p className="text-gray-500">No approved users</p>
              </card_1.CardContent>
            </card_1.Card>) : (approvedUsers.map(user => (<UserCard key={user.id} user={user} onAction={handleActionClick} showActions={false}/>)))}
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="rejected" className="space-y-4">
          {rejectedUsers.length === 0 ? (<card_1.Card>
              <card_1.CardContent className="p-6 text-center">
                <p className="text-gray-500">No rejected applications</p>
              </card_1.CardContent>
            </card_1.Card>) : (rejectedUsers.map(user => (<UserCard key={user.id} user={user} onAction={handleActionClick} showActions={false}/>)))}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Action Dialog */}
      <dialog_1.Dialog open={actionDialog.isOpen} onOpenChange={(open) => {
            if (!open) {
                setActionDialog({
                    isOpen: false,
                    user: null,
                    action: null,
                    rejectionReason: ''
                });
            }
        }}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>
              {actionDialog.action === 'approve' ? 'Approve User' : 'Reject Application'}
            </dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              {actionDialog.action === 'approve'
            ? `Are you sure you want to approve ${(_b = actionDialog.user) === null || _b === void 0 ? void 0 : _b.name}? They will be able to access the platform and start counseling sessions.`
            : `Are you sure you want to reject ${(_c = actionDialog.user) === null || _c === void 0 ? void 0 : _c.name}'s application?`}
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>

          {actionDialog.action === 'reject' && (<div className="space-y-2">
              <label_1.Label htmlFor="rejectionReason">Reason for rejection *</label_1.Label>
              <textarea_1.Textarea id="rejectionReason" value={actionDialog.rejectionReason} onChange={(e) => setActionDialog(prev => (Object.assign(Object.assign({}, prev), { rejectionReason: e.target.value })))} placeholder="Please provide a reason for rejecting this application..." rows={3}/>
            </div>)}

          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={() => setActionDialog({
            isOpen: false,
            user: null,
            action: null,
            rejectionReason: ''
        })} disabled={processingAction}>
              Cancel
            </button_1.Button>
            <button_1.Button onClick={handleActionConfirm} disabled={processingAction ||
            (actionDialog.action === 'reject' && !((_d = actionDialog.rejectionReason) === null || _d === void 0 ? void 0 : _d.trim()))} variant={actionDialog.action === 'approve' ? 'default' : 'destructive'}>
              {processingAction ? (<>
                  <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Processing...
                </>) : (actionDialog.action === 'approve' ? 'Approve' : 'Reject')}
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
exports.default = UserApprovalsPage;
function UserCard({ user, onAction, showActions }) {
    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING':
                return <lucide_react_1.Clock className="h-4 w-4"/>;
            case 'APPROVED':
                return <lucide_react_1.CheckCircle className="h-4 w-4"/>;
            case 'REJECTED':
                return <lucide_react_1.XCircle className="h-4 w-4"/>;
            default:
                return null;
        }
    };
    const getStatusColor = (status) => {
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
    return (<card_1.Card>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <lucide_react_1.User className="h-5 w-5 text-blue-600"/>
            </div>
            <div>
              <card_1.CardTitle className="text-lg">{user.name}</card_1.CardTitle>
              <card_1.CardDescription className="flex items-center space-x-1">
                <span>Applied on {new Date(user.createdAt).toLocaleDateString()}</span>
              </card_1.CardDescription>
            </div>
          </div>
          <badge_1.Badge className={`${getStatusColor(user.approvalStatus)} flex items-center space-x-1`}>
            {getStatusIcon(user.approvalStatus)}
            <span>{user.approvalStatus}</span>
          </badge_1.Badge>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <lucide_react_1.Mail className="h-4 w-4 text-gray-500"/>
            <span>{user.email}</span>
          </div>
          {user.phone && (<div className="flex items-center space-x-2 text-sm">
              <lucide_react_1.Phone className="h-4 w-4 text-gray-500"/>
              <span>{user.phone}</span>
            </div>)}
          {user.state && (<div className="flex items-center space-x-2 text-sm">
              <lucide_react_1.MapPin className="h-4 w-4 text-gray-500"/>
              <span>{user.state}</span>
            </div>)}
          {user.specialization && (<div className="flex items-center space-x-2 text-sm">
              <lucide_react_1.Briefcase className="h-4 w-4 text-gray-500"/>
              <span>{user.specialization}</span>
            </div>)}
        </div>

        {/* Experience */}
        {user.experience && (<div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700">Experience & Background</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {user.experience}
            </p>
          </div>)}

        {/* Motivation */}
        {user.motivation && (<div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 flex items-center space-x-1">
              <lucide_react_1.Heart className="h-4 w-4"/>
              <span>Motivation</span>
            </h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              {user.motivation}
            </p>
          </div>)}

        {/* Rejection Reason */}
        {user.approvalStatus === 'REJECTED' && user.rejectionReason && (<div className="space-y-2">
            <h4 className="font-medium text-sm text-red-700">Rejection Reason</h4>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {user.rejectionReason}
            </p>
          </div>)}

        {/* Approval Information */}
        {user.approvalStatus === 'APPROVED' && user.approver && user.approvedAt && (<div className="text-sm text-gray-500">
            Approved by {user.approver.name} on {new Date(user.approvedAt).toLocaleDateString()}
          </div>)}

        {/* Action Buttons */}
        {showActions && (<div className="flex space-x-2 pt-4 border-t">
            <button_1.Button onClick={() => onAction(user, 'approve')} className="flex-1" size="sm">
              <lucide_react_1.CheckCircle className="mr-2 h-4 w-4"/>
              Approve
            </button_1.Button>
            <button_1.Button onClick={() => onAction(user, 'reject')} variant="destructive" className="flex-1" size="sm">
              <lucide_react_1.XCircle className="mr-2 h-4 w-4"/>
              Reject
            </button_1.Button>
          </div>)}
      </card_1.CardContent>
    </card_1.Card>);
}
