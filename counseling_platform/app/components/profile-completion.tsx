'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle, AlertCircle, MapPin, GraduationCap, Languages } from 'lucide-react';

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
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const SPECIALIZATIONS = [
  'Child Psychology',
  'Educational Psychology',
  'Clinical Psychology',
  'Counseling Psychology',
  'Social Work',
  'Child Development',
  'Family Therapy',
  'Trauma Counseling',
  'Behavioral Therapy',
  'Play Therapy',
  'School Counseling',
  'Mental Health',
  'Other'
];

const LANGUAGES = [
  'Hindi', 'English', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu',
  'Kannada', 'Malayalam', 'Punjabi', 'Odia', 'Assamese', 'Manipuri',
  'Konkani', 'Sanskrit', 'Urdu', 'Sindhi', 'Nepali', 'Bodo', 'Dogri',
  'Kashmiri', 'Santali', 'Maithili'
];

export default function ProfileCompletion() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [profileComplete, setProfileComplete] = useState(false);
  
  const [formData, setFormData] = useState<ProfileData>({
    name: '',
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

  // Check if profile is already complete
  useEffect(() => {
    if (session?.user) {
      checkProfileStatus();
    }
  }, [session]);

  const checkProfileStatus = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        if (userData.whatsappNumber && userData.state && userData.specialization && userData.college) {
          setProfileComplete(true);
        }
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setProfileComplete(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
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

  if (profileComplete) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Profile Complete
          </CardTitle>
          <CardDescription>
            Your profile has been completed successfully. You can now access all features of the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()} className="w-full">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

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
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Profile Updated Successfully!</h3>
              <p className="text-gray-600 mb-4">
                Your profile has been completed. You can now access all features of the application.
              </p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Continue to Dashboard
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">WhatsApp Number *</Label>
                    <Input
                      id="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                      placeholder="+91-9876543210"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Complete Address *</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter your complete address including street, area, etc."
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Educational & Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Educational & Professional Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="college">College/University *</Label>
                    <Input
                      id="college"
                      value={formData.college}
                      onChange={(e) => handleInputChange('college', e.target.value)}
                      placeholder="Enter your college or university name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization *</Label>
                    <Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALIZATIONS.map((spec) => (
                          <SelectItem key={spec} value={spec}>
                            {spec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Enter your city"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                  <Languages className="h-5 w-5" />
                  Preferred Languages
                </h3>
                
                <div className="space-y-2">
                  <Label>Select languages you can communicate in *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 border rounded-lg">
                    {LANGUAGES.map((language) => (
                      <div key={language} className="flex items-center space-x-2">
                        <Checkbox
                          id={language}
                          checked={formData.preferredLanguages.includes(language)}
                          onCheckedChange={() => handleLanguageToggle(language)}
                        />
                        <Label htmlFor={language} className="text-sm cursor-pointer">
                          {language}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {formData.preferredLanguages.length === 0 && (
                    <p className="text-sm text-red-500">Please select at least one language</p>
                  )}
                </div>
              </div>

              {/* Experience & Motivation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Experience & Motivation</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience *</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="Describe your experience working with children, counseling background, etc. (Minimum 20 characters)"
                    rows={3}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Minimum 20 characters. Describe your relevant experience.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivation">Motivation *</Label>
                  <Textarea
                    id="motivation"
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    placeholder="Explain why you want to volunteer and help children. (Minimum 20 characters)"
                    rows={3}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Minimum 20 characters. Explain your motivation for volunteering.
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || formData.preferredLanguages.length === 0}>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
} 