'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, Plus, X, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabaseClient';

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

const COMMON_CONCERNS = [
  "Financial difficulties", "Family problems", "Academic pressure", "Peer pressure",
  "Low self-esteem", "Social isolation", "Health issues", "Learning difficulties",
  "Language barriers", "Lack of resources", "Transportation issues", "Safety concerns"
];

interface FormData {
  fullName: string;
  mothersName: string;
  fathersName: string;
  dateOfBirth: string;
  gender: string;
  currentCity: string;
  state: string;
  educationType: string;
  currentSchoolCollegeName: string;
  currentClassSemester: string;
  whatsappNumber: string;
  callingNumber: string;
  parentGuardianContactNumber: string;
  background: string;
  interests: string[];
  concerns: string[];
  language: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function AddChildPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mothersName: '',
    fathersName: '',
    dateOfBirth: '',
    gender: '',
    currentCity: '',
    state: '',
    educationType: '',
    currentSchoolCollegeName: '',
    currentClassSemester: '',
    whatsappNumber: '',
    callingNumber: '',
    parentGuardianContactNumber: '',
    background: '',
    interests: [],
    concerns: [],
    language: 'Hindi'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [newConcern, setNewConcern] = useState('');
  const [session, setSession] = useState<any>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);

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

  const userRole = session?.user?.user_metadata?.role || session?.user?.app_metadata?.role;
  if (userRole !== 'ADMIN') {
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 5 || age > 18) {
        newErrors.dateOfBirth = 'Child must be between 5 and 18 years old';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }

    if (!formData.currentCity?.trim()) {
      newErrors.currentCity = 'Current city is required';
    }

    if (!formData.state) {
      newErrors.state = 'Please select state';
    }

    if (!formData.educationType) {
      newErrors.educationType = 'Please select education type';
    }

    if (!formData.currentSchoolCollegeName?.trim()) {
      newErrors.currentSchoolCollegeName = 'School/College name is required';
    }

    if (!formData.currentClassSemester?.trim()) {
      newErrors.currentClassSemester = 'Current class/semester is required';
    }

    if (!formData.parentGuardianContactNumber?.trim()) {
      newErrors.parentGuardianContactNumber = 'Parent/Guardian contact number is required';
    }

    if (!formData.background?.trim()) {
      newErrors.background = 'Background information is required';
    }

    // Interests and concerns are now optional
    // if (formData.interests.length === 0) {
    //   newErrors.interests = 'Please add at least one interest';
    // }

    // if (formData.concerns.length === 0) {
    //   newErrors.concerns = 'Please add at least one concern';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  type FormDataField = keyof FormData;
  type FormDataValue = string | string[];
  const handleInputChange = (field: FormDataField, value: FormDataValue) => {
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

  const addConcern = (concern: string) => {
    if (concern.trim() && !formData.concerns.includes(concern.trim())) {
      handleInputChange('concerns', [...formData.concerns, concern.trim()]);
      setNewConcern('');
    }
  };

  const removeConcern = (concern: string) => {
    handleInputChange('concerns', formData.concerns.filter(c => c !== concern));
  };

  const handleFileUpload = async () => {
    if (!uploadFile) return;

    setUploading(true);
    setUploadResults(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await fetch('/api/children/bulk-upload', {
        method: 'POST',
        headers: {
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadResults(result);
        setUploadFile(null);
        // Reset file input
        const fileInput = document.getElementById('csvFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setUploadResults({ error: result.error });
      }
    } catch (error) {
      setUploadResults({ error: 'Failed to upload file' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const now = new Date().toISOString();
      const payload = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        interests: formData.interests,
        concerns: formData.concerns,
        isActive: true,
        createdAt: now,
        updatedAt: now
      };
      const response = await fetch('/api/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok) {
        router.push('/children?message=child-added');
      } else if (result.errors) {
        setErrors(result.errors);
      } else if (result.error) {
        setErrors({ general: result.error });
      } else {
        setErrors({ general: 'Failed to add child profile' });
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Child Profile</h1>
          <p className="text-gray-600">Create a comprehensive profile for a new child in the program</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowBulkUpload(!showBulkUpload)}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {showBulkUpload ? 'Hide' : 'Show'} Bulk Upload
        </Button>
      </div>

      {showBulkUpload && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bulk Upload via CSV</CardTitle>
            <CardDescription>
              Upload multiple child profiles using a CSV file. Download the template below for the correct format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                             <div className="flex gap-4">
                 <Button variant="outline" onClick={() => {
                   const csvContent = `fullName,mothersName,fathersName,dateOfBirth,gender,currentCity,state,educationType,currentSchoolCollegeName,currentClassSemester,whatsappNumber,callingNumber,parentGuardianContactNumber,background,interests,concerns,language
 "John Doe","Jane Doe","John Doe Sr.","2010-05-15","MALE","Mumbai","Maharashtra","School","ABC School","Class 8","9876543210","9876543210","9876543210","Single parent family","Sports,Reading","Academic pressure","English"`
                   const blob = new Blob([csvContent], { type: 'text/csv' });
                   const url = window.URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   a.download = 'child_profiles_template.csv';
                   a.click();
                 }}>
                   Download Template
                 </Button>
                 <div className="flex gap-2">
                   <Input
                     id="csvFile"
                     type="file"
                     accept=".csv"
                     onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                     className="max-w-xs"
                   />
                   <Button 
                     variant="outline" 
                     onClick={handleFileUpload}
                     disabled={!uploadFile || uploading}
                   >
                     {uploading ? (
                       <>
                         <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                         Uploading...
                       </>
                     ) : (
                       <>
                         <Upload className="h-4 w-4 mr-2" />
                         Upload CSV
                       </>
                     )}
                   </Button>
                 </div>
               </div>
                             <p className="text-sm text-gray-600">
                 <strong>Required fields:</strong> fullName, dateOfBirth, gender, currentCity, state, educationType, currentSchoolCollegeName, currentClassSemester, parentGuardianContactNumber, background, language<br/>
                 <strong>Optional fields:</strong> mothersName, fathersName, whatsappNumber, callingNumber, interests, concerns<br/>
                 <strong>Date format:</strong> YYYY-MM-DD (e.g., 2010-05-15)<br/>
                 <strong>Arrays:</strong> Separate multiple values with commas (e.g., "Sports,Reading")
               </p>

               {uploadResults && (
                 <div className="mt-4">
                   {uploadResults.error ? (
                     <Alert variant="destructive">
                       <AlertCircle className="h-4 w-4" />
                       <AlertDescription>{uploadResults.error}</AlertDescription>
                     </Alert>
                   ) : (
                     <Alert>
                       <AlertDescription>
                         <div className="font-semibold">{uploadResults.message}</div>
                         {uploadResults.results && (
                           <div className="mt-2 text-sm">
                             <div>✅ Successfully added: {uploadResults.results.successful}</div>
                             <div>❌ Failed: {uploadResults.results.failed}</div>
                             {uploadResults.results.errors && uploadResults.results.errors.length > 0 && (
                               <div className="mt-2">
                                 <div className="font-medium">Errors:</div>
                                 <ul className="list-disc list-inside text-xs">
                                   {uploadResults.results.errors.slice(0, 5).map((error: string, index: number) => (
                                     <li key={index}>{error}</li>
                                   ))}
                                   {uploadResults.results.errors.length > 5 && (
                                     <li>... and {uploadResults.results.errors.length - 5} more errors</li>
                                   )}
                                 </ul>
                               </div>
                             )}
                           </div>
                         )}
                       </AlertDescription>
                     </Alert>
                   )}
                 </div>
               )}
            </div>
          </CardContent>
        </Card>
      )}

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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter child's full name"
                    className={errors.fullName ? 'border-red-500' : ''}
                  />
                  {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mothersName">Mother's Name</Label>
                  <Input
                    id="mothersName"
                    type="text"
                    value={formData.mothersName}
                    onChange={(e) => handleInputChange('mothersName', e.target.value)}
                    placeholder="Enter mother's name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fathersName">Father's Name</Label>
                  <Input
                    id="fathersName"
                    type="text"
                    value={formData.fathersName}
                    onChange={(e) => handleInputChange('fathersName', e.target.value)}
                    placeholder="Enter father's name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={errors.dateOfBirth ? 'border-red-500' : ''}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
                </div>

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
                  <Label htmlFor="currentCity">Current City *</Label>
                  <Input
                    id="currentCity"
                    type="text"
                    value={formData.currentCity}
                    onChange={(e) => handleInputChange('currentCity', e.target.value)}
                    placeholder="Enter current city"
                    className={errors.currentCity ? 'border-red-500' : ''}
                  />
                  {errors.currentCity && <p className="text-sm text-red-500">{errors.currentCity}</p>}
                </div>

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
              </div>
            </div>

            {/* Educational Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Educational Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="educationType">Are you in School or College? *</Label>
                  <Select value={formData.educationType} onValueChange={(value) => handleInputChange('educationType', value)}>
                    <SelectTrigger className={errors.educationType ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select education type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="School">School</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.educationType && <p className="text-sm text-red-500">{errors.educationType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentSchoolCollegeName">Current School/College Name *</Label>
                  <Input
                    id="currentSchoolCollegeName"
                    type="text"
                    value={formData.currentSchoolCollegeName}
                    onChange={(e) => handleInputChange('currentSchoolCollegeName', e.target.value)}
                    placeholder="Enter school/college name"
                    className={errors.currentSchoolCollegeName ? 'border-red-500' : ''}
                  />
                  {errors.currentSchoolCollegeName && <p className="text-sm text-red-500">{errors.currentSchoolCollegeName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentClassSemester">Current Class/Semester *</Label>
                  <Input
                    id="currentClassSemester"
                    type="text"
                    value={formData.currentClassSemester}
                    onChange={(e) => handleInputChange('currentClassSemester', e.target.value)}
                    placeholder="e.g., Class 8, Semester 2"
                    className={errors.currentClassSemester ? 'border-red-500' : ''}
                  />
                  {errors.currentClassSemester && <p className="text-sm text-red-500">{errors.currentClassSemester}</p>}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <Input
                    id="whatsappNumber"
                    type="tel"
                    value={formData.whatsappNumber}
                    onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                    placeholder="Enter WhatsApp number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callingNumber">Calling Number (if different)</Label>
                  <Input
                    id="callingNumber"
                    type="tel"
                    value={formData.callingNumber}
                    onChange={(e) => handleInputChange('callingNumber', e.target.value)}
                    placeholder="Enter calling number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="parentGuardianContactNumber">Parent/Guardian Contact Number *</Label>
                  <Input
                    id="parentGuardianContactNumber"
                    type="tel"
                    value={formData.parentGuardianContactNumber}
                    onChange={(e) => handleInputChange('parentGuardianContactNumber', e.target.value)}
                    placeholder="Enter parent/guardian number"
                    className={errors.parentGuardianContactNumber ? 'border-red-500' : ''}
                  />
                  {errors.parentGuardianContactNumber && <p className="text-sm text-red-500">{errors.parentGuardianContactNumber}</p>}
                </div>
              </div>
            </div>

            {/* Background Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Background Information</h3>
              
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
              <h3 className="text-lg font-medium text-gray-900">Interests (Optional)</h3>
              
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
            </div>

            {/* Concerns */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Concerns (Optional)</h3>
              <div className="space-y-2">
                <Label>Add Concerns</Label>
                <div className="flex gap-2">
                  <Input
                    value={newConcern}
                    onChange={(e) => setNewConcern(e.target.value)}
                    placeholder="Type a concern..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addConcern(newConcern);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={() => addConcern(newConcern)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Common Concerns (click to add)</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CONCERNS.map(concern => (
                    <Badge
                      key={concern}
                      variant={formData.concerns.includes(concern) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => addConcern(concern)}
                    >
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
              {formData.concerns.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Concerns</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.concerns.map(concern => (
                      <Badge key={concern} variant="destructive" className="flex items-center gap-1">
                        {concern}
                        <button
                          type="button"
                          onClick={() => removeConcern(concern)}
                          className="ml-1 hover:text-red-300"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
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
