"use client";
import { Sidebar } from "@/components/layout/sidebar";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileData {
  name: string;
  whatsappNumber: string;
  address: string;
  college: string;
  specialization: string;
  city: string;
  state: string;
  preferredLanguages: string[];
  experience: string;
  motivation: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh'
];

const SPECIALIZATIONS = [
  'Child Psychology', 'Educational Psychology', 'Counseling Psychology', 'Clinical Psychology',
  'Social Work', 'Special Education', 'Family Therapy', 'Behavioral Therapy', 'Art Therapy',
  'Play Therapy', 'Trauma Counseling', 'Learning Disabilities', 'Autism Spectrum Disorders',
  'ADHD', 'Anxiety Disorders', 'Depression', 'Behavioral Issues', 'Academic Counseling',
  'Career Guidance', 'Life Skills Training'
];

const LANGUAGES = [
  'Hindi', 'English', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam',
  'Punjabi', 'Urdu', 'Assamese', 'Odia', 'Rajasthani', 'Bhojpuri', 'Maithili', 'Sanskrit'
];

function ProfileCompletionForm({ user, onComplete }: { user: any, onComplete: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<ProfileData>({
    name: user?.user_metadata?.name || user?.email?.split('@')[0] || '',
    whatsappNumber: '',
    address: '',
    college: '',
    specialization: '',
    city: '',
    state: '',
    preferredLanguages: [],
    experience: '',
    motivation: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Submitting profile for user:', user.id);
      console.log('Form data:', formData);
      
      const response = await fetch('/api/user/profile-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profileData: {
            email: user.email,
            name: formData.name,
            role: user.user_metadata?.role || 'VOLUNTEER',
            whatsappNumber: formData.whatsappNumber,
            address: formData.address,
            college: formData.college,
            specialization: formData.specialization,
            city: formData.city,
            state: formData.state,
            preferredLanguages: formData.preferredLanguages,
            experience: formData.experience,
            motivation: formData.motivation
          }
        }),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      console.log('Profile updated successfully');
      onComplete();
    } catch (error: any) {
      console.error('Profile submission error:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      preferredLanguages: prev.preferredLanguages.includes(language)
        ? prev.preferredLanguages.filter(l => l !== language)
        : [...prev.preferredLanguages, language]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Please provide your complete details to access all features of the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                  placeholder="+91-9876543210"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="address">Complete Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="House/Flat No., Street, Area, Pin Code"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="college">College/University *</Label>
                <Input
                  id="college"
                  value={formData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="state">State *</Label>
                <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="specialization">Area of Specialization *</Label>
                <Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZATIONS.map((spec) => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label>Preferred Languages for Counseling *</Label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                {LANGUAGES.map((language) => (
                  <div key={language} className="flex items-center space-x-2">
                    <Checkbox
                      id={language}
                      checked={formData.preferredLanguages.includes(language)}
                      onCheckedChange={() => handleLanguageToggle(language)}
                    />
                    <Label htmlFor={language} className="text-sm">{language}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="experience">Experience & Qualifications *</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                placeholder="Describe your educational background, certifications, and relevant experience..."
                rows={4}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="motivation">Motivation & Goals *</Label>
              <Textarea
                id="motivation"
                value={formData.motivation}
                onChange={(e) => handleInputChange('motivation', e.target.value)}
                placeholder="What motivates you to work with children? What are your goals as a volunteer counselor?"
                rows={4}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Profile...
                </>
              ) : (
                'Complete Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastProfileCheck, setLastProfileCheck] = useState<number>(0);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      if (data.session?.user) {
        setUser(data.session.user);
        await checkProfileStatus(data.session.user);
      } else {
        setLoading(false);
      }
    };
    
    getSession();
    
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser(session.user);
        await checkProfileStatus(session.user);
      } else {
        setLoading(false);
      }
    });
    
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const checkProfileStatus = async (user: any) => {
    // Cache profile check for 30 seconds to prevent repeated calls
    const now = Date.now();
    if (now - lastProfileCheck < 30000) { // 30 seconds
      console.log('Skipping profile check - cached result still valid');
      return;
    }

    try {
      console.log('Checking profile for user:', user.id);
      setLastProfileCheck(now);
      
      const response = await fetch(`/api/user/profile-simple?userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      console.log('Profile check response:', result);

      if (!response.ok) {
        console.error('Error checking profile:', result.error);
        setProfileComplete(false);
      } else if (!result.user) {
        // User doesn't exist in users table
        console.log('User not found in users table');
        setProfileComplete(false);
      } else {
        console.log('User found:', result.user);
        // Check if profile is complete
        const userData = result.user;
        const isComplete = !!(
          userData.whatsappNumber &&
          userData.address &&
          userData.college &&
          userData.specialization &&
          userData.city &&
          userData.state &&
          userData.preferredLanguages &&
          userData.preferredLanguages.length > 0 &&
          userData.experience &&
          userData.motivation
        );
        
        console.log('Profile completion check:', {
          whatsappNumber: !!userData.whatsappNumber,
          address: !!userData.address,
          college: !!userData.college,
          specialization: !!userData.specialization,
          city: !!userData.city,
          state: !!userData.state,
          preferredLanguages: userData.preferredLanguages?.length > 0,
          experience: !!userData.experience,
          motivation: !!userData.motivation,
          isComplete
        });
        
        setProfileComplete(isComplete);
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
      setProfileComplete(false);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileComplete = () => {
    setProfileComplete(true);
    setLastProfileCheck(0); // Reset cache to force recheck
  };

  // Show loading while checking session and profile
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show profile completion if profile is incomplete
  if (user && profileComplete === false) {
    return <ProfileCompletionForm user={user} onComplete={handleProfileComplete} />;
  }

  // Show the actual app content if profile is complete
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
