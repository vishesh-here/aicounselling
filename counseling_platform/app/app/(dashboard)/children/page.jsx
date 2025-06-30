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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const react_2 = require("next-auth/react");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const dialog_1 = require("@/components/ui/dialog");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const link_1 = __importDefault(require("next/link"));
const INDIAN_STATES = [
    "All States", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
];
function ChildrenPage() {
    var _a, _b, _c, _d, _e, _f, _g;
    const router = (0, navigation_1.useRouter)();
    const searchParams = (0, navigation_1.useSearchParams)();
    const { data: session } = (0, react_2.useSession)();
    const [children, setChildren] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    const [stateFilter, setStateFilter] = (0, react_1.useState)('All States');
    const [genderFilter, setGenderFilter] = (0, react_1.useState)('All');
    const [ageFilter, setAgeFilter] = (0, react_1.useState)('All');
    const [showAssignedOnly, setShowAssignedOnly] = (0, react_1.useState)(((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.role) === 'VOLUNTEER');
    const [deleteDialog, setDeleteDialog] = (0, react_1.useState)({
        isOpen: false,
        child: null
    });
    const [deletingChild, setDeletingChild] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        fetchChildren();
        // Handle success messages
        const message = searchParams === null || searchParams === void 0 ? void 0 : searchParams.get('message');
        if (message === 'child-added') {
            sonner_1.toast.success('Child profile added successfully!');
        }
        else if (message === 'child-updated') {
            sonner_1.toast.success('Child profile updated successfully!');
        }
        else if (message === 'child-deleted') {
            sonner_1.toast.success('Child profile deleted successfully!');
        }
    }, [searchParams]);
    const fetchChildren = () => __awaiter(this, void 0, void 0, function* () {
        var _h;
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm)
                params.append('search', searchTerm);
            if (stateFilter && stateFilter !== 'All States')
                params.append('state', stateFilter);
            if (genderFilter && genderFilter !== 'All')
                params.append('gender', genderFilter);
            if (ageFilter && ageFilter !== 'All') {
                const [min, max] = ageFilter.split('-');
                if (min)
                    params.append('ageMin', min);
                if (max)
                    params.append('ageMax', max);
            }
            // For volunteers, add assignment filtering
            if (((_h = session === null || session === void 0 ? void 0 : session.user) === null || _h === void 0 ? void 0 : _h.role) === 'VOLUNTEER' && showAssignedOnly) {
                params.append('assignedOnly', 'true');
            }
            const response = yield fetch(`/api/children?${params.toString()}`);
            if (response.ok) {
                const data = yield response.json();
                setChildren(data.children);
            }
            else {
                console.error('Failed to fetch children');
                sonner_1.toast.error('Failed to load children profiles');
            }
        }
        catch (error) {
            console.error('Error fetching children:', error);
            sonner_1.toast.error('Something went wrong while loading profiles');
        }
        finally {
            setLoading(false);
        }
    });
    (0, react_1.useEffect)(() => {
        const delayedSearch = setTimeout(() => {
            fetchChildren();
        }, 300); // Debounce search
        return () => clearTimeout(delayedSearch);
    }, [searchTerm, stateFilter, genderFilter, ageFilter, showAssignedOnly]);
    const handleDeleteClick = (child) => {
        setDeleteDialog({
            isOpen: true,
            child
        });
    };
    const handleDeleteConfirm = () => __awaiter(this, void 0, void 0, function* () {
        if (!deleteDialog.child)
            return;
        setDeletingChild(true);
        try {
            const response = yield fetch(`/api/children/${deleteDialog.child.id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setDeleteDialog({ isOpen: false, child: null });
                fetchChildren(); // Refresh the list
                sonner_1.toast.success('Child profile deleted successfully');
            }
            else {
                const result = yield response.json();
                sonner_1.toast.error(result.error || 'Failed to delete child profile');
            }
        }
        catch (error) {
            console.error('Error deleting child:', error);
            sonner_1.toast.error('Something went wrong while deleting the profile');
        }
        finally {
            setDeletingChild(false);
        }
    });
    const getGenderBadgeColor = (gender) => {
        switch (gender) {
            case 'MALE': return 'bg-blue-100 text-blue-800';
            case 'FEMALE': return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'HIGH':
            case 'CRITICAL': return 'bg-red-100 text-red-800';
            case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
            case 'LOW': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const filteredChildren = children;
    if (loading) {
        return (<div className="p-6">
        <div className="flex items-center justify-center h-64">
          <lucide_react_1.Loader2 className="h-8 w-8 animate-spin"/>
        </div>
      </div>);
    }
    return (<div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Children Profiles</h1>
          <p className="text-gray-600">
            {((_b = session === null || session === void 0 ? void 0 : session.user) === null || _b === void 0 ? void 0 : _b.role) === 'ADMIN'
            ? 'Manage and monitor all children in the program'
            : showAssignedOnly
                ? 'Viewing your assigned children only'
                : 'Viewing all children in the program'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {((_c = session === null || session === void 0 ? void 0 : session.user) === null || _c === void 0 ? void 0 : _c.role) === 'VOLUNTEER' && (<div className="flex items-center gap-2 text-sm">
              <span className={!showAssignedOnly ? 'font-medium' : 'text-gray-600'}>
                All Children
              </span>
              <button onClick={() => setShowAssignedOnly(!showAssignedOnly)} className="flex items-center">
                {showAssignedOnly ? (<lucide_react_1.ToggleRight className="h-6 w-6 text-blue-600"/>) : (<lucide_react_1.ToggleLeft className="h-6 w-6 text-gray-400"/>)}
              </button>
              <span className={showAssignedOnly ? 'font-medium' : 'text-gray-600'}>
                My Assigned Only
              </span>
            </div>)}
          {((_d = session === null || session === void 0 ? void 0 : session.user) === null || _d === void 0 ? void 0 : _d.role) === 'ADMIN' && (<button_1.Button onClick={() => router.push('/children/add')} className="flex items-center gap-2">
              <lucide_react_1.Plus className="h-4 w-4"/>
              Add New Child
            </button_1.Button>)}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Users className="h-5 w-5 text-blue-600"/>
              <div>
                <p className="text-2xl font-bold text-blue-600">{children.length}</p>
                <p className="text-sm text-gray-600">Total Children</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <lucide_react_1.Heart className="h-5 w-5 text-green-600"/>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {children.filter(c => c.assignments && c.assignments.length > 0).length}
                </p>
                <p className="text-sm text-gray-600">Assigned</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
        
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-600"/>
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  {children.filter(c => c.concerns && c.concerns.length > 0).length}
                </p>
                <p className="text-sm text-gray-600">With Concerns</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <lucide_react_1.BookOpen className="h-5 w-5 text-purple-600"/>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {children.filter(c => c.sessions && c.sessions.length > 0).length}
                </p>
                <p className="text-sm text-gray-600">With Sessions</p>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Search and Filters */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Filter className="h-5 w-5"/>
            Search & Filters
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
              <input_1.Input placeholder="Search children..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
            </div>
            
            <select_1.Select value={stateFilter} onValueChange={setStateFilter}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Filter by state"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {INDIAN_STATES.map(state => (<select_1.SelectItem key={state} value={state}>{state}</select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select value={genderFilter} onValueChange={setGenderFilter}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Filter by gender"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="All">All Genders</select_1.SelectItem>
                <select_1.SelectItem value="MALE">Male</select_1.SelectItem>
                <select_1.SelectItem value="FEMALE">Female</select_1.SelectItem>
                <select_1.SelectItem value="OTHER">Other</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>

            <select_1.Select value={ageFilter} onValueChange={setAgeFilter}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Filter by age"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="All">All Ages</select_1.SelectItem>
                <select_1.SelectItem value="5-10">5-10 years</select_1.SelectItem>
                <select_1.SelectItem value="11-15">11-15 years</select_1.SelectItem>
                <select_1.SelectItem value="16-18">16-18 years</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Children List */}
      <div className="space-y-4">
        {filteredChildren.length === 0 ? (<card_1.Card>
            <card_1.CardContent className="p-12 text-center">
              <lucide_react_1.Users className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No children found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || stateFilter !== 'All States' || genderFilter !== 'All' || ageFilter !== 'All'
                ? 'Try adjusting your search filters'
                : ((_e = session === null || session === void 0 ? void 0 : session.user) === null || _e === void 0 ? void 0 : _e.role) === 'ADMIN'
                    ? 'Get started by adding your first child profile'
                    : 'No children have been assigned to you yet'}
              </p>
              {((_f = session === null || session === void 0 ? void 0 : session.user) === null || _f === void 0 ? void 0 : _f.role) === 'ADMIN' && (<button_1.Button onClick={() => router.push('/children/add')}>
                  <lucide_react_1.Plus className="mr-2 h-4 w-4"/>
                  Add First Child
                </button_1.Button>)}
            </card_1.CardContent>
          </card_1.Card>) : (filteredChildren.map((child) => {
            var _a;
            return (<card_1.Card key={child.id} className="hover:shadow-md transition-shadow">
              <card_1.CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <lucide_react_1.User className="h-6 w-6 text-blue-600"/>
                    </div>
                    <div>
                      <card_1.CardTitle className="text-lg">{child.name}</card_1.CardTitle>
                      <card_1.CardDescription className="flex items-center space-x-4">
                        <span>{child.age} years old</span>
                        <badge_1.Badge className={getGenderBadgeColor(child.gender)}>
                          {child.gender}
                        </badge_1.Badge>
                        <span className="flex items-center">
                          <lucide_react_1.MapPin className="h-3 w-3 mr-1"/>
                          {child.district}, {child.state}
                        </span>
                      </card_1.CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <link_1.default href={`/children/${child.id}`}>
                      <button_1.Button variant="outline" size="sm">
                        View Details
                        <lucide_react_1.ChevronRight className="ml-1 h-4 w-4"/>
                      </button_1.Button>
                    </link_1.default>
                    {((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.role) === 'ADMIN' && (<>
                        <button_1.Button variant="outline" size="sm" onClick={() => router.push(`/children/${child.id}/edit`)}>
                          <lucide_react_1.Edit className="h-4 w-4"/>
                        </button_1.Button>
                        <button_1.Button variant="outline" size="sm" onClick={() => handleDeleteClick(child)} className="text-red-600 hover:text-red-700">
                          <lucide_react_1.Trash2 className="h-4 w-4"/>
                        </button_1.Button>
                      </>)}
                  </div>
                </div>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-4">
                {/* Assigned Volunteer */}
                {child.assignments && child.assignments.length > 0 && (<div className="flex items-center space-x-2 text-sm">
                    <lucide_react_1.Heart className="h-4 w-4 text-green-600"/>
                    <span>Assigned to: <strong>{child.assignments[0].volunteer.name}</strong></span>
                    {child.assignments[0].volunteer.specialization && (<badge_1.Badge variant="outline" className="text-xs">
                        {child.assignments[0].volunteer.specialization}
                      </badge_1.Badge>)}
                  </div>)}

                {/* School Level */}
                {child.schoolLevel && (<div className="flex items-center space-x-2 text-sm">
                    <lucide_react_1.BookOpen className="h-4 w-4 text-blue-600"/>
                    <span>School Level: <strong>{child.schoolLevel}</strong></span>
                  </div>)}

                {/* Interests */}
                {child.interests && child.interests.length > 0 && (<div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Interests:</span>
                    <div className="flex flex-wrap gap-1">
                      {child.interests.slice(0, 5).map((interest) => (<badge_1.Badge key={interest} variant="outline" className="text-xs">
                          {interest}
                        </badge_1.Badge>))}
                      {child.interests.length > 5 && (<badge_1.Badge variant="outline" className="text-xs">
                          +{child.interests.length - 5} more
                        </badge_1.Badge>)}
                    </div>
                  </div>)}

                {/* Challenges */}
                {child.challenges && child.challenges.length > 0 && (<div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Challenges:</span>
                    <div className="flex flex-wrap gap-1">
                      {child.challenges.slice(0, 3).map((challenge) => (<badge_1.Badge key={challenge} variant="destructive" className="text-xs">
                          {challenge}
                        </badge_1.Badge>))}
                      {child.challenges.length > 3 && (<badge_1.Badge variant="destructive" className="text-xs">
                          +{child.challenges.length - 3} more
                        </badge_1.Badge>)}
                    </div>
                  </div>)}

                {/* Active Concerns */}
                {child.concerns && child.concerns.length > 0 && (<div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">Active Concerns:</span>
                    <div className="flex flex-wrap gap-1">
                      {child.concerns.slice(0, 2).map((concern) => (<badge_1.Badge key={concern.id} className={getSeverityColor(concern.severity)}>
                          {concern.title}
                        </badge_1.Badge>))}
                      {child.concerns.length > 2 && (<badge_1.Badge className="bg-gray-100 text-gray-800">
                          +{child.concerns.length - 2} more
                        </badge_1.Badge>)}
                    </div>
                  </div>)}

                {/* Recent Session */}
                {child.sessions && child.sessions.length > 0 && (<div className="text-sm text-gray-600">
                    <lucide_react_1.Calendar className="inline h-3 w-3 mr-1"/>
                    Last session: {child.sessions[0].scheduledAt ? new Date(child.sessions[0].scheduledAt).toLocaleDateString() : 'Date not set'}
                    {child.sessions[0].volunteer && ` with ${child.sessions[0].volunteer.name}`}
                  </div>)}
              </card_1.CardContent>
            </card_1.Card>);
        }))}
      </div>

      {/* Delete Confirmation Dialog */}
      <dialog_1.Dialog open={deleteDialog.isOpen} onOpenChange={(open) => {
            if (!open) {
                setDeleteDialog({ isOpen: false, child: null });
            }
        }}>
        <dialog_1.DialogContent>
          <dialog_1.DialogHeader>
            <dialog_1.DialogTitle>Delete Child Profile</dialog_1.DialogTitle>
            <dialog_1.DialogDescription>
              Are you sure you want to delete {(_g = deleteDialog.child) === null || _g === void 0 ? void 0 : _g.name}'s profile? 
              This action cannot be undone and will remove all associated data including sessions, concerns, and assignments.
            </dialog_1.DialogDescription>
          </dialog_1.DialogHeader>
          <dialog_1.DialogFooter>
            <button_1.Button variant="outline" onClick={() => setDeleteDialog({ isOpen: false, child: null })} disabled={deletingChild}>
              Cancel
            </button_1.Button>
            <button_1.Button variant="destructive" onClick={handleDeleteConfirm} disabled={deletingChild}>
              {deletingChild ? (<>
                  <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  Deleting...
                </>) : (<>
                  <lucide_react_1.Trash2 className="mr-2 h-4 w-4"/>
                  Delete Profile
                </>)}
            </button_1.Button>
          </dialog_1.DialogFooter>
        </dialog_1.DialogContent>
      </dialog_1.Dialog>
    </div>);
}
exports.default = ChildrenPage;
