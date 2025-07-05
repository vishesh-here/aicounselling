"use strict";
"use client";
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
exports.AssignmentManager = void 0;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const input_1 = require("@/components/ui/input");
const select_1 = require("@/components/ui/select");
const dialog_1 = require("@/components/ui/dialog");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
function AssignmentManager({ children, volunteers, assignments }) {
    const [searchTerm, setSearchTerm] = (0, react_1.useState)("");
    const [selectedState, setSelectedState] = (0, react_1.useState)("all");
    const [assignmentFilter, setAssignmentFilter] = (0, react_1.useState)("all");
    const [isAssigning, setIsAssigning] = (0, react_1.useState)(false);
    const [selectedChild, setSelectedChild] = (0, react_1.useState)(null);
    // Filter children based on search and filters
    const filteredChildren = children.filter(child => {
        const matchesSearch = child.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesState = selectedState === "all" || child.state === selectedState;
        const matchesAssignment = assignmentFilter === "all" ||
            (assignmentFilter === "assigned" && child.assignments.length > 0) ||
            (assignmentFilter === "unassigned" && child.assignments.length === 0);
        return matchesSearch && matchesState && matchesAssignment;
    });
    // Get unique states for filter
    const uniqueStates = [...new Set(children.map(child => child.state))].sort();
    // Assign volunteer to child
    const assignVolunteer = (child_id, volunteerId) => __awaiter(this, void 0, void 0, function* () {
        setIsAssigning(true);
        try {
            const response = yield fetch("/api/admin/assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "assign",
                    child_id,
                    volunteerId
                })
            });
            if (response.ok) {
                sonner_1.toast.success("Assignment created successfully!");
                window.location.reload();
            }
            else {
                const error = yield response.json();
                sonner_1.toast.error(error.message || "Failed to create assignment");
            }
        }
        catch (error) {
            console.error("Assignment error:", error);
            sonner_1.toast.error("Failed to create assignment");
        }
        finally {
            setIsAssigning(false);
        }
    });
    // Remove assignment
    const removeAssignment = (assignmentId) => __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch("/api/admin/assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "remove",
                    assignmentId
                })
            });
            if (response.ok) {
                sonner_1.toast.success("Assignment removed successfully!");
                window.location.reload();
            }
            else {
                const error = yield response.json();
                sonner_1.toast.error(error.message || "Failed to remove assignment");
            }
        }
        catch (error) {
            console.error("Remove assignment error:", error);
            sonner_1.toast.error("Failed to remove assignment");
        }
    });
    // Bulk assign volunteers based on state matching
    const bulkAssignByState = () => __awaiter(this, void 0, void 0, function* () {
        const unassignedChildren = children.filter(child => child.assignments.length === 0);
        const assignmentPromises = unassignedChildren.map(child => {
            const matchingVolunteer = volunteers.find(volunteer => volunteer.state === child.state &&
                !assignments.some(assignment => assignment.volunteerId === volunteer.id && assignment.isActive));
            if (matchingVolunteer) {
                return assignVolunteer(child.id, matchingVolunteer.id);
            }
            return Promise.resolve();
        });
        try {
            yield Promise.all(assignmentPromises);
            sonner_1.toast.success("Bulk assignment completed!");
        }
        catch (error) {
            sonner_1.toast.error("Some assignments failed");
        }
    });
    return (<div className="space-y-6">
      {/* Filters and Search */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Filter className="h-5 w-5"/>
            Filters & Search
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <lucide_react_1.Search className="h-4 w-4 absolute left-3 top-3 text-gray-400"/>
              <input_1.Input placeholder="Search children..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10"/>
            </div>
            <select_1.Select value={selectedState} onValueChange={setSelectedState}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Filter by state"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">All States</select_1.SelectItem>
                {uniqueStates.map((state) => (<select_1.SelectItem key={state} value={state}>
                    {state}
                  </select_1.SelectItem>))}
              </select_1.SelectContent>
            </select_1.Select>
            <select_1.Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
              <select_1.SelectTrigger>
                <select_1.SelectValue placeholder="Assignment status"/>
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="all">All Children</select_1.SelectItem>
                <select_1.SelectItem value="assigned">Assigned Only</select_1.SelectItem>
                <select_1.SelectItem value="unassigned">Unassigned Only</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
            <button_1.Button onClick={bulkAssignByState} variant="outline">
              <lucide_react_1.Users className="h-4 w-4 mr-2"/>
              Bulk Assign by State
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      <tabs_1.Tabs defaultValue="children" className="space-y-6">
        <tabs_1.TabsList className="grid w-full grid-cols-2">
          <tabs_1.TabsTrigger value="children" className="flex items-center gap-2">
            <lucide_react_1.User className="h-4 w-4"/>
            Children Management
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="assignments" className="flex items-center gap-2">
            <lucide_react_1.Users className="h-4 w-4"/>
            Current Assignments
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="children">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChildren.map((child) => (<card_1.Card key={child.id} className="relative">
                <card_1.CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <card_1.CardTitle className="text-lg">{child.name}</card_1.CardTitle>
                      <p className="text-sm text-gray-600">
                        {child.age} years old • {child.state}
                      </p>
                    </div>
                    {child.assignments.length > 0 ? (<badge_1.Badge className="bg-green-100 text-green-800">
                        <lucide_react_1.CheckCircle className="h-3 w-3 mr-1"/>
                        Assigned
                      </badge_1.Badge>) : (<badge_1.Badge variant="outline" className="text-red-600 border-red-300">
                        <lucide_react_1.AlertCircle className="h-3 w-3 mr-1"/>
                        Unassigned
                      </badge_1.Badge>)}
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent className="pt-0">
                  {child.assignments.length > 0 ? (<div className="space-y-2">
                      {child.assignments.map((assignment) => (<div key={assignment.id} className="p-2 bg-gray-50 rounded border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{assignment.volunteer.name}</p>
                              <p className="text-xs text-gray-600">{assignment.volunteer.email}</p>
                              {assignment.volunteer.specialization && (<badge_1.Badge variant="secondary" className="text-xs mt-1">
                                  {assignment.volunteer.specialization}
                                </badge_1.Badge>)}
                            </div>
                            <button_1.Button size="sm" variant="outline" onClick={() => removeAssignment(assignment.id)} className="text-red-600 hover:text-red-700">
                              <lucide_react_1.X className="h-3 w-3"/>
                            </button_1.Button>
                          </div>
                        </div>))}
                    </div>) : (<div className="space-y-2">
                      <p className="text-sm text-gray-600">No assigned volunteer</p>
                      {child.concerns.length > 0 && (<div>
                          <p className="text-xs font-medium text-orange-600 mb-1">
                            Active Concerns: {child.concerns.length}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {child.concerns.slice(0, 2).map((concern) => (<badge_1.Badge key={concern.id} variant="outline" className="text-xs">
                                {concern.category}
                              </badge_1.Badge>))}
                            {child.concerns.length > 2 && (<badge_1.Badge variant="outline" className="text-xs">
                                +{child.concerns.length - 2} more
                              </badge_1.Badge>)}
                          </div>
                        </div>)}
                      <dialog_1.Dialog>
                        <dialog_1.DialogTrigger asChild>
                          <button_1.Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setSelectedChild(child)}>
                            <lucide_react_1.UserPlus className="h-3 w-3 mr-1"/>
                            Assign Volunteer
                          </button_1.Button>
                        </dialog_1.DialogTrigger>
                        <dialog_1.DialogContent>
                          <dialog_1.DialogHeader>
                            <dialog_1.DialogTitle>Assign Volunteer to {child.name}</dialog_1.DialogTitle>
                          </dialog_1.DialogHeader>
                          <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded">
                              <p className="font-medium">{child.name}</p>
                              <p className="text-sm text-gray-600">{child.age} years old • {child.state}</p>
                              {child.concerns.length > 0 && (<p className="text-sm text-orange-600 mt-1">
                                  {child.concerns.length} active concern(s)
                                </p>)}
                            </div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {volunteers.map((volunteer) => (<div key={volunteer.id} className="p-3 border rounded hover:bg-gray-50">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">{volunteer.name}</p>
                                      <p className="text-sm text-gray-600">{volunteer.email}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500">
                                          <lucide_react_1.MapPin className="h-3 w-3 inline mr-1"/>
                                          {volunteer.state}
                                        </span>
                                        {volunteer.specialization && (<badge_1.Badge variant="secondary" className="text-xs">
                                            {volunteer.specialization}
                                          </badge_1.Badge>)}
                                      </div>
                                    </div>
                                    <button_1.Button size="sm" onClick={() => assignVolunteer(child.id, volunteer.id)} disabled={isAssigning}>
                                      Assign
                                    </button_1.Button>
                                  </div>
                                </div>))}
                            </div>
                          </div>
                        </dialog_1.DialogContent>
                      </dialog_1.Dialog>
                    </div>)}
                </card_1.CardContent>
              </card_1.Card>))}
          </div>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="assignments">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Current Assignments Overview</card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => (<div key={assignment.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{assignment.child.name}</p>
                          <p className="text-sm text-gray-600">
                            {assignment.child.age} years old • {assignment.child.state}
                          </p>
                        </div>
                        <div className="text-gray-400">→</div>
                        <div>
                          <p className="font-medium">{assignment.volunteer.name}</p>
                          <p className="text-sm text-gray-600">{assignment.volunteer.email}</p>
                          {assignment.volunteer.specialization && (<badge_1.Badge variant="secondary" className="text-xs mt-1">
                              {assignment.volunteer.specialization}
                            </badge_1.Badge>)}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <badge_1.Badge variant="outline">
                          {new Date(assignment.assignedAt).toLocaleDateString()}
                        </badge_1.Badge>
                        <button_1.Button size="sm" variant="outline" onClick={() => removeAssignment(assignment.id)} className="text-red-600 hover:text-red-700">
                          <lucide_react_1.X className="h-3 w-3 mr-1"/>
                          Remove
                        </button_1.Button>
                      </div>
                    </div>
                  </div>))}
                {assignments.length === 0 && (<div className="text-center py-8 text-gray-500">
                    <lucide_react_1.Users className="h-8 w-8 mx-auto mb-2 text-gray-400"/>
                    <p>No active assignments found</p>
                  </div>)}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>);
}
exports.AssignmentManager = AssignmentManager;
