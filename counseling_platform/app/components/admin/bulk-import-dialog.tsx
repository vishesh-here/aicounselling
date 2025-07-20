"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Upload, FileText, Heart, BookOpen, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface BulkImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface ParsedResource {
  title: string;
  summary: string;
  content: string;
  type: 'knowledge_base' | 'cultural_story';
  category: string;
  subCategory?: string;
  source?: string;
  themes?: string[];
  tags?: string[];
  applicableFor?: string[];
}

export function BulkImportDialog({ 
  isOpen, 
  onClose, 
  onImportComplete 
}: BulkImportDialogProps) {
  const [inputText, setInputText] = useState("");
  const [parsedResources, setParsedResources] = useState<ParsedResource[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const parseInput = () => {
    if (!inputText.trim()) {
      toast.error("Please enter some content to parse");
      return;
    }

    try {
      const resources: ParsedResource[] = [];
      const sections = inputText.split(/\n\s*---\s*\n/).filter(section => section.trim());

      sections.forEach((section, index) => {
        const lines = section.split('\n').filter(line => line.trim());
        if (lines.length < 3) return; // Need at least title, summary, and content

        const resource: ParsedResource = {
          title: "",
          summary: "",
          content: "",
          type: 'cultural_story',
          category: "CULTURAL_WISDOM",
          themes: [],
          tags: [],
          applicableFor: []
        };

        let currentField = "";
        let contentLines: string[] = [];

        lines.forEach((line, lineIndex) => {
          const trimmedLine = line.trim();
          
          if (lineIndex === 0) {
            // First line is title
            resource.title = trimmedLine;
          } else if (lineIndex === 1) {
            // Second line is summary
            resource.summary = trimmedLine;
          } else if (trimmedLine.startsWith('**')) {
            // Parse metadata fields
            const fieldMatch = trimmedLine.match(/\*\*(\w+):\*\*\s*(.+)/);
            if (fieldMatch) {
              const [, field, value] = fieldMatch;
              currentField = field.toLowerCase();
              
              switch (currentField) {
                case 'type':
                  resource.type = value.toLowerCase() === 'story' ? 'cultural_story' : 'knowledge_base';
                  break;
                case 'category':
                  resource.category = value.toUpperCase().replace(/\s+/g, '_');
                  break;
                case 'subcategory':
                  resource.subCategory = value;
                  break;
                case 'source':
                  resource.source = value.toUpperCase().replace(/\s+/g, '_');
                  break;
                case 'themes':
                  resource.themes = value.split(',').map(t => t.trim());
                  break;
                case 'tags':
                  resource.tags = value.split(',').map(t => t.trim());
                  break;
                case 'applicablefor':
                  resource.applicableFor = value.split(',').map(t => t.trim());
                  break;
              }
            }
          } else {
            // Everything else is content (but skip if it's just the type line)
            if (!trimmedLine.startsWith('Type: ')) {
              contentLines.push(line);
            }
          }
        });

        resource.content = contentLines.join('\n').trim();
        
        if (resource.title && resource.summary && resource.content) {
          resources.push(resource);
        }
      });

      setParsedResources(resources);
      toast.success(`Parsed ${resources.length} resources successfully!`);
    } catch (error) {
      toast.error("Error parsing input. Please check the format.");
    }
  };

  const importResources = async () => {
    if (parsedResources.length === 0) {
      toast.error("No resources to import");
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Get access token
      let accessToken = null;
      try {
        const projectRef = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
        if (projectRef) {
          accessToken = JSON.parse(localStorage.getItem(projectRef) || '{}').access_token;
        }
      } catch (err) {}

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) {
        headers["Authorization"] = `Bearer ${accessToken}`;
      }

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < parsedResources.length; i++) {
        const resource = parsedResources[i];
        
        try {
          const response = await fetch('/api/admin/knowledge-resource', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              title: resource.title,
              summary: resource.summary,
              content: resource.content,
              type: resource.type,
              category: resource.category,
              subCategory: resource.subCategory,
              source: resource.source,
              themes: resource.themes,
              tags: resource.tags,
              applicableFor: resource.applicableFor
            })
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }

        setImportProgress(((i + 1) / parsedResources.length) * 100);
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} resources!`);
        if (errorCount > 0) {
          toast.error(`${errorCount} resources failed to import.`);
        }
        onImportComplete();
        onClose();
      } else {
        toast.error("Failed to import any resources. Please try again.");
      }
    } catch (error) {
      toast.error("Import failed. Please try again.");
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-600" />
              Bulk Import Resources
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Format Instructions:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Each resource should be separated by "---" on its own line</p>
              <p>• First line: Title</p>
              <p>• Second line: Summary</p>
              <p>• Optional metadata: **Type:**, **Category:**, **Source:**, **Themes:**, **Tags:**, **ApplicableFor:**</p>
              <p>• Everything else: Content</p>
            </div>
          </div>

          {/* Input Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your content here:
            </label>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Example:
Story of Rama and Sita
A tale of devotion and loyalty from the Ramayana
**Type:** cultural_story
**Category:** CULTURAL_WISDOM
**Source:** RAMAYANA
**Themes:** devotion, loyalty, dharma
**Tags:** rama, sita, ramayana
**ApplicableFor:** relationship counseling, moral guidance

Once upon a time, there was a prince named Rama...

---

Career Guidance Tips
Essential advice for career development
**Type:** knowledge_base
**Category:** CAREER_GUIDANCE
**Tags:** career, development, success

Here are some important career guidance tips...`}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          {/* Parse Button */}
          <div className="flex justify-center">
            <Button onClick={parseInput} disabled={!inputText.trim()}>
              <FileText className="h-4 w-4 mr-2" />
              Parse Content
            </Button>
          </div>

          {/* Parsed Resources Preview */}
          {parsedResources.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Parsed Resources ({parsedResources.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {parsedResources.map((resource, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-start gap-2 mb-2">
                      {resource.type === 'cultural_story' ? (
                        <Heart className="h-4 w-4 text-orange-600 mt-0.5" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{resource.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">{resource.summary}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {resource.category.replace('_', ' ')}
                      </Badge>
                      {resource.source && (
                        <Badge variant="outline" className="text-xs">
                          {resource.source.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">
                  Importing... {Math.round(importProgress)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isImporting}>
              Cancel
            </Button>
            <Button 
              onClick={importResources} 
              disabled={parsedResources.length === 0 || isImporting}
            >
              {isImporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import {parsedResources.length} Resources
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 