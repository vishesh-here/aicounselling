"use strict";
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
exports.dynamic = void 0;
const next_auth_1 = require("next-auth");
const navigation_1 = require("next/navigation");
const db_1 = require("@/lib/db");
const auth_config_1 = require("@/lib/auth-config");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const add_resource_dialog_1 = require("@/components/admin/add-resource-dialog");
const date_fns_1 = require("date-fns");
exports.dynamic = "force-dynamic";
function getKnowledgeBaseData() {
    return __awaiter(this, void 0, void 0, function* () {
        const [knowledgeBase, culturalStories, totalUsers] = yield Promise.all([
            db_1.prisma.knowledgeBase.findMany({
                include: {
                    createdBy: {
                        select: { name: true }
                    },
                    tags: true
                },
                orderBy: { createdAt: "desc" }
            }),
            db_1.prisma.culturalStory.findMany({
                include: {
                    createdBy: {
                        select: { name: true }
                    }
                },
                orderBy: { createdAt: "desc" }
            }),
            db_1.prisma.user.count({ where: { role: "VOLUNTEER" } })
        ]);
        return { knowledgeBase, culturalStories, totalUsers };
    });
}
function ManageKnowledgeBasePage() {
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
        if (!(session === null || session === void 0 ? void 0 : session.user) || session.user.role !== "ADMIN") {
            (0, navigation_1.redirect)("/dashboard");
        }
        const { knowledgeBase, culturalStories, totalUsers } = yield getKnowledgeBaseData();
        const getCategoryColor = (category) => {
            switch (category) {
                case "CAREER_GUIDANCE": return "bg-purple-100 text-purple-800";
                case "PSYCHOLOGICAL_COUNSELING": return "bg-blue-100 text-blue-800";
                case "CULTURAL_WISDOM": return "bg-orange-100 text-orange-800";
                case "EDUCATIONAL_RESOURCES": return "bg-green-100 text-green-800";
                case "LIFE_SKILLS": return "bg-yellow-100 text-yellow-800";
                default: return "bg-gray-100 text-gray-800";
            }
        };
        const getSourceColor = (source) => {
            switch (source) {
                case "RAMAYANA": return "bg-red-100 text-red-800";
                case "MAHABHARATA": return "bg-blue-100 text-blue-800";
                case "BHAGAVAD_GITA": return "bg-purple-100 text-purple-800";
                case "PANCHTANTRA": return "bg-green-100 text-green-800";
                case "JATAKA_TALES": return "bg-yellow-100 text-yellow-800";
                default: return "bg-gray-100 text-gray-800";
            }
        };
        return (<div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Knowledge Base</h1>
          <p className="text-gray-600 mt-1">
            Add, edit, and organize counseling resources and cultural wisdom stories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <add_resource_dialog_1.AddResourceDialog />
          <button_1.Button variant="outline">
            <lucide_react_1.Upload className="h-4 w-4 mr-2"/>
            Bulk Upload
          </button_1.Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Resources</p>
                <p className="text-2xl font-bold text-gray-900">
                  {knowledgeBase.length + culturalStories.length}
                </p>
              </div>
              <lucide_react_1.BookOpen className="h-8 w-8 text-blue-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Knowledge Base</p>
                <p className="text-2xl font-bold text-gray-900">{knowledgeBase.length}</p>
              </div>
              <lucide_react_1.FileText className="h-8 w-8 text-purple-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cultural Stories</p>
                <p className="text-2xl font-bold text-gray-900">{culturalStories.length}</p>
              </div>
              <lucide_react_1.Heart className="h-8 w-8 text-orange-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
              </div>
              <lucide_react_1.Users className="h-8 w-8 text-green-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Cultural Stories Management */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Heart className="h-5 w-5 text-orange-600"/>
              Cultural Wisdom Stories ({culturalStories.length})
            </card_1.CardTitle>
            <button_1.Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
              Add Story
            </button_1.Button>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-3">
            {culturalStories.map((story) => {
                var _a, _b, _c;
                return (<div key={story.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{story.title}</h3>
                      <badge_1.Badge className={`text-xs ${getSourceColor(story.source)}`}>
                        {story.source.replace('_', ' ')}
                      </badge_1.Badge>
                      <badge_1.Badge variant={story.isActive ? "default" : "secondary"} className="text-xs">
                        {story.isActive ? "Active" : "Inactive"}
                      </badge_1.Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{story.summary}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created by: {(_a = story.createdBy) === null || _a === void 0 ? void 0 : _a.name}</span>
                      <span>•</span>
                      <span>{(0, date_fns_1.formatDistanceToNow)(new Date(story.createdAt))} ago</span>
                      <span>•</span>
                      <span>{((_b = story.themes) === null || _b === void 0 ? void 0 : _b.length) || 0} themes</span>
                    </div>

                    {((_c = story.themes) === null || _c === void 0 ? void 0 : _c.length) > 0 && (<div className="flex flex-wrap gap-1 mt-2">
                        {story.themes.slice(0, 4).map((theme, index) => (<badge_1.Badge key={index} variant="outline" className="text-xs">
                            {theme}
                          </badge_1.Badge>))}
                        {story.themes.length > 4 && (<badge_1.Badge variant="outline" className="text-xs">
                            +{story.themes.length - 4}
                          </badge_1.Badge>)}
                      </div>)}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button_1.Button size="sm" variant="outline">
                      <lucide_react_1.Edit className="h-3 w-3"/>
                    </button_1.Button>
                    <button_1.Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <lucide_react_1.Trash2 className="h-3 w-3"/>
                    </button_1.Button>
                  </div>
                </div>
              </div>);
            })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Knowledge Base Resources Management */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.BookOpen className="h-5 w-5 text-blue-600"/>
              Knowledge Base Resources ({knowledgeBase.length})
            </card_1.CardTitle>
            <button_1.Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
              Add Resource
            </button_1.Button>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-3">
            {knowledgeBase.map((resource) => {
                var _a, _b, _c;
                return (<div key={resource.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{resource.title}</h3>
                      <badge_1.Badge className={`text-xs ${getCategoryColor(resource.category)}`}>
                        {resource.category.replace('_', ' ')}
                      </badge_1.Badge>
                      {resource.subCategory && (<badge_1.Badge variant="outline" className="text-xs">
                          {resource.subCategory}
                        </badge_1.Badge>)}
                      <badge_1.Badge variant={resource.isActive ? "default" : "secondary"} className="text-xs">
                        {resource.isActive ? "Active" : "Inactive"}
                      </badge_1.Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {resource.summary || "No summary available"}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created by: {(_a = resource.createdBy) === null || _a === void 0 ? void 0 : _a.name}</span>
                      <span>•</span>
                      <span>{(0, date_fns_1.formatDistanceToNow)(new Date(resource.createdAt))} ago</span>
                      <span>•</span>
                      <span>{((_b = resource.tags) === null || _b === void 0 ? void 0 : _b.length) || 0} tags</span>
                      {resource.fileType && (<>
                          <span>•</span>
                          <span className="uppercase">{resource.fileType}</span>
                        </>)}
                    </div>

                    {((_c = resource.tags) === null || _c === void 0 ? void 0 : _c.length) > 0 && (<div className="flex flex-wrap gap-1 mt-2">
                        {resource.tags.slice(0, 4).map((tag) => (<badge_1.Badge key={tag.id} variant="outline" className="text-xs" style={{
                                backgroundColor: tag.color ? `${tag.color}15` : undefined,
                                borderColor: tag.color || undefined,
                                color: tag.color || undefined
                            }}>
                            {tag.name}
                          </badge_1.Badge>))}
                        {resource.tags.length > 4 && (<badge_1.Badge variant="outline" className="text-xs">
                            +{resource.tags.length - 4}
                          </badge_1.Badge>)}
                      </div>)}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button_1.Button size="sm" variant="outline">
                      <lucide_react_1.Edit className="h-3 w-3"/>
                    </button_1.Button>
                    <button_1.Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <lucide_react_1.Trash2 className="h-3 w-3"/>
                    </button_1.Button>
                  </div>
                </div>
              </div>);
            })}
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Quick Actions */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Settings className="h-5 w-5"/>
            Quick Actions
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button_1.Button variant="outline" className="h-20 flex-col">
              <lucide_react_1.Upload className="h-8 w-8 mb-2"/>
              <span>Bulk Import</span>
            </button_1.Button>
            
            <button_1.Button variant="outline" className="h-20 flex-col">
              <lucide_react_1.FileText className="h-8 w-8 mb-2"/>
              <span>Export Data</span>
            </button_1.Button>
            
            <button_1.Button variant="outline" className="h-20 flex-col">
              <lucide_react_1.Settings className="h-8 w-8 mb-2"/>
              <span>Manage Tags</span>
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
    });
}
exports.default = ManageKnowledgeBasePage;
