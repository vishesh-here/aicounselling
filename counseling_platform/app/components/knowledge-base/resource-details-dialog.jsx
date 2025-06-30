"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceDetailsDialog = void 0;
const react_1 = require("react");
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const scroll_area_1 = require("@/components/ui/scroll-area");
const separator_1 = require("@/components/ui/separator");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
function ResourceDetailsDialog({ resource, trigger }) {
    var _a, _b;
    const [open, setOpen] = (0, react_1.useState)(false);
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
    return (<dialog_1.Dialog open={open} onOpenChange={setOpen}>
      <dialog_1.DialogTrigger asChild>
        {trigger || (<button_1.Button size="sm" variant="outline">
            <lucide_react_1.BookOpen className="h-3 w-3 mr-1"/>
            View Resource
          </button_1.Button>)}
      </dialog_1.DialogTrigger>
      <dialog_1.DialogContent className="max-w-4xl max-h-[90vh]">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2 text-xl">
            {getCategoryIcon(resource.category)}
            {resource.title}
          </dialog_1.DialogTitle>
        </dialog_1.DialogHeader>
        
        <scroll_area_1.ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Resource Metadata */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <badge_1.Badge className={`${getCategoryColor(resource.category)}`}>
                  {getCategoryIcon(resource.category)}
                  <span className="ml-1">{resource.category.replace('_', ' ')}</span>
                </badge_1.Badge>
                {resource.subCategory && (<badge_1.Badge variant="outline" className="text-xs">
                    {resource.subCategory}
                  </badge_1.Badge>)}
                {resource.fileType && (<badge_1.Badge variant="secondary" className="text-xs">
                    {resource.fileType.toUpperCase()}
                  </badge_1.Badge>)}
                <div className="flex items-center text-sm text-gray-500">
                  <lucide_react_1.User className="h-3 w-3 mr-1"/>
                  <span>{(_a = resource.createdBy) === null || _a === void 0 ? void 0 : _a.name}</span>
                  <span className="mx-2">•</span>
                  <lucide_react_1.Calendar className="h-3 w-3 mr-1"/>
                  <span>{(0, date_fns_1.formatDistanceToNow)(new Date(resource.createdAt))} ago</span>
                </div>
              </div>
              
              {/* Summary */}
              {resource.summary && (<div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                  <p className="text-sm text-gray-600">{resource.summary}</p>
                </div>)}
            </div>

            <separator_1.Separator />

            {/* Resource Content */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <lucide_react_1.FileText className="h-4 w-4"/>
                Content
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {resource.content}
                </p>
              </div>
            </div>

            {/* File Download */}
            {resource.fileUrl && (<>
                <separator_1.Separator />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Download</h3>
                  <button_1.Button asChild variant="outline" size="sm">
                    <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                      <lucide_react_1.FileText className="h-3 w-3 mr-1"/>
                      Download {((_b = resource.fileType) === null || _b === void 0 ? void 0 : _b.toUpperCase()) || 'File'}
                    </a>
                  </button_1.Button>
                </div>
              </>)}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (<>
                <separator_1.Separator />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.map((tag) => (<badge_1.Badge key={tag.id} variant="outline" className="text-xs" style={{
                    backgroundColor: tag.color ? `${tag.color}15` : undefined,
                    borderColor: tag.color || undefined,
                    color: tag.color || undefined
                }}>
                        {tag.name}
                      </badge_1.Badge>))}
                  </div>
                </div>
              </>)}
          </div>
        </scroll_area_1.ScrollArea>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
exports.ResourceDetailsDialog = ResourceDetailsDialog;
