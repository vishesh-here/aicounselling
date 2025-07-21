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
  Sparkles, Award, Clock, MapPin, Tag, Users, Star, X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StoryViewerDialogProps {
  story: {
    id: string;
    title: string;
    summary: string;
    content?: string;
    storyText?: string;
    source?: string;
    themes?: string[];
    applicableFor?: string[];
    moralLesson?: string;
    keyInsights?: string[];
    category?: string;
    subCategory?: string;
    tags?: string[];
    createdAt?: string;
    createdBy?: {
      name: string;
    };
  };
  trigger?: React.ReactNode;
  children?: React.ReactNode;
}

export function StoryViewerDialog({ story, trigger, children }: StoryViewerDialogProps) {
  const [open, setOpen] = useState(false);

  const getSourceColor = (source?: string) => {
    switch (source?.toLowerCase()) {
      case 'indian_culture': return 'bg-orange-100 text-orange-800';
      case 'hindu_mythology': return 'bg-red-100 text-red-800';
      case 'modern_stories': return 'bg-blue-100 text-blue-800';
      case 'sports': return 'bg-green-100 text-green-800';
      case 'leadership': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'cultural_wisdom': return <Heart className="h-3 w-3" />;
      case 'career_guidance': return <Target className="h-3 w-3" />;
      case 'leadership': return <Award className="h-3 w-3" />;
      case 'sports': return <Sparkles className="h-3 w-3" />;
      default: return <BookOpen className="h-3 w-3" />;
    }
  };

  const storyContent = story.content || story.storyText || story.summary;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="p-0 h-auto text-left font-normal">
            {story.title}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold text-gray-900 mb-2">
                {story.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mb-3">
                {story.category && (
                  <Badge className={`text-xs ${getSourceColor(story.category)}`}>
                    {getCategoryIcon(story.category)}
                    <span className="ml-1">{story.category.replace('_', ' ')}</span>
                  </Badge>
                )}
                {story.source && (
                  <Badge variant="outline" className="text-xs">
                    {story.source.replace('_', ' ')}
                  </Badge>
                )}
                {story.createdAt && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(story.createdAt))} ago
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-200px)]">
          <div className="space-y-6 pr-2">
            {/* Summary */}
            {story.summary && (
              <Card>
                <CardContent className="pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Summary
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {story.summary}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Main Content */}
            <Card>
              <CardContent className="pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Story Content
                </h3>
                <div className="prose prose-sm max-w-none">
                  <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {storyContent}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Themes */}
            {story.themes && story.themes.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    Key Themes
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {story.themes.map((theme, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Applicable For */}
            {story.applicableFor && story.applicableFor.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    Applicable For
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {story.applicableFor.map((use, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        {use}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Moral Lesson */}
            {story.moralLesson && (
              <Card>
                <CardContent className="pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    Moral Lesson
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {story.moralLesson}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Key Insights */}
            {story.keyInsights && story.keyInsights.length > 0 && (
              <Card>
                <CardContent className="pt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Key Insights
                  </h3>
                  <ul className="space-y-2">
                    {story.keyInsights.map((insight, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Created By */}
            {story.createdBy && (
              <div className="flex items-center text-xs text-gray-500 pt-2">
                <User className="h-3 w-3 mr-1" />
                Created by {story.createdBy.name}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 