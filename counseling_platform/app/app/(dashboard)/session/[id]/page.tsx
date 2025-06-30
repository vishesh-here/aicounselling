
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, Clock, MessageCircle, BookOpen, Brain, 
  PlayCircle, StopCircle, CheckCircle, AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { SessionInterface } from "@/components/session/session-interface";

export const dynamic = "force-dynamic";

async function getSessionData(childId: string, userRole: string, userId: string) {
  // Check if there's an active session for this child
  let activeSession = await prisma.session.findFirst({
    where: {
      childId: childId,
      status: { in: ["PLANNED", "IN_PROGRESS"] }
    },
    include: {
      child: {
        include: {
          concerns: {
            where: { status: { not: "RESOLVED" } }
          },
          assignments: {
            include: {
              volunteer: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      },
      volunteer: {
        select: { name: true, email: true }
      },
      summary: true,
      chatMessages: {
        orderBy: { createdAt: "asc" }
      }
    }
  });

  // Get child data for access control
  const child = await prisma.child.findUnique({
    where: { id: childId, isActive: true },
    include: {
      assignments: {
        include: {
          volunteer: {
            select: { id: true, name: true, email: true }
          }
        }
      }
    }
  });

  if (!child) {
    throw new Error("Child not found");
  }

  // Check access permissions for volunteers
  if (userRole === "VOLUNTEER") {
    const hasAccess = child.assignments.some(assignment => 
      assignment.volunteerId === userId && assignment.isActive
    );
    
    if (!hasAccess) {
      throw new Error("Access denied");
    }
  }

  return { activeSession, child };
}

interface PageProps {
  params: { id: string };
}

export default async function SessionPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || "VOLUNTEER";
  const userId = session?.user?.id || "";

  try {
    const { activeSession, child } = await getSessionData(params.id, userRole, userId);

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/children/${params.id}`}>
              <Button variant="outline" size="sm">
                ← Back to Profile
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Session with {child.name}
              </h1>
              <p className="text-gray-600">
                {child.age} years old • {child.state}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {activeSession ? (
              <Badge 
                variant="secondary" 
                className={`${
                  activeSession.status === "IN_PROGRESS" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                <PlayCircle className="h-3 w-3 mr-1" />
                {activeSession.status === "IN_PROGRESS" ? "Session Active" : "Session Planned"}
              </Badge>
            ) : (
              <Badge variant="outline">
                No Active Session
              </Badge>
            )}
          </div>
        </div>

        {/* Session Interface */}
        <SessionInterface 
          child={child} 
          activeSession={activeSession} 
          userId={userId}
          userRole={userRole}
        />
      </div>
    );

  } catch (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this session.
            </p>
            <Link href="/children">
              <Button variant="outline">Back to Children</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
}
