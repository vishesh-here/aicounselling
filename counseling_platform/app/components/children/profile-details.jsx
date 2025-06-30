"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileDetails = void 0;
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const navigation_1 = require("next/navigation");
const date_fns_1 = require("date-fns");
function ProfileDetails({ child, userRole }) {
    var _a, _b, _c, _d, _e;
    const router = (0, navigation_1.useRouter)();
    const openAiMentor = () => {
        router.push(`/ai-mentor/${child.id}`);
    };
    const getGenderIcon = (gender) => {
        return <lucide_react_1.User className="h-4 w-4"/>;
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case "HIGH": return "bg-red-100 text-red-800";
            case "MEDIUM": return "bg-yellow-100 text-yellow-800";
            case "LOW": return "bg-green-100 text-green-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "RESOLVED": return "bg-green-100 text-green-800";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
            case "OPEN": return "bg-yellow-100 text-yellow-800";
            case "CLOSED": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };
    return (<div className="space-y-6">
      {/* Basic Information */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.User className="h-5 w-5"/>
              Basic Information
            </card_1.CardTitle>
            <div className="flex items-center gap-2">
              {(userRole === "VOLUNTEER" || userRole === "ADMIN") && (<button_1.Button size="sm" onClick={openAiMentor} className="bg-purple-600 hover:bg-purple-700">
                  <lucide_react_1.Bot className="h-4 w-4 mr-2"/>
                  AI Mentor
                  <lucide_react_1.ExternalLink className="h-3 w-3 ml-1"/>
                </button_1.Button>)}
              {userRole === "ADMIN" && (<button_1.Button size="sm" variant="outline">
                  <lucide_react_1.Edit className="h-4 w-4 mr-2"/>
                  Edit Profile
                </button_1.Button>)}
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-gray-900 font-medium">{child.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Age</label>
                <p className="text-gray-900">{child.age} years old</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <div className="flex items-center gap-2">
                  {getGenderIcon(child.gender)}
                  <span className="text-gray-900 capitalize">{child.gender.toLowerCase()}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Preferred Language</label>
                <p className="text-gray-900">{child.language}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <div className="flex items-center gap-1">
                  <lucide_react_1.MapPin className="h-4 w-4 text-gray-500"/>
                  <span className="text-gray-900">{child.state}</span>
                  {child.district && (<>
                      <span className="text-gray-500">, </span>
                      <span className="text-gray-900">{child.district}</span>
                    </>)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">School Level</label>
                <div className="flex items-center gap-2">
                  <lucide_react_1.GraduationCap className="h-4 w-4 text-gray-500"/>
                  <span className="text-gray-900">{child.schoolLevel || "Not specified"}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Profile Created</label>
                <div className="flex items-center gap-1">
                  <lucide_react_1.Calendar className="h-4 w-4 text-gray-500"/>
                  <span className="text-gray-900">
                    {(0, date_fns_1.format)(new Date(child.createdAt), "PPP")}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <badge_1.Badge variant={child.isActive ? "default" : "secondary"}>
                  {child.isActive ? "Active" : "Inactive"}
                </badge_1.Badge>
              </div>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Background Information */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Heart className="h-5 w-5"/>
            Background & Family
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Family Background</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {child.background || "No background information available"}
              </p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Interests & Hobbies */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Star className="h-5 w-5"/>
            Interests & Hobbies
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          {((_a = child.interests) === null || _a === void 0 ? void 0 : _a.length) > 0 ? (<div className="flex flex-wrap gap-2">
              {child.interests.map((interest, index) => (<badge_1.Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {interest}
                </badge_1.Badge>))}
            </div>) : (<p className="text-gray-500 italic">No interests listed</p>)}
        </card_1.CardContent>
      </card_1.Card>

      {/* Challenges & Concerns */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.AlertCircle className="h-5 w-5"/>
            Challenges & Areas of Focus
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {/* Personal Challenges */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Personal Challenges</label>
              {((_b = child.challenges) === null || _b === void 0 ? void 0 : _b.length) > 0 ? (<div className="flex flex-wrap gap-2">
                  {child.challenges.map((challenge, index) => (<badge_1.Badge key={index} variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                      {challenge}
                    </badge_1.Badge>))}
                </div>) : (<p className="text-gray-500 italic">No personal challenges listed</p>)}
            </div>

            {/* Documented Concerns */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Documented Concerns</label>
              {((_c = child.concerns) === null || _c === void 0 ? void 0 : _c.length) > 0 ? (<div className="space-y-2">
                  {child.concerns.map((concern) => (<div key={concern.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{concern.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{concern.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <badge_1.Badge variant="outline" className="text-xs">
                              {concern.category}
                            </badge_1.Badge>
                            <badge_1.Badge className={`text-xs ${getSeverityColor(concern.severity)}`}>
                              {concern.severity}
                            </badge_1.Badge>
                            <badge_1.Badge className={`text-xs ${getStatusColor(concern.status)}`}>
                              {concern.status}
                            </badge_1.Badge>
                          </div>
                        </div>
                      </div>
                    </div>))}
                </div>) : (<p className="text-gray-500 italic">No documented concerns</p>)}
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Assignment Information */}
      {((_d = child.assignments) === null || _d === void 0 ? void 0 : _d.length) > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.BookOpen className="h-5 w-5"/>
              Assignment Information
            </card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="space-y-3">
              {child.assignments.map((assignment) => {
                var _a, _b;
                return (<div key={assignment.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Assigned to: {((_a = assignment.volunteer) === null || _a === void 0 ? void 0 : _a.name) || "Unknown"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Specialization: {((_b = assignment.volunteer) === null || _b === void 0 ? void 0 : _b.specialization) || "General"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Assigned on: {(0, date_fns_1.format)(new Date(assignment.assignedAt), "PPP")}
                      </p>
                      {assignment.notes && (<p className="text-sm text-gray-700 mt-2 italic">
                          "{assignment.notes}"
                        </p>)}
                    </div>
                    <badge_1.Badge variant={assignment.isActive ? "default" : "secondary"}>
                      {assignment.isActive ? "Active" : "Inactive"}
                    </badge_1.Badge>
                  </div>
                </div>);
            })}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}

      {/* Tags */}
      {((_e = child.tags) === null || _e === void 0 ? void 0 : _e.length) > 0 && (<card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Tags</card_1.CardTitle>
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="flex flex-wrap gap-2">
              {child.tags.map((tag) => (<badge_1.Badge key={tag.id} variant="outline" style={{
                    backgroundColor: tag.color ? `${tag.color}15` : undefined,
                    borderColor: tag.color || undefined,
                    color: tag.color || undefined
                }}>
                  {tag.name}
                </badge_1.Badge>))}
            </div>
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
}
exports.ProfileDetails = ProfileDetails;
