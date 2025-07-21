"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, MapPin, Calendar, Phone, GraduationCap, 
  Heart, Star, AlertCircle, Edit, BookOpen, Bot, ExternalLink,
  Gift, Mail, MessageCircle, Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { supabase } from "@/lib/supabaseClient";

interface ProfileDetailsProps {
  child: any;
}

export default function ProfileDetails({ child }: ProfileDetailsProps) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user;
  const role = user?.user_metadata?.role || "VOLUNTEER";

  const openAiMentor = () => {
    router.push(`/ai-mentor/${child.id}`);
  };

  const getGenderIcon = (gender: string) => {
    return <User className="h-4 w-4" />;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH": return "bg-red-100 text-red-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "LOW": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "OPEN": return "bg-yellow-100 text-yellow-800";
      case "CLOSED": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Check if today is the child's birthday
  const isBirthdayToday = () => {
    if (!child.dateOfBirth) return false;
    const today = new Date();
    const birthDate = new Date(child.dateOfBirth);
    return today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate();
  };

  // Calculate age from date of birth
  const calculateAge = () => {
    if (!child.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(child.dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const age = calculateAge();

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <div className="flex items-center gap-2">
              {role === "ADMIN" && (
                <Link href={`/children/${child.id}/edit`}>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Birthday Alert */}
          {isBirthdayToday() && (
            <div className="mb-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Gift className="h-6 w-6 text-pink-600" />
                <div>
                  <h3 className="font-semibold text-pink-800">🎉 Happy Birthday!</h3>
                  <p className="text-pink-700 text-sm">
                    Today is {child.fullName || child.name}'s birthday! They are turning {age} today.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <p className="text-gray-900 font-medium">{child.fullName || child.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">
                    {child.dateOfBirth ? format(new Date(child.dateOfBirth), "PPP") : "Not specified"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Age</label>
                <p className="text-gray-900">
                  {age !== null ? `${age} years old` : "Age not available"}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Gender</label>
                <div className="flex items-center gap-2">
                  {getGenderIcon(child.gender)}
                  <span className="text-gray-900 capitalize">{child.gender?.toLowerCase()}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Preferred Language</label>
                <p className="text-gray-900">{child.language}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Education Type</label>
                <p className="text-gray-900">{child.educationType || "Not specified"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Current City</label>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{child.currentCity || "Not specified"}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">State</label>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{child.state}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">School/College Name</label>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{child.currentSchoolCollegeName || "Not specified"}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Class/Semester</label>
                <p className="text-gray-900">{child.currentClassSemester || "Not specified"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Profile Created</label>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">
                    {format(new Date(child.createdAt), "PPP")}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Badge variant={child.isActive ? "default" : "secondary"}>
                  {child.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{child.whatsappNumber || "Not provided"}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Calling Number</label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{child.callingNumber || "Not provided"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Parent/Guardian Contact</label>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900">{child.parentGuardianContactNumber || "Not provided"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Mother's Name</label>
                <p className="text-gray-900">{child.mothersName || "Not specified"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Father's Name</label>
                <p className="text-gray-900">{child.fathersName || "Not specified"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Family Background</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {child.background || "No background information available"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interests & Hobbies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Interests & Hobbies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {child.interests?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {child.interests.map((interest: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                  {interest}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No interests listed</p>
          )}
        </CardContent>
      </Card>

      {/* Challenges & Concerns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Challenges & Areas of Focus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Personal Challenges */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Personal Challenges</label>
              {child.challenges?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {child.challenges.map((challenge: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                      {challenge}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No personal challenges listed</p>
              )}
            </div>

            {/* Documented Concerns */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Documented Concerns</label>
              {child.concerns?.length > 0 ? (
                <div className="space-y-2">
                  {child.concerns.map((concern: any) => (
                    <div key={concern.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{concern.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{concern.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {concern.category}
                            </Badge>
                            <Badge className={`text-xs ${getSeverityColor(concern.severity)}`}>
                              {concern.severity}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(concern.status)}`}>
                              {concern.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No documented concerns</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Information */}
      {child.assignments?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Assignment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {child.assignments.map((assignment: any) => (
                <div key={assignment.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Assigned to: {assignment.volunteer?.name || "Unassigned"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Specialization: {assignment.volunteer?.specialization || "General"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Assigned on: {format(new Date(assignment.assignedAt), "PPP")}
                      </p>
                      {assignment.notes && (
                        <p className="text-sm text-gray-700 mt-2 italic">
                          "{assignment.notes}"
                        </p>
                      )}
                    </div>
                    <Badge variant={assignment.isActive ? "default" : "secondary"}>
                      {assignment.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {child.tags?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {child.tags.map((tag: any) => (
                <Badge 
                  key={tag.id} 
                  variant="outline"
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
