"use strict";
"use client";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddResourceDialog = void 0;
const react_1 = require("react");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
function AddResourceDialog() {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [resourceType, setResourceType] = (0, react_1.useState)("knowledge");
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [formData, setFormData] = (0, react_1.useState)({
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
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = resourceType === "knowledge" ? "/api/admin/knowledge-base" : "/api/admin/cultural-stories";
            const response = yield fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                sonner_1.toast.success(`${resourceType === "knowledge" ? "Resource" : "Story"} added successfully!`);
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
            }
            else {
                throw new Error("Failed to add resource");
            }
        }
        catch (error) {
            sonner_1.toast.error("Failed to add resource. Please try again.");
        }
        finally {
            setLoading(false);
        }
    });
    const addArrayItem = (field, value) => {
        if (value.trim() && Array.isArray(formData[field])) {
            setFormData(prev => (Object.assign(Object.assign({}, prev), { [field]: [...prev[field], value.trim()] })));
        }
    };
    const removeArrayItem = (field, index) => {
        setFormData(prev => (Object.assign(Object.assign({}, prev), { [field]: prev[field].filter((_, i) => i !== index) })));
    };
    if (!isOpen) {
        return (<button_1.Button onClick={() => setIsOpen(true)} className="bg-green-600 hover:bg-green-700">
        <lucide_react_1.Plus className="h-4 w-4 mr-2"/>
        Add Resource
      </button_1.Button>);
    }
    return (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <card_1.Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <card_1.CardTitle>Add New Resource</card_1.CardTitle>
            <button_1.Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <lucide_react_1.X className="h-4 w-4"/>
            </button_1.Button>
          </div>
          
          {/* Resource Type Selector */}
          <div className="flex gap-2 mt-4">
            <button_1.Button type="button" variant={resourceType === "knowledge" ? "default" : "outline"} onClick={() => setResourceType("knowledge")} className="flex items-center gap-2">
              <lucide_react_1.BookOpen className="h-4 w-4"/>
              Knowledge Base
            </button_1.Button>
            <button_1.Button type="button" variant={resourceType === "story" ? "default" : "outline"} onClick={() => setResourceType("story")} className="flex items-center gap-2">
              <lucide_react_1.Heart className="h-4 w-4"/>
              Cultural Story
            </button_1.Button>
          </div>
        </card_1.CardHeader>

        <card_1.CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input_1.Input value={formData.title} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { title: e.target.value })))} placeholder={resourceType === "knowledge" ? "Resource title" : "Story title"} required/>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Summary *
              </label>
              <textarea value={formData.summary} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { summary: e.target.value })))} placeholder="Brief summary..." required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={3}/>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {resourceType === "knowledge" ? "Content" : "Full Story"} *
              </label>
              <textarea value={formData.content} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { content: e.target.value })))} placeholder={resourceType === "knowledge" ? "Detailed content..." : "Complete story text..."} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" rows={6}/>
            </div>

            {/* Category or Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {resourceType === "knowledge" ? "Category" : "Source"} *
              </label>
              <select value={resourceType === "knowledge" ? formData.category : formData.source} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { [resourceType === "knowledge" ? "category" : "source"]: e.target.value })))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                {(resourceType === "knowledge" ? knowledgeCategories : storySources).map(option => (<option key={option} value={option}>
                    {option.replace(/_/g, " ")}
                  </option>))}
              </select>
            </div>

            {/* Sub Category (for knowledge base only) */}
            {resourceType === "knowledge" && (<div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub Category
                </label>
                <input_1.Input value={formData.subCategory} onChange={(e) => setFormData(prev => (Object.assign(Object.assign({}, prev), { subCategory: e.target.value })))} placeholder="Optional sub-category"/>
              </div>)}

            {/* Themes (for stories) */}
            {resourceType === "story" && (<div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Themes
                </label>
                <div className="flex gap-2 mb-2">
                  <input_1.Input placeholder="Add theme and press Enter" onKeyPress={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem("themes", e.currentTarget.value);
                    e.currentTarget.value = "";
                }
            }}/>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.themes.map((theme, index) => (<badge_1.Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {theme}
                      <lucide_react_1.X className="h-3 w-3 cursor-pointer" onClick={() => removeArrayItem("themes", index)}/>
                    </badge_1.Badge>))}
                </div>
              </div>)}

            {/* Applicable For (for stories) */}
            {resourceType === "story" && (<div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Applicable For
                </label>
                <div className="flex gap-2 mb-2">
                  <input_1.Input placeholder="Add use case and press Enter" onKeyPress={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem("applicableFor", e.currentTarget.value);
                    e.currentTarget.value = "";
                }
            }}/>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.applicableFor.map((useCase, index) => (<badge_1.Badge key={index} variant="outline" className="flex items-center gap-1">
                      {useCase}
                      <lucide_react_1.X className="h-3 w-3 cursor-pointer" onClick={() => removeArrayItem("applicableFor", index)}/>
                    </badge_1.Badge>))}
                </div>
              </div>)}

            {/* Moral Lessons (for stories) */}
            {resourceType === "story" && (<div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moral Lessons
                </label>
                <div className="flex gap-2 mb-2">
                  <input_1.Input placeholder="Add moral lesson and press Enter" onKeyPress={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    addArrayItem("moralLessons", e.currentTarget.value);
                    e.currentTarget.value = "";
                }
            }}/>
                </div>
                <div className="flex flex-wrap gap-1">
                  {formData.moralLessons.map((lesson, index) => (<badge_1.Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {lesson}
                      <lucide_react_1.X className="h-3 w-3 cursor-pointer" onClick={() => removeArrayItem("moralLessons", index)}/>
                    </badge_1.Badge>))}
                </div>
              </div>)}

            <div className="flex justify-end gap-2 pt-4">
              <button_1.Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </button_1.Button>
              <button_1.Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Resource"}
              </button_1.Button>
            </div>
          </form>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
exports.AddResourceDialog = AddResourceDialog;
