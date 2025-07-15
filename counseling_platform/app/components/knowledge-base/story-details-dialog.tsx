
'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Heart, User, Calendar, Target, Lightbulb } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface StoryDetailsDialogProps {
  story: {
    id: string;
    title: string;
    summary: string;
    storyText: string;
    source: string;
    themes: string[];
    applicableFor: string[];
    moralLesson?: string;
    keyInsights?: string[];
    createdAt: string;
    createdBy?: {
      name: string;
    };
  };
  trigger?: React.ReactNode;
}

export function StoryDetailsDialog({ story, trigger }: StoryDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  const getSourceColor = (source: string) => {
    switch (source) {
      case "RAMAYANA": return "bg-red-100 text-red-800";
      case "MAHABHARATA": return "bg-blue-100 text-blue-800";
      case "BHAGAVAD_GITA": return "bg-purple-100 text-purple-800";
      case "PANCHTANTRA": return "bg-green-100 text-green-800";
      case "JATAKA_TALES": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <BookOpen className="h-3 w-3 mr-1" />
            View Story
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Heart className="h-5 w-5 text-orange-600" />
            {story.title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Story Metadata */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={`${getSourceColor(story.source)}`}>
                  {(story.source ? story.source.replace('_', ' ') : 'Unknown')}
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-3 w-3 mr-1" />
                  <span>{story.createdBy?.name}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDistanceToNow(new Date(story.created_at))} ago</span>
                </div>
              </div>
              
              {/* Summary */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                <p className="text-sm text-gray-600">{story.summary}</p>
              </div>
            </div>

            <Separator />

            {/* Story Text */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                The Story
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {story.storyText}
                </p>
              </div>
            </div>

            <Separator />

            {/* Moral Lesson */}
            {story.moralLesson && (
              <>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Moral Lesson
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{story.moralLesson}</p>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Key Insights */}
            {story.keyInsights && story.keyInsights.length > 0 && (
              <>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Key Insights
                  </h3>
                  <div className="space-y-2">
                    {story.keyInsights.map((insight: string, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Themes */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Key Themes</h3>
              <div className="flex flex-wrap gap-1">
                {story.themes?.map((theme: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Applicable For */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Applicable For</h3>
              <div className="flex flex-wrap gap-1">
                {story.applicableFor?.map((use: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                    {use}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
