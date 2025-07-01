"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, BookOpen, TrendingUp, Heart, UserCheck } from "lucide-react";

interface DashboardStatsProps {
  data: any;
  userRole: string;
}

export function DashboardStats({ data, userRole }: DashboardStatsProps) {
  const [animatedStats, setAnimatedStats] = useState<any>({});

  useEffect(() => {
    const stats = userRole === "ADMIN" ? data.stats : data.stats;
    const keys = Object.keys(stats || {});
    const timers: NodeJS.Timeout[] = [];

    if (!keys.length) {
      return;
    }
    
    keys.forEach((key) => {
      const finalValue = stats[key];
      let currentValue = 0;
      const increment = Math.ceil(finalValue / 50);
      
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalValue) {
          currentValue = finalValue;
          clearInterval(timer);
        }
        
        setAnimatedStats((prev: any) => ({
          ...prev,
          [key]: currentValue
        }));
      }, 30);
      timers.push(timer);
    });

    // Cleanup: clear all timers
    return () => {
      timers.forEach(clearInterval);
    };
  }, [data.stats, userRole]);

  if (userRole === "ADMIN") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold count-up">{animatedStats.totalChildren || 0}</div>
            <p className="text-xs text-muted-foreground">Active profiles</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volunteers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold count-up">{animatedStats.totalVolunteers || 0}</div>
            <p className="text-xs text-muted-foreground">Active volunteers</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold count-up">{animatedStats.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">Counseling sessions</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold count-up">{animatedStats.resolutionRate || 0}%</div>
            <p className="text-xs text-muted-foreground">Concerns resolved</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My Children</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold count-up">{animatedStats.myChildren || 0}</div>
          <p className="text-xs text-muted-foreground">Assigned to me</p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">My Sessions</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold count-up">{animatedStats.mySessions || 0}</div>
          <p className="text-xs text-muted-foreground">Total conducted</p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Open Cases</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold count-up">{animatedStats.myOpenConcerns || 0}</div>
          <p className="text-xs text-muted-foreground">Needs attention</p>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold count-up">{animatedStats.upcomingSessions || 0}</div>
          <p className="text-xs text-muted-foreground">Scheduled sessions</p>
        </CardContent>
      </Card>
    </div>
  );
}
