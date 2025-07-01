'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, Plus, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
];

const LANGUAGES = [
  "Hindi", "English", "Bengali", "Telugu", "Marathi", "Tamil", "Gujarati", "Urdu",
  "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Maithili", "Sanskrit",
  "Nepali", "Konkani", "Manipuri", "Bodo", "Dogri", "Kashmiri", "Santali"
];

const COMMON_INTERESTS = [
  "Sports", "Cricket", "Football", "Drawing", "Singing", "Dancing", "Reading",
  "Mathematics", "Science", "Technology", "Computers", "Video Games", "Music",
  "Art", "Cooking", "Gardening", "Animals", "Nature", "Movies", "Stories"
];

const COMMON_CHALLENGES = [
  "Financial difficulties", "Family problems", "Academic pressure", "Peer pressure",
  "Low self-esteem", "Social isolation", "Health issues", "Learning difficulties",
  "Language barriers", "Lack of resources", "Transportation issues", "Safety concerns"
];

interface FormData {
  name: string;
  age: string;
  gender: string;
  state: string;
  district: string;
  background: string;
  schoolLevel: string;
  interests: string[];
  challenges: string[];
  language: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function AddChildPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    gender: '',
    state: '',
    district: '',
    background: '',
    schoolLevel: '',
    interests: [],
    challenges: [],
    language: 'Hindi'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [newChallenge, setNewChallenge] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Child name is required';
    }

    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else {
      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 5 || ageNum > 18) {
        newErrors.age = 'Age must be between 5 and 18 years';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }

    if (!formData.state) {
      newErrors.state = 'Please select state';
    }

    if (!formData.district?.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.background?.trim()) {
      newErrors.background = 'Background information is required';
    }

    if (!formData.schoolLevel?.trim()) {
      newErrors.schoolLevel = 'School level is required';
    }

    if (formData.interests.length === 0) {
      newErrors.interests = 'Please add at least one interest';
    }

    if (formData.challenges.length === 0) {
      newErrors.challenges = 'Please add at least one challenge';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addInterest = (interest: string) => {
    if (interest.trim() && !formData.interests.includes(interest.trim())) {
      handleInputChange('interests', [...formData.interests, interest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    handleInputChange('interests', formData.interests.filter(i => i !== interest));
  };

  const addChallenge = (challenge: string) => {
    if (challenge.trim() && !formData.challenges.includes(challenge.trim())) {
      handleInputChange('challenges', [...formData.challenges, challenge.trim()]);
      setNewChallenge('');
    }
  };

  const removeChallenge = (challenge: string) => {
    handleInputChange('challenges', formData.challenges.filter(c => c !== challenge));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          age: parseInt(formData.age),
          gender: formData.gender,
          state: formData.state,
          district: formData.district.trim(),
          background: formData.background.trim(),
          schoolLevel: formData.schoolLevel.trim(),
          interests: formData.interests,
          challenges: formData.challenges,
          language: formData.language
        })
      });

      const result = await response.json();

      if (response.ok) {
        router.push('/children?message=child-added');
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ general: result.error || 'Failed to add child profile' });
        }
      }
    } catch (error) {
      console.error('Add child error:', error);
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to add child profiles. Only administrators can perform this action.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Child Profile</h1>
        <p className="text-gray-600">Create a comprehensive profile for a new child in the program</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Child Information</CardTitle>
          <CardDescription>
            Please fill out all the required information to create a complete profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter child's full name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="5"
                    max="18"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Enter age (5-18)"
                    className={errors.age ? 'border-red-500' : ''}
                  />
                  {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language *</Label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Location</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDIAN_STATES.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleInputChange('district', e.target.value)}
                    placeholder="Enter district name"
                    className={errors.district ? 'border-red-500' : ''}
                  />
                  {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                </div>
              </div>
            </div>

            {/* Educational Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Educational Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolLevel">School Level *</Label>
                  <Input
                    id="schoolLevel"
                    type="text"
                    value={formData.schoolLevel}
                    onChange={(e) => handleInputChange('schoolLevel', e.target.value)}
                    placeholder="e.g., Class 8, Class 10, etc."
                    className={errors.schoolLevel ? 'border-red-500' : ''}
                  />
                  {errors.schoolLevel && <p className="text-sm text-red-500">{errors.schoolLevel}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background">Background Information *</Label>
                <Textarea
                  id="background"
                  value={formData.background}
                  onChange={(e) => handleInputChange('background', e.target.value)}
                  placeholder="Provide information about family background, economic situation, etc."
                  rows={3}
                  className={errors.background ? 'border-red-500' : ''}
                />
                {errors.background && <p className="text-sm text-red-500">{errors.background}</p>}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Interests *</h3>
              
              <div className="space-y-2">
                <Label>Add Interests</Label>
                <div className="flex gap-2">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    placeholder="Type an interest..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addInterest(newInterest);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addInterest(newInterest)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Common Interests (click to add)</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_INTERESTS.map(interest => (
                    <Badge
                      key={interest}
                      variant={formData.interests.includes(interest) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => addInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {formData.interests.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Interests</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map(interest => (
                      <Badge key={interest} variant="default" className="flex items-center gap-1">
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="ml-1 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {errors.interests && <p className="text-sm text-red-500">{errors.interests}</p>}
            </div>

            {/* Challenges */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Challenges *</h3>
              
              <div className="space-y-2">
                <Label>Add Challenges</Label>
                <div className="flex gap-2">
                  <Input
                    value={newChallenge}
                    onChange={(e) => setNewChallenge(e.target.value)}
                    placeholder="Type a challenge..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChallenge(newChallenge);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addChallenge(newChallenge)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Common Challenges (click to add)</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CHALLENGES.map(challenge => (
                    <Badge
                      key={challenge}
                      variant={formData.challenges.includes(challenge) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => addChallenge(challenge)}
                    >
                      {challenge}
                    </Badge>
                  ))}
                </div>
              </div>

              {formData.challenges.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Challenges</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.challenges.map(challenge => (
                      <Badge key={challenge} variant="destructive" className="flex items-center gap-1">
                        {challenge}
                        <button
                          type="button"
                          onClick={() => removeChallenge(challenge)}
                          className="ml-1 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {errors.challenges && <p className="text-sm text-red-500">{errors.challenges}</p>}
            </div>

            {/* Error Display */}
            {errors.general && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding Child...
                  </>
                ) : (
                  'Add Child Profile'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
