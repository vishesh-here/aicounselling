
'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BookOpen, User, Calendar, Target, Brain, Heart, Star, FileText,
  Download, Tag, Clock, MapPin, Lightbulb, Award
} from "lucide-react";
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
    themes?: string[];
    applicableFor?: string[];
    moralLesson?: string;
    keyInsights?: string[];
    createdAt: string;
    createdBy?: {
      name: string;
    };
  };
  trigger?: React.ReactNode;
}

export function ResourceDetailsDialog({ resource, trigger }: ResourceDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  
  // Debug logging
  console.log("ResourceDetailsDialog rendered with resource:", {
    id: resource.id,
    title: resource.title,
    hasContent: !!resource.content,
    contentLength: resource.content ? resource.content.length : 0
  });

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
      case "CAREER_GUIDANCE": return "bg-purple-100 text-purple-800 border-purple-200";
      case "PSYCHOLOGICAL_COUNSELING": return "bg-blue-100 text-blue-800 border-blue-200";
      case "CULTURAL_WISDOM": return "bg-orange-100 text-orange-800 border-orange-200";
      case "EDUCATIONAL_RESOURCES": return "bg-green-100 text-green-800 border-green-200";
      case "LIFE_SKILLS": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:border-blue-200">
            <BookOpen className="h-3 w-3 mr-1" />
            View Resource
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getCategoryIcon(resource.category)}
            </div>
            <div>
              <div>{resource.title}</div>
              <div className="text-sm font-normal text-gray-600 mt-1">
                Comprehensive resource for guidance and support
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-6">
            {/* Resource Metadata */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-blue-600" />
                    <Badge className={`${getCategoryColor(resource.category)} border`}>
                      {getCategoryIcon(resource.category)}
                      <span className="ml-1">{resource.category.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  
                  {resource.subCategory && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <Badge variant="outline" className="text-sm bg-purple-50 text-purple-800 border-purple-200">
                        {resource.subCategory}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      {resource.createdBy?.name || 'Unknown Author'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {resource.createdAt ? formatDistanceToNow(new Date(resource.createdAt)) + ' ago' : 'Recently'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Summary */}
            {resource.summary && (
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
                      <p className="text-gray-700 leading-relaxed">{resource.summary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resource Content */}
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Content</h3>
                    <div className="prose prose-sm max-w-none">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border">
                        {resource.content}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moral Lesson */}
            {resource.moralLesson && (
              <Card className="border-l-4 border-l-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Award className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Moral Lesson</h3>
                      <p className="text-gray-700 leading-relaxed">{resource.moralLesson}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Insights */}
            {resource.keyInsights && resource.keyInsights.length > 0 && (
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Target className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Insights</h3>
                      <div className="space-y-3">
                        {resource.keyInsights.map((insight: string, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="h-2 w-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
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
            {resource.themes && resource.themes.length > 0 && (
              <Card className="border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Themes</h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.themes.map((theme: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-sm bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100"
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
            {resource.applicableFor && resource.applicableFor.length > 0 && (
              <Card className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Applicable For</h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.applicableFor.map((use: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            className="text-sm bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200"
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

            {/* File Download */}
            {resource.fileUrl && (
              <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Download className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Download</h3>
                      <Button asChild variant="outline" size="sm" className="bg-white hover:bg-green-50">
                        <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-3 w-3 mr-1" />
                          Download {resource.fileType?.toUpperCase() || 'File'}
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <Card className="border-l-4 border-l-gray-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.map((tag) => (
                          <Badge 
                            key={tag.id} 
                            variant="outline" 
                            className="text-sm"
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
