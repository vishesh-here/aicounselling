
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Plus, Edit, Trash2, Upload, 
  FileText, Heart, Settings, Users 
} from "lucide-react";
import { AddResourceDialog } from "@/components/admin/add-resource-dialog";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

async function getKnowledgeBaseData() {
  const [knowledgeBase, culturalStories, totalUsers] = await Promise.all([
    prisma.knowledgeBase.findMany({
      include: {
        createdBy: {
          select: { name: true }
        },
        tags: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.culturalStory.findMany({
      include: {
        createdBy: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.count({ where: { role: "VOLUNTEER" } })
  ]);

  return { knowledgeBase, culturalStories, totalUsers };
}

export default async function ManageKnowledgeBasePage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const { knowledgeBase, culturalStories, totalUsers } = await getKnowledgeBaseData();

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
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
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
                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
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
                        {story.source.replace('_', ' ')}
                      </Badge>
                      <Badge variant={story.isActive ? "default" : "secondary"} className="text-xs">
                        {story.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{story.summary}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Created by: {story.createdBy?.name}</span>
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
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
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
                      <span>Created by: {resource.createdBy?.name}</span>
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
                        {resource.tags.slice(0, 4).map((tag: any) => (
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
                        {resource.tags.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.tags.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
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
