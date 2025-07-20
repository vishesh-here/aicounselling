
'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { BookOpen, User, Calendar, Target, Brain, Heart, Star, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ResourceDetailsDialogProps {
  resource: {
    id: string;
    title: string;
    summary?: string;
    content: string;
    category: string;
    subCategory?: string;
    fileType?: string;
    fileUrl?: string;
    tags?: Array<{
      id: string;
      name: string;
      color?: string;
    }>;
    createdAt: string;
    createdBy?: {
      name: string;
    };
  };
  trigger?: React.ReactNode;
}

export function ResourceDetailsDialog({ resource, trigger }: ResourceDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "CAREER_GUIDANCE": return <Target className="h-4 w-4" />;
      case "PSYCHOLOGICAL_COUNSELING": return <Brain className="h-4 w-4" />;
      case "CULTURAL_WISDOM": return <Heart className="h-4 w-4" />;
      case "EDUCATIONAL_RESOURCES": return <BookOpen className="h-4 w-4" />;
      case "LIFE_SKILLS": return <Star className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "CAREER_GUIDANCE": return "bg-purple-100 text-purple-800";
      case "PSYCHOLOGICAL_COUNSELING": return "bg-blue-100 text-blue-800";
      case "CULTURAL_WISDOM": return "bg-orange-100 text-orange-800";
      case "EDUCATIONAL_RESOURCES": return "bg-green-100 text-green-800";
      case "LIFE_SKILLS": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <BookOpen className="h-3 w-3 mr-1" />
            View Resource
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            {getCategoryIcon(resource.category)}
            {resource.title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Resource Metadata */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`${getCategoryColor(resource.category)}`}>
                  {getCategoryIcon(resource.category)}
                  <span className="ml-1">{resource.category.replace('_', ' ')}</span>
                </Badge>
                {resource.subCategory && (
                  <Badge variant="outline" className="text-xs">
                    {resource.subCategory}
                  </Badge>
                )}
                {resource.fileType && (
                  <Badge variant="secondary" className="text-xs">
                    {resource.fileType.toUpperCase()}
                  </Badge>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-3 w-3 mr-1" />
                  <span>{resource.createdBy?.name}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-3 w-3 mr-1" />
                                      <span>{resource.createdAt ? formatDistanceToNow(new Date(resource.createdAt)) + ' ago' : 'Recently'}</span>
                </div>
              </div>
              
              {/* Summary */}
              {resource.summary && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Summary</h3>
                  <p className="text-sm text-gray-600">{resource.summary}</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Resource Content */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content
              </h3>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {resource.content}
                </p>
              </div>
            </div>

            {/* File Download */}
            {resource.fileUrl && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Download</h3>
                  <Button asChild variant="outline" size="sm">
                    <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="h-3 w-3 mr-1" />
                      Download {resource.fileType?.toUpperCase() || 'File'}
                    </a>
                  </Button>
                </div>
              </>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {resource.tags.map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="outline" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: tag.color ? `${tag.color}15` : undefined,
                          borderColor: tag.color || undefined,
                          color: tag.color || undefined
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
