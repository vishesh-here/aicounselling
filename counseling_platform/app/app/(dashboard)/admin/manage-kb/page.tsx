"use client";

import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Plus, Upload, 
  FileText, Heart, Settings, Users 
} from "lucide-react";
import { AddResourceDialog } from "@/components/admin/add-resource-dialog";
import { ResourceActions } from "@/components/admin/resource-actions";
import { ManageKBActions } from "@/components/admin/manage-kb-actions";
import { formatDistanceToNow } from "date-fns";

export default function ManageKnowledgeBasePage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
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

      const response = await fetch('/api/admin/knowledge-resource', {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        setResources(data);
      } else {
        console.error('Failed to fetch resources');
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading resources...</span>
        </div>
      </div>
    );
  }
  const knowledgeBase = resources.filter((r: any) => r.type === "knowledge_base");
  const culturalStories = resources.filter((r: any) => r.type === "cultural_story");

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Knowledge Base</h1>
          <p className="text-gray-600 mt-1">
            Add, edit, and organize counseling resources and cultural wisdom stories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <AddResourceDialog />
          <ManageKBActions onImportComplete={fetchResources} />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Resources</p>
                <p className="text-2xl font-bold text-gray-900">
                  {knowledgeBase.length + culturalStories.length}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Knowledge Base</p>
                <p className="text-2xl font-bold text-gray-900">{knowledgeBase.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cultural Stories</p>
                <p className="text-2xl font-bold text-gray-900">{culturalStories.length}</p>
              </div>
              <Heart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{0}</p> {/* Placeholder for total users */}
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cultural Stories Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-orange-600" />
              Cultural Wisdom Stories ({culturalStories.length})
            </CardTitle>
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Story
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {culturalStories.map((story: any) => (
              <div key={story.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{story.title}</h3>
                      <Badge className={`text-xs ${getSourceColor(story.source)}`}>
                        {story.source ? story.source.replace('_', ' ') : 'N/A'}
                      </Badge>
                      <Badge variant={story.isActive ? "default" : "secondary"} className="text-xs">
                        {story.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{story.summary}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created by: {story.createdById}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(story.createdAt))} ago</span>
                      <span>•</span>
                      <span>{story.themes?.length || 0} themes</span>
                    </div>

                    {story.themes?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {story.themes.slice(0, 4).map((theme: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        ))}
                        {story.themes.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{story.themes.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <ResourceActions 
                    resourceId={story.id} 
                    resourceType="cultural_story"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Base Resources Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Knowledge Base Resources ({knowledgeBase.length})
            </CardTitle>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {knowledgeBase.map((resource: any) => (
              <div key={resource.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{resource.title}</h3>
                      <Badge className={`text-xs ${getCategoryColor(resource.category)}`}>
                        {resource.category.replace('_', ' ')}
                      </Badge>
                      {resource.subCategory && (
                        <Badge variant="outline" className="text-xs">
                          {resource.subCategory}
                        </Badge>
                      )}
                      <Badge variant={resource.isActive ? "default" : "secondary"} className="text-xs">
                        {resource.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {resource.summary || "No summary available"}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created by: {resource.createdById}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(resource.createdAt))} ago</span>
                      <span>•</span>
                      <span>{resource.tags?.length || 0} tags</span>
                      {resource.fileType && (
                        <>
                          <span>•</span>
                          <span className="uppercase">{resource.fileType}</span>
                        </>
                      )}
                    </div>

                    {resource.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {resource.tags.slice(0, 4).map((tag: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {resource.tags.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.tags.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <ResourceActions 
                    resourceId={resource.id} 
                    resourceType="knowledge_base"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Upload className="h-8 w-8 mb-2" />
              <span>Bulk Import</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-8 w-8 mb-2" />
              <span>Export Data</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Settings className="h-8 w-8 mb-2" />
              <span>Manage Tags</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
