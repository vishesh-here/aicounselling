
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Clock, 
  User, 
  Heart, 
  MessageSquare, 
  Target, 
  Lightbulb,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Calendar,
  Star,
  Save,
  Send
} from "lucide-react";
import { toast } from "sonner";

interface RichSessionSummaryProps {
  sessionId: string;
  childId: string;
  childName: string;
  sessionStartTime: Date;
  onSave: (summaryData: any) => void;
  onSubmit: (summaryData: any) => void;
  existingSummary?: any;
}

interface SummaryData {
  // Session Overview
  sessionDuration: string;
  sessionType: string;
  
  // Child's Mood/State
  initialMood: string;
  finalMood: string;
  moodChanges: string;
  
  // Topics & Concerns
  topicsDiscussed: string[];
  newTopic: string;
  concernsAddressed: string[];
  newConcern: string;
  
  // Techniques & Stories
  techniquesUsed: string[];
  newTechnique: string;
  techniqueEffectiveness: { [key: string]: string };
  culturalStoriesUsed: string[];
  newStory: string;
  storyResponse: string;
  
  // Breakthroughs & Insights
  breakthroughs: string;
  keyInsights: string;
  
  // Challenges & Engagement
  challengesFaced: string;
  challengeHandling: string;
  engagementLevel: string;
  participationNotes: string;
  
  // Action Items & Recommendations
  actionItems: string[];
  newActionItem: string;
  recommendations: string;
  
  // Assessment & Planning
  sessionEffectiveness: string;
  volunteerConfidence: string;
  nextSessionFocus: string;
  nextSessionTiming: string;
  
  // Additional Notes
  additionalNotes: string;
}

const MOOD_OPTIONS = [
  "Very Happy", "Happy", "Content", "Neutral", "Sad", "Very Sad", 
  "Anxious", "Calm", "Excited", "Frustrated", "Confused", "Confident"
];

const ENGAGEMENT_LEVELS = [
  "Highly Engaged", "Engaged", "Moderately Engaged", "Somewhat Disengaged", "Disengaged"
];

const EFFECTIVENESS_RATINGS = [
  "Very Effective", "Effective", "Somewhat Effective", "Not Very Effective", "Ineffective"
];

const CONFIDENCE_LEVELS = [
  "Very Confident", "Confident", "Somewhat Confident", "Not Very Confident", "Need Support"
];

const COMMON_TECHNIQUES = [
  "Active Listening", "Empathetic Reflection", "Open-ended Questions", "Validation", 
  "Strength-based Approach", "Goal Setting", "Problem Solving", "Mindfulness", 
  "Breathing Exercises", "Creative Expression", "Role Playing", "Story Telling"
];

const COMMON_TOPICS = [
  "Academic Challenges", "Family Relationships", "Peer Relationships", "Self-esteem", 
  "Future Goals", "Emotional Regulation", "Behavioral Issues", "School Problems", 
  "Health Concerns", "Social Skills", "Career Aspirations", "Cultural Identity"
];

