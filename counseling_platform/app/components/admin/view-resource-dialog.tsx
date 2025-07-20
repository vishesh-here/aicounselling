"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, BookOpen, Heart, Calendar, User, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ViewResourceDialogProps {
  resourceId: string;
  resourceType: 'knowledge_base' | 'cultural_story';
  isOpen: boolean;
  onClose: () => void;
}

interface ResourceData {
  id: string;
  title: string;
  summary: string;
  content: string;
  type: string;
  category: string;
  subCategory?: string;
  source?: string;
  themes?: string[];
  tags?: string[];
  createdById: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  fileType?: string;
  fileUrl?: string;
  views?: number;
  downloadCount?: number;
}

export function ViewResourceDialog({ 
  resourceId, 
  resourceType, 
  isOpen, 
  onClose 
}: ViewResourceDialogProps) {
  const [resource, setResource] = useState<ResourceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && resourceId) {
      fetchResource();
    }
  }, [isOpen, resourceId]);

  const fetchResource = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get access token
      let accessToken = null;
      try {
        const projectRef = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
        if (projectRef) {
          accessToken = JSON.parse(localStorage.getItem(projectRef) || '{}').access_token;
        }
      } catch (err) {}

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      const response = await fetch(`/api/admin/knowledge-resource/${resourceId}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setResource(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch resource");
      }
    } catch (error) {
      setError("Failed to fetch resource");
    } finally {
      setLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {resourceType === 'cultural_story' ? (
                <Heart className="h-5 w-5 text-orange-600" />
              ) : (
                <BookOpen className="h-5 w-5 text-blue-600" />
              )}
              {resource ? resource.title : "Loading..."}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading resource details...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <Button onClick={fetchResource} className="mt-2">Retry</Button>
            </div>
          )}

          {resource && !loading && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{resource.title}</h2>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={`text-sm ${getCategoryColor(resource.category)}`}>
                      {resource.category.replace('_', ' ')}
                    </Badge>
                    {resource.subCategory && (
                      <Badge variant="outline" className="text-sm">
                        {resource.subCategory}
                      </Badge>
                    )}
                    {resource.source && (
                      <Badge className={`text-sm ${getSourceColor(resource.source)}`}>
                        {resource.source.replace('_', ' ')}
                      </Badge>
                    )}
                    <Badge variant={resource.isActive ? "default" : "secondary"} className="text-sm">
                      {resource.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{resource.summary}</p>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {resourceType === 'cultural_story' ? 'Full Story' : 'Content'}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-gray-700 font-sans">{resource.content}</pre>
                </div>
              </div>

              {/* Tags and Themes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resource.tags && resource.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {resource.themes && resource.themes.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Themes</h3>
                    <div className="flex flex-wrap gap-2">
                      {resource.themes.map((theme: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-sm bg-orange-50 text-orange-700">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Resource Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Created by: {resource.createdById}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Created: {formatDistanceToNow(new Date(resource.createdAt))} ago</span>
                  </div>
                  {resource.fileType && (
                    <div className="flex items-center gap-2">
                      <span>File Type: {resource.fileType.toUpperCase()}</span>
                    </div>
                  )}
                  {resource.views !== undefined && (
                    <div className="flex items-center gap-2">
                      <span>Views: {resource.views}</span>
                    </div>
                  )}
                  {resource.downloadCount !== undefined && (
                    <div className="flex items-center gap-2">
                      <span>Downloads: {resource.downloadCount}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 