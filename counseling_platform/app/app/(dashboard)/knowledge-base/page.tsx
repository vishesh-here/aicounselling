
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Search, Filter, Star, Calendar, 
  User, FileText, Heart, Brain, Target 
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { StoryDetailsDialog } from "@/components/knowledge-base/story-details-dialog";
import { ResourceDetailsDialog } from "@/components/knowledge-base/resource-details-dialog";

export const dynamic = "force-dynamic";

async function getKnowledgeBaseData() {
  const [knowledgeBase, culturalStories] = await Promise.all([
    prisma.knowledgeBase.findMany({
      where: { isActive: true },
      include: {
        createdBy: {
          select: { name: true }
        },
        tags: true
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.culturalStory.findMany({
      where: { isActive: true },
      include: {
        createdBy: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return { knowledgeBase, culturalStories };
}

export default async function KnowledgeBasePage() {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || "VOLUNTEER";

  const { knowledgeBase, culturalStories } = await getKnowledgeBaseData();

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

  const getSourceIcon = (source: string) => {
    return <BookOpen className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600 mt-1">
            Access counseling resources, cultural wisdom stories, and guidance materials
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-blue-600">
            <BookOpen className="h-5 w-5" />
            <span className="font-medium">
              {knowledgeBase.length + culturalStories.length} resources
            </span>
          </div>
          {userRole === "ADMIN" && (
            <Link href="/admin/manage-kb">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <BookOpen className="h-4 w-4 mr-2" />
                Manage KB
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search knowledge base, stories, or topics..."
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                All Categories
              </Button>
              <Button variant="outline" size="sm">Cultural Stories</Button>
              <Button variant="outline" size="sm">Career Guidance</Button>
              <Button variant="outline" size="sm">Psychology</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
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
                <p className="text-sm text-gray-600">Guidance Materials</p>
                <p className="text-2xl font-bold text-gray-900">
                  {knowledgeBase.filter(kb => kb.category === "CAREER_GUIDANCE").length}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Psychology Resources</p>
                <p className="text-2xl font-bold text-gray-900">
                  {knowledgeBase.filter(kb => kb.category === "PSYCHOLOGICAL_COUNSELING").length}
                </p>
              </div>
              <Brain className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cultural Stories Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="h-5 w-5 text-orange-600" />
            Cultural Wisdom Stories
          </h2>
          <span className="text-sm text-gray-600">{culturalStories.length} stories</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {culturalStories.slice(0, 6).map((story: any) => (
            <Card key={story.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">{story.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`text-xs ${getSourceColor(story.source)}`}>
                        {story.source.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">{story.summary}</p>
                
                <div>
                  <h4 className="text-xs font-medium text-gray-900 mb-1">Key Themes</h4>
                  <div className="flex flex-wrap gap-1">
                    {story.themes?.slice(0, 3).map((theme: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-medium text-gray-900 mb-1">Applicable For</h4>
                  <div className="flex flex-wrap gap-1">
                    {story.applicableFor?.slice(0, 2).map((use: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        {use}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="h-3 w-3 mr-1" />
                    {story.createdBy?.name}
                  </div>
                  <StoryDetailsDialog story={story} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {culturalStories.length > 6 && (
          <div className="text-center mt-4">
            <Button variant="outline">View All Cultural Stories</Button>
          </div>
        )}
      </div>

      {/* Knowledge Base Resources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Counseling Resources
          </h2>
          <span className="text-sm text-gray-600">{knowledgeBase.length} resources</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {knowledgeBase.map((resource: any) => (
            <Card key={resource.id} className="card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={`text-xs ${getCategoryColor(resource.category)}`}>
                        {getCategoryIcon(resource.category)}
                        <span className="ml-1">{resource.category.replace('_', ' ')}</span>
                      </Badge>
                      {resource.subCategory && (
                        <Badge variant="outline" className="text-xs">
                          {resource.subCategory}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {resource.summary || "Comprehensive resource for counseling guidance and support."}
                </p>
                
                {resource.tags?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-900 mb-1">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 3).map((tag: any) => (
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
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center text-xs text-gray-500">
                    <User className="h-3 w-3 mr-1" />
                    <span>{resource.createdBy?.name}</span>
                    <span className="mx-1">•</span>
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDistanceToNow(new Date(resource.createdAt))} ago</span>
                  </div>
                  <ResourceDetailsDialog resource={resource} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {knowledgeBase.length === 0 && culturalStories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Resources Available</h3>
            <p className="text-gray-600 mb-4">
              The knowledge base is empty. 
              {userRole === "ADMIN" && " Start by adding some resources and cultural stories."}
            </p>
            {userRole === "ADMIN" && (
              <Link href="/admin/manage-kb">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Add First Resource
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
