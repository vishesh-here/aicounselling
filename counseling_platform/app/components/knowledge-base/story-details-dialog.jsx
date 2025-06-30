"use strict";
'use client';
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoryDetailsDialog = void 0;
const react_1 = require("react");
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
const badge_1 = require("@/components/ui/badge");
const scroll_area_1 = require("@/components/ui/scroll-area");
const separator_1 = require("@/components/ui/separator");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
function StoryDetailsDialog({ story, trigger }) {
    var _a, _b, _c;
    const [open, setOpen] = (0, react_1.useState)(false);
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
    return (<dialog_1.Dialog open={open} onOpenChange={setOpen}>
      <dialog_1.DialogTrigger asChild>
        {trigger || (<button_1.Button size="sm" variant="outline">
            <lucide_react_1.BookOpen className="h-3 w-3 mr-1"/>
            View Story
          </button_1.Button>)}
      </dialog_1.DialogTrigger>
      <dialog_1.DialogContent className="max-w-4xl max-h-[90vh]">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle className="flex items-center gap-2 text-xl">
            <lucide_react_1.Heart className="h-5 w-5 text-orange-600"/>
            {story.title}
          </dialog_1.DialogTitle>
        </dialog_1.DialogHeader>
        
        <scroll_area_1.ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Story Metadata */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <badge_1.Badge className={`${getSourceColor(story.source)}`}>
                  {story.source.replace('_', ' ')}
                </badge_1.Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <lucide_react_1.User className="h-3 w-3 mr-1"/>
                  <span>{(_a = story.createdBy) === null || _a === void 0 ? void 0 : _a.name}</span>
                  <span className="mx-2">•</span>
                  <lucide_react_1.Calendar className="h-3 w-3 mr-1"/>
                  <span>{(0, date_fns_1.formatDistanceToNow)(new Date(story.createdAt))} ago</span>
                </div>
              </div>
              
              {/* Summary */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                <p className="text-sm text-gray-600">{story.summary}</p>
              </div>
            </div>

            <separator_1.Separator />

            {/* Story Text */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <lucide_react_1.BookOpen className="h-4 w-4"/>
                The Story
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {story.storyText}
                </p>
              </div>
            </div>

            <separator_1.Separator />

            {/* Moral Lesson */}
            {story.moralLesson && (<>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <lucide_react_1.Lightbulb className="h-4 w-4 text-yellow-600"/>
                    Moral Lesson
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{story.moralLesson}</p>
                  </div>
                </div>
                <separator_1.Separator />
              </>)}

            {/* Key Insights */}
            {story.keyInsights && story.keyInsights.length > 0 && (<>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <lucide_react_1.Target className="h-4 w-4 text-blue-600"/>
                    Key Insights
                  </h3>
                  <div className="space-y-2">
                    {story.keyInsights.map((insight, index) => (<div key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"/>
                        <p className="text-sm text-gray-700">{insight}</p>
                      </div>))}
                  </div>
                </div>
                <separator_1.Separator />
              </>)}

            {/* Themes */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Key Themes</h3>
              <div className="flex flex-wrap gap-1">
                {(_b = story.themes) === null || _b === void 0 ? void 0 : _b.map((theme, index) => (<badge_1.Badge key={index} variant="outline" className="text-xs">
                    {theme}
                  </badge_1.Badge>))}
              </div>
            </div>

            {/* Applicable For */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Applicable For</h3>
              <div className="flex flex-wrap gap-1">
                {(_c = story.applicableFor) === null || _c === void 0 ? void 0 : _c.map((use, index) => (<badge_1.Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    {use}
                  </badge_1.Badge>))}
              </div>
            </div>
          </div>
        </scroll_area_1.ScrollArea>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
exports.StoryDetailsDialog = StoryDetailsDialog;
