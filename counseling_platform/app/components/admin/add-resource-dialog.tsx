
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, X, BookOpen, Heart } from "lucide-react";
import { toast } from "sonner";

export function AddResourceDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [resourceType, setResourceType] = useState<"knowledge" | "story">("knowledge");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    category: "CAREER_GUIDANCE",
    subCategory: "",
    source: "PANCHTANTRA",
    themes: [] as string[],
    applicableFor: [] as string[],
    moralLessons: [] as string[],
    tags: [] as string[]
  });

  const knowledgeCategories = [
    "CAREER_GUIDANCE",
    "PSYCHOLOGICAL_COUNSELING", 
    "CULTURAL_WISDOM",
    "EDUCATIONAL_RESOURCES",
    "LIFE_SKILLS"
  ];

  const storySources = [
    "RAMAYANA",
    "MAHABHARATA",
    "BHAGAVAD_GITA",
    "PANCHTANTRA",
    "JATAKA_TALES",
    "HITOPADESHA",
    "TENALI_RAMA",
    "AKBAR_BIRBAL",
    "OTHER"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = resourceType === "knowledge" ? "/api/admin/knowledge-base" : "/api/admin/cultural-stories";
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(`${resourceType === "knowledge" ? "Resource" : "Story"} added successfully!`);
        setIsOpen(false);
        setFormData({
          title: "",
          summary: "",
          content: "",
          category: "CAREER_GUIDANCE",
          subCategory: "",
          source: "PANCHTANTRA",
          themes: [],
          applicableFor: [],
          moralLessons: [],
          tags: []
        });
        // Refresh the page to show new content
        window.location.reload();
      } else {
        throw new Error("Failed to add resource");
      }
    } catch (error) {
      toast.error("Failed to add resource. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (field: keyof typeof formData, value: string) => {
    if (value.trim() && Array.isArray(formData[field])) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="bg-green-600 hover:bg-green-700">
        <Plus className="h-4 w-4 mr-2" />
        Add Resource
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Add New Resource</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Resource Type Selector */}
          <div className="flex gap-2 mt-4">
            <Button
              type="button"
              variant={resourceType === "knowledge" ? "default" : "outline"}
              onClick={() => setResourceType("knowledge")}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Knowledge Base
            </Button>
            <Button
              type="button"
              variant={resourceType === "story" ? "default" : "outline"}
              onClick={() => setResourceType("story")}
              className="flex items-center gap-2"
            >
              <Heart className="h-4 w-4" />
              Cultural Story
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder={resourceType === "knowledge" ? "Resource title" : "Story title"}
                required
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary *
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Brief summary..."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {resourceType === "knowledge" ? "Content" : "Full Story"} *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder={resourceType === "knowledge" ? "Detailed content..." : "Complete story text..."}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={6}
              />
            </div>

            {/* Category or Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {resourceType === "knowledge" ? "Category" : "Source"} *
              </label>
              <select
                value={resourceType === "knowledge" ? formData.category : formData.source}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  [resourceType === "knowledge" ? "category" : "source"]: e.target.value
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {(resourceType === "knowledge" ? knowledgeCategories : storySources).map(option => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Category (for knowledge base only) */}
            {resourceType === "knowledge" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Category
                </label>
                <Input
                  value={formData.subCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subCategory: e.target.value }))}
                  placeholder="Optional sub-category"
                />
              </div>
            )}

            {/* Themes (for stories) */}
            {resourceType === "story" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Themes
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add theme and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("themes", e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.themes.map((theme, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {theme}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeArrayItem("themes", index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Applicable For (for stories) */}
            {resourceType === "story" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applicable For
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add use case and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("applicableFor", e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.applicableFor.map((useCase, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {useCase}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeArrayItem("applicableFor", index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Moral Lessons (for stories) */}
            {resourceType === "story" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moral Lessons
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add moral lesson and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addArrayItem("moralLessons", e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.moralLessons.map((lesson, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {lesson}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeArrayItem("moralLessons", index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Resource"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
