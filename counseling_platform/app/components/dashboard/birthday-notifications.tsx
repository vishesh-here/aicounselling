"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";

interface BirthdayChild {
  id: string;
  fullName: string;
  dateOfBirth: string;
  age: number;
  currentCity?: string;
}

export default function BirthdayNotifications() {
  const [birthdayChildren, setBirthdayChildren] = useState<BirthdayChild[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdayChildren = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        
        if (!accessToken) {
          setLoading(false);
          return;
        }

        // Fetch birthday notifications from API endpoint
        const response = await fetch('/api/dashboard/birthday-notifications', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error('Error fetching birthday notifications:', response.status);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setBirthdayChildren(data.birthdayChildren || []);
      } catch (error) {
        console.error('Error fetching birthday children:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdayChildren();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-pink-600" />
            Birthday Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (birthdayChildren.length === 0) {
    return (
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <Gift className="h-5 w-5" />
            Birthday Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 text-center py-4">
            No birthdays today! 🎂
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pink-800">
          <Gift className="h-5 w-5" />
          🎉 Birthday Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {birthdayChildren.map((child) => (
            <div key={child.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-pink-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <Gift className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{child.fullName}</h4>
                  <p className="text-sm text-gray-600">
                    Turning {child.age} today
                    {child.currentCity && ` • ${child.currentCity}`}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-pink-300 text-pink-700">
                <Calendar className="h-3 w-3 mr-1" />
                Birthday
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 