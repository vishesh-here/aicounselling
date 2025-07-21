'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ChildData {
  fullName: string;
  mothersName?: string;
  fathersName?: string;
  dateOfBirth: string;
  gender: string;
  currentCity?: string;
  state: string;
  educationType: string;
  currentSchoolCollegeName?: string;
  currentClassSemester?: string;
  whatsappNumber?: string;
  callingNumber?: string;
  parentGuardianContactNumber?: string;
  background: string;
  language: string;
  interests: string[];
  concerns: string[];
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export default function BulkImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ChildData[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [session, setSession] = useState<any>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Get session on component mount
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    await parseCSV(selectedFile);
  };

  // Proper CSV parser that handles quoted fields with commas
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Handle escaped quotes
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    
    if (lines.length === 0) return;
    
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
    
    const data: ChildData[] = [];
    const validationResults: ValidationResult[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = parseCSVLine(lines[i]);
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = (values[index] || '').replace(/"/g, '');
      });

      // Map spreadsheet columns to database fields
      const childData: ChildData = {
        fullName: row['Full Name'] || row['fullName'] || '',
        mothersName: row['Mother\'s Name'] || row['mothersName'] || '',
        fathersName: row['Father\'s Name'] || row['fathersName'] || '',
        dateOfBirth: convertDateFormat(row['DOB'] || row['dateOfBirth'] || ''),
        gender: (row['Gender'] || row['gender'] || '').toUpperCase(),
        currentCity: row['City'] || row['currentCity'] || '',
        state: row['State'] || row['state'] || 'Uttar Pradesh', // Default
        educationType: row['Education Type'] || row['educationType'] || 'School',
        currentSchoolCollegeName: row['School/College Name'] || row['currentSchoolCollegeName'] || '',
        currentClassSemester: row['Class/Semester'] || row['currentClassSemester'] || '',
        whatsappNumber: row['WhatsApp Number'] || row['whatsappNumber'] || '',
        callingNumber: row['Alternate Number'] || row['callingNumber'] || '',
        parentGuardianContactNumber: row['Parent/Guardian Number'] || row['parentGuardianContactNumber'] || '',
        background: row['Background'] || row['background'] || 'Student from local school',
        language: row['Language'] || row['language'] || 'Hindi',
        interests: [],
        concerns: []
      };

      data.push(childData);
      validationResults.push(validateChildData(childData, i));
    }

    setParsedData(data);
    setValidationResults(validationResults);
  };

  const convertDateFormat = (dateStr: string): string => {
    if (!dateStr) return '';
    
    // Handle DD/MM/YYYY format
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
      }
    }
    
    // Handle YYYY-MM-DD format
    if (dateStr.includes('-') && dateStr.length === 10) {
      return `${dateStr}T00:00:00.000Z`;
    }
    
    return dateStr;
  };

  const validateChildData = (data: ChildData, rowNumber: number): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required field validation
    if (!data.fullName) errors.push('Full Name is required');
    if (!data.dateOfBirth) errors.push('Date of Birth is required');
    if (!data.gender) errors.push('Gender is required');
    if (!data.state) errors.push('State is required');
    if (!data.educationType) errors.push('Education Type is required');
    if (!data.background) errors.push('Background is required');
    if (!data.language) errors.push('Language is required');

    // Age validation
    if (data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 5 || age > 20) {
        errors.push(`Child must be between 5 and 20 years old (age: ${age})`);
      }
    }

    // Gender validation
    if (data.gender && !['MALE', 'FEMALE'].includes(data.gender)) {
      errors.push('Gender must be MALE or FEMALE');
    }

    // Warnings
    if (!data.mothersName && !data.fathersName) {
      warnings.push('No parent name provided');
    }
    if (!data.currentCity) {
      warnings.push('City not specified');
    }
    if (!data.whatsappNumber && !data.callingNumber && !data.parentGuardianContactNumber) {
      warnings.push('No contact number provided');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const handleDownloadTemplate = () => {
    const csvContent = `Full Name,Mother's Name,Father's Name,DOB,Gender,City,School/College Name,Class/Semester,WhatsApp Number,Alternate Number/Guardian Number
Deep Singh,Kalpna Singh,Mr. Virendra Sing,02/06/2011,Male,Obra,Saraswati Vidya,9th,6304866255,6367866255
Naina Modamwa,Mamta Devi,Mr. Deepak Mod,08/09/2010,Female,Obra,Saraswati Vidya,9th,6306345033,6306345033
Astha Kumari,Mrs. Chanda De,Mr. Rajesh Kuma,10/03/2009,Female,Obra,Raja Narendra S,12th,8400065191,8400065199`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'children-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleBulkImport = async () => {
    setIsUploading(true);
    setUploadResult(null);

    try {
      const validData = parsedData.filter((_, index) => validationResults[index].isValid);
      
      if (validData.length === 0) {
        setUploadResult({ success: 0, errors: ['No valid data to import'] });
        return;
      }

      if (!session?.access_token) {
        setUploadResult({ 
          success: 0, 
          errors: ['No valid session. Please log in again.'] 
        });
        return;
      }

      const response = await fetch('/api/children/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ children: validData })
      });

      const result = await response.json();

      if (response.ok) {
        setUploadResult({ 
          success: result.successCount, 
          errors: result.errors || [] 
        });
      } else {
        setUploadResult({ 
          success: 0, 
          errors: [result.error || 'Import failed'] 
        });
      }
    } catch (error) {
      setUploadResult({ 
        success: 0, 
        errors: ['Network error during import'] 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const totalValid = validationResults.filter(r => r.isValid).length;
  const totalInvalid = validationResults.filter(r => !r.isValid).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Import Children</h1>
          <p className="text-muted-foreground">
            Upload a CSV file to import multiple children at once
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Upload a CSV file with the following columns: Full Name, Mother's Name, Father's Name, DOB, Gender, City, School/College Name, Class/Semester, WhatsApp Number, Alternate Number, Parent/Guardian Number. 
            <strong>Note:</strong> Fields containing commas should be enclosed in quotes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>CSV Format Tips:</strong> If any field contains commas (like school names), 
              enclose the entire field in quotes. Example: <code>"Raja Narendra Singh Kushwaha Intermediate College, Kurhul, Chopan"</code>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Field Mapping Reference</CardTitle>
          <CardDescription>
            This table shows how CSV columns map to database fields and display names
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CSV Column</TableHead>
                <TableHead>Database Field</TableHead>
                <TableHead>Display Name</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">Full Name</TableCell>
                <TableCell className="font-mono text-sm">fullName</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>Child's complete name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">Mother's Name</TableCell>
                <TableCell className="font-mono text-sm">mothersName</TableCell>
                <TableCell>Mother's Name</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>Mother's full name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">Father's Name</TableCell>
                <TableCell className="font-mono text-sm">fathersName</TableCell>
                <TableCell>Father's Name</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>Father's full name</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">DOB</TableCell>
                <TableCell className="font-mono text-sm">dateOfBirth</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>Format: DD/MM/YYYY or YYYY-MM-DD</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">Gender</TableCell>
                <TableCell className="font-mono text-sm">gender</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>MALE or FEMALE</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">City</TableCell>
                <TableCell className="font-mono text-sm">currentCity</TableCell>
                <TableCell>City</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>Current city of residence</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">State</TableCell>
                <TableCell className="font-mono text-sm">state</TableCell>
                <TableCell>State</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>Default: Uttar Pradesh</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">Education Type</TableCell>
                <TableCell className="font-mono text-sm">educationType</TableCell>
                <TableCell>Education Type</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>Default: School</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">School/College Name</TableCell>
                <TableCell className="font-mono text-sm">currentSchoolCollegeName</TableCell>
                <TableCell>School/College Name</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>Use quotes if contains commas</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">Class/Semester</TableCell>
                <TableCell className="font-mono text-sm">currentClassSemester</TableCell>
                <TableCell>Class/Semester</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>e.g., 9th, 12th, 1st Year</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">WhatsApp Number</TableCell>
                <TableCell className="font-mono text-sm">whatsappNumber</TableCell>
                <TableCell>WhatsApp Number</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>10-digit mobile number</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">Alternate Number</TableCell>
                <TableCell className="font-mono text-sm">callingNumber</TableCell>
                <TableCell>Calling Number</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>Alternative contact number</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">Parent/Guardian Number</TableCell>
                <TableCell className="font-mono text-sm">parentGuardianContactNumber</TableCell>
                <TableCell>Parent/Guardian Contact</TableCell>
                <TableCell><Badge variant="secondary">Optional</Badge></TableCell>
                <TableCell>Parent or guardian contact</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">Background</TableCell>
                <TableCell className="font-mono text-sm">background</TableCell>
                <TableCell>Background</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>Default: Student from local school</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">Language</TableCell>
                <TableCell className="font-mono text-sm">language</TableCell>
                <TableCell>Language</TableCell>
                <TableCell><Badge variant="destructive">Required</Badge></TableCell>
                <TableCell>Default: Hindi</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Import Preview</CardTitle>
            <CardDescription>
              {totalValid} valid records, {totalInvalid} invalid records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4 items-center justify-between">
                <div className="flex gap-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    {totalValid} Valid
                  </Badge>
                  {totalInvalid > 0 && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <XCircle className="h-3 w-3" />
                      {totalInvalid} Invalid
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailedView(!showDetailedView)}
                  className="flex items-center gap-2"
                >
                  {showDetailedView ? 'Hide' : 'Show'} Detailed View
                  {showDetailedView ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsedData.map((child, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{child.fullName}</TableCell>
                      <TableCell>
                        {child.dateOfBirth ? 
                          Math.floor((Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {child.gender}
                        </Badge>
                      </TableCell>
                      <TableCell>{child.currentCity || 'Not specified'}</TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          {child.whatsappNumber && (
                            <div className="flex items-center gap-1">
                              <span className="text-green-600">📱</span>
                              <span className="font-mono">{child.whatsappNumber}</span>
                            </div>
                          )}
                          {child.callingNumber && (
                            <div className="flex items-center gap-1">
                              <span className="text-blue-600">📞</span>
                              <span className="font-mono">{child.callingNumber}</span>
                            </div>
                          )}
                          {child.parentGuardianContactNumber && (
                            <div className="flex items-center gap-1">
                              <span className="text-purple-600">👥</span>
                              <span className="font-mono">{child.parentGuardianContactNumber}</span>
                            </div>
                          )}
                          {!child.whatsappNumber && !child.callingNumber && !child.parentGuardianContactNumber && (
                            <span className="text-muted-foreground">No contact info</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {validationResults[index].isValid ? (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Valid
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Invalid
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {validationResults[index].errors.map((error, i) => (
                            <div key={i} className="text-xs text-red-600">{error}</div>
                          ))}
                          {validationResults[index].warnings.map((warning, i) => (
                            <div key={i} className="text-xs text-yellow-600">{warning}</div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {showDetailedView && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Detailed Field Mapping Preview</h4>
                  <div className="space-y-3">
                    {parsedData.map((child, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-sm">Row {index + 1}: {child.fullName}</h5>
                          <Badge variant={validationResults[index].isValid ? "outline" : "destructive"} className="text-xs">
                            {validationResults[index].isValid ? "Valid" : "Invalid"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="font-medium text-muted-foreground">Full Name:</span>
                            <div className="font-mono mt-1">{child.fullName || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Mother's Name:</span>
                            <div className="font-mono mt-1">{child.mothersName || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Father's Name:</span>
                            <div className="font-mono mt-1">{child.fathersName || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Date of Birth:</span>
                            <div className="font-mono mt-1">{child.dateOfBirth ? new Date(child.dateOfBirth).toLocaleDateString() : 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Gender:</span>
                            <div className="font-mono mt-1">{child.gender || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">City:</span>
                            <div className="font-mono mt-1">{child.currentCity || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">State:</span>
                            <div className="font-mono mt-1">{child.state || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Education Type:</span>
                            <div className="font-mono mt-1">{child.educationType || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">School/College:</span>
                            <div className="font-mono mt-1">{child.currentSchoolCollegeName || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Class/Semester:</span>
                            <div className="font-mono mt-1">{child.currentClassSemester || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">WhatsApp Number:</span>
                            <div className="font-mono mt-1">{child.whatsappNumber || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Calling Number:</span>
                            <div className="font-mono mt-1">{child.callingNumber || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Parent/Guardian Contact:</span>
                            <div className="font-mono mt-1">{child.parentGuardianContactNumber || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Background:</span>
                            <div className="font-mono mt-1">{child.background || 'Not provided'}</div>
                          </div>
                          <div>
                            <span className="font-medium text-muted-foreground">Language:</span>
                            <div className="font-mono mt-1">{child.language || 'Not provided'}</div>
                          </div>
                        </div>
                        {(validationResults[index].errors.length > 0 || validationResults[index].warnings.length > 0) && (
                          <div className="mt-3 pt-3 border-t">
                            {validationResults[index].errors.length > 0 && (
                              <div className="mb-2">
                                <span className="text-xs font-medium text-red-600">Errors:</span>
                                <div className="space-y-1 mt-1">
                                  {validationResults[index].errors.map((error, i) => (
                                    <div key={i} className="text-xs text-red-600">• {error}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {validationResults[index].warnings.length > 0 && (
                              <div>
                                <span className="text-xs font-medium text-yellow-600">Warnings:</span>
                                <div className="space-y-1 mt-1">
                                  {validationResults[index].warnings.map((warning, i) => (
                                    <div key={i} className="text-xs text-yellow-600">• {warning}</div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {totalValid > 0 && (
                <Button 
                  onClick={handleBulkImport} 
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Upload className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import {totalValid} Children
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {uploadResult && (
        <Alert className={uploadResult.success > 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          {uploadResult.success > 0 ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>
            {uploadResult.success > 0 ? (
              <span className="text-green-800">
                Successfully imported {uploadResult.success} children!
              </span>
            ) : (
              <span className="text-red-800">
                Import failed: {uploadResult.errors.join(', ')}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 