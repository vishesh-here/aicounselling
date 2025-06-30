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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamic = void 0;
const next_auth_1 = require("next-auth");
const db_1 = require("@/lib/db");
const auth_config_1 = require("@/lib/auth-config");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const link_1 = __importDefault(require("next/link"));
const date_fns_1 = require("date-fns");
const story_details_dialog_1 = require("@/components/knowledge-base/story-details-dialog");
const resource_details_dialog_1 = require("@/components/knowledge-base/resource-details-dialog");
exports.dynamic = "force-dynamic";
function getKnowledgeBaseData() {
    return __awaiter(this, void 0, void 0, function* () {
        const [knowledgeBase, culturalStories] = yield Promise.all([
            db_1.prisma.knowledgeBase.findMany({
                where: { isActive: true },
                include: {
                    createdBy: {
                        select: { name: true }
                    },
                    tags: true
                },
                orderBy: { createdAt: "desc" }
            }),
            db_1.prisma.culturalStory.findMany({
                where: { isActive: true },
                include: {
                    createdBy: {
                        select: { name: true }
                    }
                },
                orderBy: { createdAt: "desc" }
            })
        ]);
        return { knowledgeBase, culturalStories };
    });
}
function KnowledgeBasePage() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const session = yield (0, next_auth_1.getServerSession)(auth_config_1.authOptions);
        const userRole = ((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.role) || "VOLUNTEER";
        const { knowledgeBase, culturalStories } = yield getKnowledgeBaseData();
        const getCategoryIcon = (category) => {
            switch (category) {
                case "CAREER_GUIDANCE": return <lucide_react_1.Target className="h-4 w-4"/>;
                case "PSYCHOLOGICAL_COUNSELING": return <lucide_react_1.Brain className="h-4 w-4"/>;
                case "CULTURAL_WISDOM": return <lucide_react_1.Heart className="h-4 w-4"/>;
                case "EDUCATIONAL_RESOURCES": return <lucide_react_1.BookOpen className="h-4 w-4"/>;
                case "LIFE_SKILLS": return <lucide_react_1.Star className="h-4 w-4"/>;
                default: return <lucide_react_1.FileText className="h-4 w-4"/>;
            }
        };
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
        const getSourceIcon = (source) => {
            return <lucide_react_1.BookOpen className="h-4 w-4"/>;
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
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600 mt-1">
            Access counseling resources, cultural wisdom stories, and guidance materials
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-blue-600">
            <lucide_react_1.BookOpen className="h-5 w-5"/>
            <span className="font-medium">
              {knowledgeBase.length + culturalStories.length} resources
            </span>
          </div>
          {userRole === "ADMIN" && (<link_1.default href="/admin/manage-kb">
              <button_1.Button className="bg-blue-600 hover:bg-blue-700">
                <lucide_react_1.BookOpen className="h-4 w-4 mr-2"/>
                Manage KB
              </button_1.Button>
            </link_1.default>)}
        </div>
      </div>

      {/* Search and Filters */}
      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                <input_1.Input placeholder="Search knowledge base, stories, or topics..." className="pl-10"/>
              </div>
            </div>
            <div className="flex gap-2">
              <button_1.Button variant="outline" size="sm">
                <lucide_react_1.Filter className="h-4 w-4 mr-2"/>
                All Categories
              </button_1.Button>
              <button_1.Button variant="outline" size="sm">Cultural Stories</button_1.Button>
              <button_1.Button variant="outline" size="sm">Career Guidance</button_1.Button>
              <button_1.Button variant="outline" size="sm">Psychology</button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Quick Stats */}
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
                <p className="text-sm text-gray-600">Guidance Materials</p>
                <p className="text-2xl font-bold text-gray-900">
                  {knowledgeBase.filter(kb => kb.category === "CAREER_GUIDANCE").length}
                </p>
              </div>
              <lucide_react_1.Target className="h-8 w-8 text-purple-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Psychology Resources</p>
                <p className="text-2xl font-bold text-gray-900">
                  {knowledgeBase.filter(kb => kb.category === "PSYCHOLOGICAL_COUNSELING").length}
                </p>
              </div>
              <lucide_react_1.Brain className="h-8 w-8 text-green-600"/>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Cultural Stories Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <lucide_react_1.Heart className="h-5 w-5 text-orange-600"/>
            Cultural Wisdom Stories
          </h2>
          <span className="text-sm text-gray-600">{culturalStories.length} stories</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {culturalStories.slice(0, 6).map((story) => {
                var _a, _b, _c;
                return (<card_1.Card key={story.id} className="card-hover">
              <card_1.CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <card_1.CardTitle className="text-lg leading-tight">{story.title}</card_1.CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <badge_1.Badge className={`text-xs ${getSourceColor(story.source)}`}>
                        {story.source.replace('_', ' ')}
                      </badge_1.Badge>
                    </div>
                  </div>
                </div>
              </card_1.CardHeader>
              
              <card_1.CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">{story.summary}</p>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-900 mb-1">Key Themes</h4>
                  <div className="flex flex-wrap gap-1">
                    {(_a = story.themes) === null || _a === void 0 ? void 0 : _a.slice(0, 3).map((theme, index) => (<badge_1.Badge key={index} variant="outline" className="text-xs">
                        {theme}
                      </badge_1.Badge>))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-900 mb-1">Applicable For</h4>
                  <div className="flex flex-wrap gap-1">
                    {(_b = story.applicableFor) === null || _b === void 0 ? void 0 : _b.slice(0, 2).map((use, index) => (<badge_1.Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        {use}
                      </badge_1.Badge>))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <lucide_react_1.User className="h-3 w-3 mr-1"/>
                    {(_c = story.createdBy) === null || _c === void 0 ? void 0 : _c.name}
                  </div>
                  <story_details_dialog_1.StoryDetailsDialog story={story}/>
                </div>
              </card_1.CardContent>
            </card_1.Card>);
            })}
        </div>

        {culturalStories.length > 6 && (<div className="text-center mt-4">
            <button_1.Button variant="outline">View All Cultural Stories</button_1.Button>
          </div>)}
      </div>

      {/* Knowledge Base Resources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <lucide_react_1.BookOpen className="h-5 w-5 text-blue-600"/>
            Counseling Resources
          </h2>
          <span className="text-sm text-gray-600">{knowledgeBase.length} resources</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {knowledgeBase.map((resource) => {
                var _a, _b;
                return (<card_1.Card key={resource.id} className="card-hover">
              <card_1.CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <card_1.CardTitle className="text-lg leading-tight">{resource.title}</card_1.CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <badge_1.Badge className={`text-xs ${getCategoryColor(resource.category)}`}>
                        {getCategoryIcon(resource.category)}
                        <span className="ml-1">{resource.category.replace('_', ' ')}</span>
                      </badge_1.Badge>
                      {resource.subCategory && (<badge_1.Badge variant="outline" className="text-xs">
                          {resource.subCategory}
                        </badge_1.Badge>)}
                    </div>
                  </div>
                </div>
              </card_1.CardHeader>
              
              <card_1.CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {resource.summary || "Comprehensive resource for counseling guidance and support."}
                </p>
                
                {((_a = resource.tags) === null || _a === void 0 ? void 0 : _a.length) > 0 && (<div>
                    <h4 className="text-xs font-medium text-gray-900 mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 3).map((tag) => (<badge_1.Badge key={tag.id} variant="outline" className="text-xs" style={{
                                backgroundColor: tag.color ? `${tag.color}15` : undefined,
                                borderColor: tag.color || undefined,
                                color: tag.color || undefined
                            }}>
                          {tag.name}
                        </badge_1.Badge>))}
                    </div>
                  </div>)}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <lucide_react_1.User className="h-3 w-3 mr-1"/>
                    <span>{(_b = resource.createdBy) === null || _b === void 0 ? void 0 : _b.name}</span>
                    <span className="mx-1">•</span>
                    <lucide_react_1.Calendar className="h-3 w-3 mr-1"/>
                    <span>{(0, date_fns_1.formatDistanceToNow)(new Date(resource.createdAt))} ago</span>
                  </div>
                  <resource_details_dialog_1.ResourceDetailsDialog resource={resource}/>
                </div>
              </card_1.CardContent>
            </card_1.Card>);
            })}
        </div>
      </div>

      {/* Empty State */}
      {knowledgeBase.length === 0 && culturalStories.length === 0 && (<card_1.Card>
          <card_1.CardContent className="text-center py-12">
            <lucide_react_1.BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Available</h3>
            <p className="text-gray-600 mb-4">
              The knowledge base is empty. 
              {userRole === "ADMIN" && " Start by adding some resources and cultural stories."}
            </p>
            {userRole === "ADMIN" && (<link_1.default href="/admin/manage-kb">
                <button_1.Button className="bg-blue-600 hover:bg-blue-700">
                  <lucide_react_1.BookOpen className="h-4 w-4 mr-2"/>
                  Add First Resource
                </button_1.Button>
              </link_1.default>)}
          </card_1.CardContent>
        </card_1.Card>)}
    </div>);
    });
}
exports.default = KnowledgeBasePage;
