
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
    category: "CULTURAL_WISDOM",
    tags: [] as string[],
    source: "PANCHTANTRA"
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
      const endpoint = "/api/admin/knowledge-resource";
      // Get Supabase access token from localStorage
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
      // Prepare payload for unified endpoint
      const payload: any = {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        tags: formData.tags,
        type: resourceType === "knowledge" ? "knowledge_base" : "cultural_story",
        category: formData.category
      };
      if (resourceType === "cultural_story") {
        payload.source = formData.source;
      }
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(`${resourceType === "knowledge" ? "Resource" : "Story"} added successfully!`);
        setIsOpen(false);
        setFormData({
          title: "",
          summary: "",
          content: "",
          category: "CULTURAL_WISDOM",
          tags: [],
          source: "PANCHTANTRA"
        });
        // Refresh the page to show new content
        window.location.reload();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to add resource. Please try again.");
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
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {knowledgeCategories.map(option => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Source (for cultural story) */}
            {resourceType === "story" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source *
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {storySources.map(option => (
                    <option key={option} value={option}>
                      {option.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated) *
              </label>
              <Input
                value={formData.tags.join(", ")}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(",").map(tag => tag.trim()) }))}
                placeholder="e.g., wisdom, life, career"
                required
              />
            </div>

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