export function RichSessionSummary({ 
  sessionId, 
  childId, 
  childName, 
  sessionStartTime, 
  onSave, 
  onSubmit,
  existingSummary 
}: RichSessionSummaryProps) {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    sessionDuration: "",
    sessionType: "COUNSELING",
    initialMood: "",
    finalMood: "",
    moodChanges: "",
    topicsDiscussed: [],
    newTopic: "",
    concernsAddressed: [],
    newConcern: "",
    techniquesUsed: [],
    newTechnique: "",
    techniqueEffectiveness: {},
    culturalStoriesUsed: [],
    newStory: "",
    storyResponse: "",
    breakthroughs: "",
    keyInsights: "",
    challengesFaced: "",
    challengeHandling: "",
    engagementLevel: "",
    participationNotes: "",
    actionItems: [],
    newActionItem: "",
    recommendations: "",
    sessionEffectiveness: "",
    volunteerConfidence: "",
    nextSessionFocus: "",
    nextSessionTiming: "",
    additionalNotes: ""
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateDuration = () => {
    const duration = Math.round((Date.now() - sessionStartTime.getTime()) / (1000 * 60));
    setSummaryData(prev => ({ ...prev, sessionDuration: `${duration} minutes` }));
  };

  const addToList = (field: keyof SummaryData, newField: keyof SummaryData) => {
    const newValue = summaryData[newField] as string;
    if (newValue.trim()) {
      setSummaryData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), newValue.trim()],
        [newField]: ""
      }));
    }
  };

  const removeFromList = (field: keyof SummaryData, index: number) => {
    setSummaryData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const updateTechniqueEffectiveness = (technique: string, effectiveness: string) => {
    setSummaryData(prev => ({
      ...prev,
      techniqueEffectiveness: {
        ...prev.techniqueEffectiveness,
        [technique]: effectiveness
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(summaryData);
      toast.success("Session summary saved as draft");
    } catch (error) {
      toast.error("Failed to save summary");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(summaryData);
      toast.success("Session summary submitted successfully");
    } catch (error) {
      toast.error("Failed to submit summary");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Rich Session Summary - {childName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={calculateDuration}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Clock className="h-3 w-3 mr-1" />
              Calculate Duration
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {sessionStartTime.toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {sessionStartTime.toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            Session with {childName}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mood">Mood & State</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="techniques">Techniques</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Session Duration</Label>
                <Input
                  id="duration"
                  value={summaryData.sessionDuration}
                  onChange={(e) => setSummaryData(prev => ({ ...prev, sessionDuration: e.target.value }))}
                  placeholder="e.g., 45 minutes"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionType">Session Type</Label>
                <Select 
                  value={summaryData.sessionType}
                  onValueChange={(value) => setSummaryData(prev => ({ ...prev, sessionType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select session type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COUNSELING">Counseling</SelectItem>
                    <SelectItem value="CAREER_GUIDANCE">Career Guidance</SelectItem>
                    <SelectItem value="PSYCHOLOGICAL_SUPPORT">Psychological Support</SelectItem>
                    <SelectItem value="FOLLOW_UP">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="engagement">Overall Engagement Level</Label>
                <Select 
                  value={summaryData.engagementLevel}
                  onValueChange={(value) => setSummaryData(prev => ({ ...prev, engagementLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select engagement level" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENGAGEMENT_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="effectiveness">Session Effectiveness</Label>
                <Select 
                  value={summaryData.sessionEffectiveness}
                  onValueChange={(value) => setSummaryData(prev => ({ ...prev, sessionEffectiveness: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rate session effectiveness" />
                  </SelectTrigger>
                  <SelectContent>
                    {EFFECTIVENESS_RATINGS.map(rating => (
                      <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Mood & State Tab */}
          <TabsContent value="mood" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initialMood">Initial Mood</Label>
                <Select 
                  value={summaryData.initialMood}
                  onValueChange={(value) => setSummaryData(prev => ({ ...prev, initialMood: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Child's mood at start" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOOD_OPTIONS.map(mood => (
                      <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalMood">Final Mood</Label>
                <Select 
                  value={summaryData.finalMood}
                  onValueChange={(value) => setSummaryData(prev => ({ ...prev, finalMood: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Child's mood at end" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOOD_OPTIONS.map(mood => (
                      <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="moodChanges">Mood Changes During Session</Label>
              <Textarea
                id="moodChanges"
                value={summaryData.moodChanges}
                onChange={(e) => setSummaryData(prev => ({ ...prev, moodChanges: e.target.value }))}
                placeholder="Describe any significant mood changes, triggers, or emotional responses during the session..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="participationNotes">Participation & Openness Notes</Label>
              <Textarea
                id="participationNotes"
                value={summaryData.participationNotes}
                onChange={(e) => setSummaryData(prev => ({ ...prev, participationNotes: e.target.value }))}
                placeholder="Notes on the child's willingness to participate, openness to discussion, any resistance encountered..."
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            {/* Topics Discussed */}
            <div className="space-y-2">
              <Label>Topics Discussed</Label>
              <div className="flex gap-2">
                <Input
                  value={summaryData.newTopic}
                  onChange={(e) => setSummaryData(prev => ({ ...prev, newTopic: e.target.value }))}
                  placeholder="Add a topic discussed"
                  onKeyPress={(e) => e.key === 'Enter' && addToList('topicsDiscussed', 'newTopic')}
                />
                <Button 
                  onClick={() => addToList('topicsDiscussed', 'newTopic')}
                  size="sm"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {COMMON_TOPICS.map(topic => (
                  <Badge 
                    key={topic}
                    variant="outline" 
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => {
                      if (!summaryData.topicsDiscussed.includes(topic)) {
                        setSummaryData(prev => ({ 
                          ...prev, 
                          topicsDiscussed: [...prev.topicsDiscussed, topic] 
                        }));
                      }
                    }}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {summaryData.topicsDiscussed.map((topic, index) => (
                  <Badge key={index} variant="default" className="bg-blue-600">
                    {topic}
                    <button 
                      onClick={() => removeFromList('topicsDiscussed', index)}
                      className="ml-1 text-white hover:text-red-200"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Concerns Addressed */}
            <div className="space-y-2">
              <Label>Specific Concerns Addressed</Label>
              <div className="flex gap-2">
                <Input
                  value={summaryData.newConcern}
                  onChange={(e) => setSummaryData(prev => ({ ...prev, newConcern: e.target.value }))}
                  placeholder="Add a specific concern addressed"
                  onKeyPress={(e) => e.key === 'Enter' && addToList('concernsAddressed', 'newConcern')}
                />
                <Button 
                  onClick={() => addToList('concernsAddressed', 'newConcern')}
                  size="sm"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {summaryData.concernsAddressed.map((concern, index) => (
                  <Badge key={index} variant="default" className="bg-orange-600">
                    {concern}
                    <button 
                      onClick={() => removeFromList('concernsAddressed', index)}
                      className="ml-1 text-white hover:text-red-200"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Techniques Tab */}
          <TabsContent value="techniques" className="space-y-4">
            {/* Counseling Techniques */}
            <div className="space-y-2">
              <Label>Counseling Techniques Used</Label>
              <div className="flex gap-2">
                <Input
                  value={summaryData.newTechnique}
                  onChange={(e) => setSummaryData(prev => ({ ...prev, newTechnique: e.target.value }))}
                  placeholder="Add a counseling technique used"
                  onKeyPress={(e) => e.key === 'Enter' && addToList('techniquesUsed', 'newTechnique')}
                />
                <Button 
                  onClick={() => addToList('techniquesUsed', 'newTechnique')}
                  size="sm"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {COMMON_TECHNIQUES.map(technique => (
                  <Badge 
                    key={technique}
                    variant="outline" 
                    className="cursor-pointer hover:bg-green-50"
                    onClick={() => {
                      if (!summaryData.techniquesUsed.includes(technique)) {
                        setSummaryData(prev => ({ 
                          ...prev, 
                          techniquesUsed: [...prev.techniquesUsed, technique] 
                        }));
                      }
                    }}
                  >
                    {technique}
                  </Badge>
                ))}
              </div>
              <div className="space-y-2">
                {summaryData.techniquesUsed.map((technique, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <Badge variant="default" className="bg-green-600">
                      {technique}
                      <button 
                        onClick={() => removeFromList('techniquesUsed', index)}
                        className="ml-1 text-white hover:text-red-200"
                      >
                        ×
                      </button>
                    </Badge>
                    <Select 
                      value={summaryData.techniqueEffectiveness[technique] || ""}
                      onValueChange={(value) => updateTechniqueEffectiveness(technique, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Rate effectiveness" />
                      </SelectTrigger>
                      <SelectContent>
                        {EFFECTIVENESS_RATINGS.map(rating => (
                          <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Cultural Stories */}
            <div className="space-y-2">
              <Label>Cultural Stories Used</Label>
              <div className="flex gap-2">
                <Input
                  value={summaryData.newStory}
                  onChange={(e) => setSummaryData(prev => ({ ...prev, newStory: e.target.value }))}
                  placeholder="Add a cultural story used"
                  onKeyPress={(e) => e.key === 'Enter' && addToList('culturalStoriesUsed', 'newStory')}
                />
                <Button 
                  onClick={() => addToList('culturalStoriesUsed', 'newStory')}
                  size="sm"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {summaryData.culturalStoriesUsed.map((story, index) => (
                  <Badge key={index} variant="default" className="bg-purple-600">
                    {story}
                    <button 
                      onClick={() => removeFromList('culturalStoriesUsed', index)}
                      className="ml-1 text-white hover:text-red-200"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="storyResponse">Child's Response to Stories</Label>
              <Textarea
                id="storyResponse"
                value={summaryData.storyResponse}
                onChange={(e) => setSummaryData(prev => ({ ...prev, storyResponse: e.target.value }))}
                placeholder="How did the child respond to the cultural stories? What impact did they have?"
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="breakthroughs">Breakthroughs & Key Moments</Label>
              <Textarea
                id="breakthroughs"
                value={summaryData.breakthroughs}
                onChange={(e) => setSummaryData(prev => ({ ...prev, breakthroughs: e.target.value }))}
                placeholder="Describe any breakthrough moments, revelations, or significant progress made during the session..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyInsights">Key Insights About the Child</Label>
              <Textarea
                id="keyInsights"
                value={summaryData.keyInsights}
                onChange={(e) => setSummaryData(prev => ({ ...prev, keyInsights: e.target.value }))}
                placeholder="What new insights did you gain about the child's personality, needs, motivations, or challenges?"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challengesFaced">Challenges Faced During Session</Label>
              <Textarea
                id="challengesFaced"
                value={summaryData.challengesFaced}
                onChange={(e) => setSummaryData(prev => ({ ...prev, challengesFaced: e.target.value }))}
                placeholder="What difficulties or obstacles did you encounter during the session?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="challengeHandling">How Challenges Were Handled</Label>
              <Textarea
                id="challengeHandling"
                value={summaryData.challengeHandling}
                onChange={(e) => setSummaryData(prev => ({ ...prev, challengeHandling: e.target.value }))}
                placeholder="Describe the strategies you used to address the challenges and their effectiveness..."
                rows={3}
              />
            </div>
          </TabsContent>

          {/* Planning Tab */}
          <TabsContent value="planning" className="space-y-4">
            {/* Action Items */}
            <div className="space-y-2">
              <Label>Action Items & Follow-up Tasks</Label>
              <div className="flex gap-2">
                <Input
                  value={summaryData.newActionItem}
                  onChange={(e) => setSummaryData(prev => ({ ...prev, newActionItem: e.target.value }))}
                  placeholder="Add an action item"
                  onKeyPress={(e) => e.key === 'Enter' && addToList('actionItems', 'newActionItem')}
                />
                <Button 
                  onClick={() => addToList('actionItems', 'newActionItem')}
                  size="sm"
                >
                  Add
                </Button>
              </div>
              <div className="space-y-1">
                {summaryData.actionItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="flex-1">{item}</span>
                    <Button 
                      onClick={() => removeFromList('actionItems', index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Recommendations for Future Sessions</Label>
              <Textarea
                id="recommendations"
                value={summaryData.recommendations}
                onChange={(e) => setSummaryData(prev => ({ ...prev, recommendations: e.target.value }))}
                placeholder="What recommendations do you have for future counselors working with this child?"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="volunteerConfidence">Your Confidence Level</Label>
                <Select 
                  value={summaryData.volunteerConfidence}
                  onValueChange={(value) => setSummaryData(prev => ({ ...prev, volunteerConfidence: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rate your confidence" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONFIDENCE_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextSessionTiming">Recommended Next Session Timing</Label>
                <Input
                  id="nextSessionTiming"
                  value={summaryData.nextSessionTiming}
                  onChange={(e) => setSummaryData(prev => ({ ...prev, nextSessionTiming: e.target.value }))}
                  placeholder="e.g., Within 1 week, 2 weeks, etc."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nextSessionFocus">Next Session Focus Areas</Label>
              <Textarea
                id="nextSessionFocus"
                value={summaryData.nextSessionFocus}
                onChange={(e) => setSummaryData(prev => ({ ...prev, nextSessionFocus: e.target.value }))}
                placeholder="What should be the focus areas for the next session with this child?"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={summaryData.additionalNotes}
                onChange={(e) => setSummaryData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                placeholder="Any other important observations, notes, or information..."
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Complete all relevant sections to provide comprehensive session documentation
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              variant="outline"
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Submitting..." : "Submit Summary"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
