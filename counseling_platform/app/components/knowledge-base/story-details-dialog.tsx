
'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, Heart, User, Calendar, Target, Lightbulb, 
  Sparkles, Award, Clock, MapPin, Tag, Users, Star
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StoryDetailsDialogProps {
  story: {
    id: string;
    title: string;
    summary: string;
    content?: string; // API returns 'content' field
    storyText?: string; // Legacy field name
    source: string;
    themes?: string[];
    applicableFor?: string[];
    moralLesson?: string;
    keyInsights?: string[];
    category?: string;
    subCategory?: string;
    tags?: string[];
    createdAt: string;
    createdBy?: {
      name: string;
    };
  };
  trigger?: React.ReactNode;
}

export function StoryDetailsDialog({ story, trigger }: StoryDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  
  // Debug logging
  console.log("StoryDetailsDialog rendered with story:", {
    id: story.id,
    title: story.title,
    hasContent: !!story.content,
    contentLength: story.content ? story.content.length : 0,
    hasStoryText: !!story.storyText,
    storyTextLength: story.storyText ? story.storyText.length : 0,
    themes: story.themes,
    applicableFor: story.applicableFor,
    tags: story.tags
  });

  const getSourceColor = (source: string) => {
    switch (source) {
      case "RAMAYANA": return "bg-red-100 text-red-800 border-red-200";
      case "MAHABHARATA": return "bg-blue-100 text-blue-800 border-blue-200";
      case "BHAGAVAD_GITA": return "bg-purple-100 text-purple-800 border-purple-200";
      case "PANCHTANTRA": return "bg-green-100 text-green-800 border-green-200";
      case "JATAKA_TALES": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "CULTURAL_WISDOM": return "bg-orange-100 text-orange-800 border-orange-200";
      case "CAREER_GUIDANCE": return "bg-purple-100 text-purple-800 border-purple-200";
      case "PSYCHOLOGICAL_COUNSELING": return "bg-blue-100 text-blue-800 border-blue-200";
      case "EDUCATIONAL_RESOURCES": return "bg-green-100 text-green-800 border-green-200";
      case "LIFE_SKILLS": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="hover:bg-orange-50 hover:border-orange-200">
            <BookOpen className="h-3 w-3 mr-1" />
            View Story
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-orange-50 to-yellow-50">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Heart className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div>{story.title}</div>
              <div className="text-sm font-normal text-gray-600 mt-1">
                A timeless tale of wisdom and inspiration
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-6">
            {/* Story Metadata */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <Badge className={`${getSourceColor(story.source)} border`}>
                      {story.source.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {story.category && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-purple-600" />
                      <Badge className={`${getCategoryColor(story.category)} border`}>
                        {story.category.replace('_', ' ')}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      {story.createdBy?.name || 'Unknown Author'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {story.createdAt ? formatDistanceToNow(new Date(story.createdAt)) + ' ago' : 'Recently'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Summary */}
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
                    <p className="text-gray-700 leading-relaxed">{story.summary}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Story Content */}
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">The Story</h3>
                    <div className="prose prose-sm max-w-none">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                        {story.content || story.storyText || 'No story content available.'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moral Lesson */}
            {story.moralLesson && (
              <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Moral Lesson</h3>
                      <p className="text-gray-700 leading-relaxed">{story.moralLesson}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Insights */}
            {story.keyInsights && story.keyInsights.length > 0 && (
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Insights</h3>
                      <div className="space-y-3">
                        {story.keyInsights.map((insight: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="h-2 w-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-gray-700">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Themes - Only show if themes exist */}
            {story.themes && story.themes.length > 0 && (
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Themes</h3>
                      <div className="flex flex-wrap gap-2">
                        {story.themes.map((theme: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-sm bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
                          >
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Applicable For - Only show if applicableFor exists */}
            {story.applicableFor && story.applicableFor.length > 0 && (
              <Card className="border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Applicable For</h3>
                      <div className="flex flex-wrap gap-2">
                        {story.applicableFor.map((use: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-sm bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200"
                          >
                            {use}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags - Only show if tags exist */}
            {story.tags && story.tags.length > 0 && (
              <Card className="border-l-4 border-l-gray-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {story.tags.map((tag: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-sm bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
