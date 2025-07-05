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
exports.RichSessionSummary = void 0;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const textarea_1 = require("@/components/ui/textarea");
const label_1 = require("@/components/ui/label");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const separator_1 = require("@/components/ui/separator");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
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
function RichSessionSummary({ sessionId, child_id, childName, sessionStartTime, onSave, onSubmit, existingSummary }) {
    const [summaryData, setSummaryData] = (0, react_1.useState)({
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
    const [isSaving, setIsSaving] = (0, react_1.useState)(false);
    const [isSubmitting, setIsSubmitting] = (0, react_1.useState)(false);
    const calculateDuration = () => {
        const duration = Math.round((Date.now() - sessionStartTime.getTime()) / (1000 * 60));
        setSummaryData(prev => (Object.assign(Object.assign({}, prev), { sessionDuration: `${duration} minutes` })));
    };
    const addToList = (field, newField) => {
        const newValue = summaryData[newField];
        if (newValue.trim()) {
            setSummaryData(prev => (Object.assign(Object.assign({}, prev), { [field]: [...prev[field], newValue.trim()], [newField]: "" })));
        }
    };
    const removeFromList = (field, index) => {
        setSummaryData(prev => (Object.assign(Object.assign({}, prev), { [field]: prev[field].filter((_, i) => i !== index) })));
    };
    const updateTechniqueEffectiveness = (technique, effectiveness) => {
        setSummaryData(prev => (Object.assign(Object.assign({}, prev), { techniqueEffectiveness: Object.assign(Object.assign({}, prev.techniqueEffectiveness), { [technique]: effectiveness }) })));
    };
    const handleSave = () => __awaiter(this, void 0, void 0, function* () {
        setIsSaving(true);
        try {
            yield onSave(summaryData);
            sonner_1.toast.success("Session summary saved as draft");
        }
        catch (error) {
            sonner_1.toast.error("Failed to save summary");
        }
        finally {
            setIsSaving(false);
        }
    });
    const handleSubmit = () => __awaiter(this, void 0, void 0, function* () {
        setIsSubmitting(true);
        try {
            yield onSubmit(summaryData);
            sonner_1.toast.success("Session summary submitted successfully");
        }
        catch (error) {
            sonner_1.toast.error("Failed to submit summary");
        }
        finally {
            setIsSubmitting(false);
        }
    });
    return (<card_1.Card className="max-w-6xl mx-auto">
      <card_1.CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.FileText className="h-5 w-5 text-blue-600"/>
            Rich Session Summary - {childName}
          </card_1.CardTitle>
          <div className="flex items-center gap-2">
            <button_1.Button onClick={calculateDuration} size="sm" variant="outline" className="text-xs">
              <lucide_react_1.Clock className="h-3 w-3 mr-1"/>
              Calculate Duration
            </button_1.Button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <lucide_react_1.Calendar className="h-4 w-4"/>
            {sessionStartTime.toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <lucide_react_1.Clock className="h-4 w-4"/>
            {sessionStartTime.toLocaleTimeString()}
          </div>
          <div className="flex items-center gap-1">
            <lucide_react_1.User className="h-4 w-4"/>
            Session with {childName}
          </div>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent>
        <tabs_1.Tabs defaultValue="overview" className="space-y-6">
          <tabs_1.TabsList className="grid w-full grid-cols-6">
            <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="mood">Mood & State</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="content">Content</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="techniques">Techniques</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="insights">Insights</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="planning">Planning</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          {/* Overview Tab */}
          <tabs_1.TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="duration">Session Duration</label_1.Label>
                <input_1.Input id="duration" value={summaryData.sessionDuration} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { sessionDuration: e.target.value })))} placeholder="e.g., 45 minutes"/>
              </div>
              
              <div className="space-y-2">
                <label_1.Label htmlFor="sessionType">Session Type</label_1.Label>
                <select_1.Select value={summaryData.sessionType} onValueChange={(value) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { sessionType: value })))}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select session type"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    <select_1.SelectItem value="COUNSELING">Counseling</select_1.SelectItem>
                    <select_1.SelectItem value="CAREER_GUIDANCE">Career Guidance</select_1.SelectItem>
                    <select_1.SelectItem value="PSYCHOLOGICAL_SUPPORT">Psychological Support</select_1.SelectItem>
                    <select_1.SelectItem value="FOLLOW_UP">Follow-up</select_1.SelectItem>
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="engagement">Overall Engagement Level</label_1.Label>
                <select_1.Select value={summaryData.engagementLevel} onValueChange={(value) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { engagementLevel: value })))}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Select engagement level"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {ENGAGEMENT_LEVELS.map(level => (<select_1.SelectItem key={level} value={level}>{level}</select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="effectiveness">Session Effectiveness</label_1.Label>
                <select_1.Select value={summaryData.sessionEffectiveness} onValueChange={(value) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { sessionEffectiveness: value })))}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Rate session effectiveness"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {EFFECTIVENESS_RATINGS.map(rating => (<select_1.SelectItem key={rating} value={rating}>{rating}</select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>
          </tabs_1.TabsContent>

          {/* Mood & State Tab */}
          <tabs_1.TabsContent value="mood" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="initialMood">Initial Mood</label_1.Label>
                <select_1.Select value={summaryData.initialMood} onValueChange={(value) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { initialMood: value })))}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Child's mood at start"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {MOOD_OPTIONS.map(mood => (<select_1.SelectItem key={mood} value={mood}>{mood}</select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="finalMood">Final Mood</label_1.Label>
                <select_1.Select value={summaryData.finalMood} onValueChange={(value) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { finalMood: value })))}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Child's mood at end"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {MOOD_OPTIONS.map(mood => (<select_1.SelectItem key={mood} value={mood}>{mood}</select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="moodChanges">Mood Changes During Session</label_1.Label>
              <textarea_1.Textarea id="moodChanges" value={summaryData.moodChanges} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { moodChanges: e.target.value })))} placeholder="Describe any significant mood changes, triggers, or emotional responses during the session..." rows={3}/>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="participationNotes">Participation & Openness Notes</label_1.Label>
              <textarea_1.Textarea id="participationNotes" value={summaryData.participationNotes} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { participationNotes: e.target.value })))} placeholder="Notes on the child's willingness to participate, openness to discussion, any resistance encountered..." rows={3}/>
            </div>
          </tabs_1.TabsContent>

          {/* Content Tab */}
          <tabs_1.TabsContent value="content" className="space-y-4">
            {/* Topics Discussed */}
            <div className="space-y-2">
              <label_1.Label>Topics Discussed</label_1.Label>
              <div className="flex gap-2">
                <input_1.Input value={summaryData.newTopic} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { newTopic: e.target.value })))} placeholder="Add a topic discussed" onKeyPress={(e) => e.key === 'Enter' && addToList('topicsDiscussed', 'newTopic')}/>
                <button_1.Button onClick={() => addToList('topicsDiscussed', 'newTopic')} size="sm">
                  Add
                </button_1.Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {COMMON_TOPICS.map(topic => (<badge_1.Badge key={topic} variant="outline" className="cursor-pointer hover:bg-blue-50" onClick={() => {
                if (!summaryData.topicsDiscussed.includes(topic)) {
                    setSummaryData(prev => (Object.assign(Object.assign({}, prev), { topicsDiscussed: [...prev.topicsDiscussed, topic] })));
                }
            }}>
                    {topic}
                  </badge_1.Badge>))}
              </div>
              <div className="flex flex-wrap gap-2">
                {summaryData.topicsDiscussed.map((topic, index) => (<badge_1.Badge key={index} variant="default" className="bg-blue-600">
                    {topic}
                    <button onClick={() => removeFromList('topicsDiscussed', index)} className="ml-1 text-white hover:text-red-200">
                      ×
                    </button>
                  </badge_1.Badge>))}
              </div>
            </div>

            <separator_1.Separator />

            {/* Concerns Addressed */}
            <div className="space-y-2">
              <label_1.Label>Specific Concerns Addressed</label_1.Label>
              <div className="flex gap-2">
                <input_1.Input value={summaryData.newConcern} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { newConcern: e.target.value })))} placeholder="Add a specific concern addressed" onKeyPress={(e) => e.key === 'Enter' && addToList('concernsAddressed', 'newConcern')}/>
                <button_1.Button onClick={() => addToList('concernsAddressed', 'newConcern')} size="sm">
                  Add
                </button_1.Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {summaryData.concernsAddressed.map((concern, index) => (<badge_1.Badge key={index} variant="default" className="bg-orange-600">
                    {concern}
                    <button onClick={() => removeFromList('concernsAddressed', index)} className="ml-1 text-white hover:text-red-200">
                      ×
                    </button>
                  </badge_1.Badge>))}
              </div>
            </div>
          </tabs_1.TabsContent>

          {/* Techniques Tab */}
          <tabs_1.TabsContent value="techniques" className="space-y-4">
            {/* Counseling Techniques */}
            <div className="space-y-2">
              <label_1.Label>Counseling Techniques Used</label_1.Label>
              <div className="flex gap-2">
                <input_1.Input value={summaryData.newTechnique} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { newTechnique: e.target.value })))} placeholder="Add a counseling technique used" onKeyPress={(e) => e.key === 'Enter' && addToList('techniquesUsed', 'newTechnique')}/>
                <button_1.Button onClick={() => addToList('techniquesUsed', 'newTechnique')} size="sm">
                  Add
                </button_1.Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {COMMON_TECHNIQUES.map(technique => (<badge_1.Badge key={technique} variant="outline" className="cursor-pointer hover:bg-green-50" onClick={() => {
                if (!summaryData.techniquesUsed.includes(technique)) {
                    setSummaryData(prev => (Object.assign(Object.assign({}, prev), { techniquesUsed: [...prev.techniquesUsed, technique] })));
                }
            }}>
                    {technique}
                  </badge_1.Badge>))}
              </div>
              <div className="space-y-2">
                {summaryData.techniquesUsed.map((technique, index) => (<div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <badge_1.Badge variant="default" className="bg-green-600">
                      {technique}
                      <button onClick={() => removeFromList('techniquesUsed', index)} className="ml-1 text-white hover:text-red-200">
                        ×
                      </button>
                    </badge_1.Badge>
                    <select_1.Select value={summaryData.techniqueEffectiveness[technique] || ""} onValueChange={(value) => updateTechniqueEffectiveness(technique, value)}>
                      <select_1.SelectTrigger className="w-48">
                        <select_1.SelectValue placeholder="Rate effectiveness"/>
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {EFFECTIVENESS_RATINGS.map(rating => (<select_1.SelectItem key={rating} value={rating}>{rating}</select_1.SelectItem>))}
                      </select_1.SelectContent>
                    </select_1.Select>
                  </div>))}
              </div>
            </div>

            <separator_1.Separator />

            {/* Cultural Stories */}
            <div className="space-y-2">
              <label_1.Label>Cultural Stories Used</label_1.Label>
              <div className="flex gap-2">
                <input_1.Input value={summaryData.newStory} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { newStory: e.target.value })))} placeholder="Add a cultural story used" onKeyPress={(e) => e.key === 'Enter' && addToList('culturalStoriesUsed', 'newStory')}/>
                <button_1.Button onClick={() => addToList('culturalStoriesUsed', 'newStory')} size="sm">
                  Add
                </button_1.Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {summaryData.culturalStoriesUsed.map((story, index) => (<badge_1.Badge key={index} variant="default" className="bg-purple-600">
                    {story}
                    <button onClick={() => removeFromList('culturalStoriesUsed', index)} className="ml-1 text-white hover:text-red-200">
                      ×
                    </button>
                  </badge_1.Badge>))}
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="storyResponse">Child's Response to Stories</label_1.Label>
              <textarea_1.Textarea id="storyResponse" value={summaryData.storyResponse} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { storyResponse: e.target.value })))} placeholder="How did the child respond to the cultural stories? What impact did they have?" rows={3}/>
            </div>
          </tabs_1.TabsContent>

          {/* Insights Tab */}
          <tabs_1.TabsContent value="insights" className="space-y-4">
            <div className="space-y-2">
              <label_1.Label htmlFor="breakthroughs">Breakthroughs & Key Moments</label_1.Label>
              <textarea_1.Textarea id="breakthroughs" value={summaryData.breakthroughs} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { breakthroughs: e.target.value })))} placeholder="Describe any breakthrough moments, revelations, or significant progress made during the session..." rows={4}/>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="keyInsights">Key Insights About the Child</label_1.Label>
              <textarea_1.Textarea id="keyInsights" value={summaryData.keyInsights} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { keyInsights: e.target.value })))} placeholder="What new insights did you gain about the child's personality, needs, motivations, or challenges?" rows={4}/>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="challengesFaced">Challenges Faced During Session</label_1.Label>
              <textarea_1.Textarea id="challengesFaced" value={summaryData.challengesFaced} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { challengesFaced: e.target.value })))} placeholder="What difficulties or obstacles did you encounter during the session?" rows={3}/>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="challengeHandling">How Challenges Were Handled</label_1.Label>
              <textarea_1.Textarea id="challengeHandling" value={summaryData.challengeHandling} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { challengeHandling: e.target.value })))} placeholder="Describe the strategies you used to address the challenges and their effectiveness..." rows={3}/>
            </div>
          </tabs_1.TabsContent>

          {/* Planning Tab */}
          <tabs_1.TabsContent value="planning" className="space-y-4">
            {/* Action Items */}
            <div className="space-y-2">
              <label_1.Label>Action Items & Follow-up Tasks</label_1.Label>
              <div className="flex gap-2">
                <input_1.Input value={summaryData.newActionItem} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { newActionItem: e.target.value })))} placeholder="Add an action item" onKeyPress={(e) => e.key === 'Enter' && addToList('actionItems', 'newActionItem')}/>
                <button_1.Button onClick={() => addToList('actionItems', 'newActionItem')} size="sm">
                  Add
                </button_1.Button>
              </div>
              <div className="space-y-1">
                {summaryData.actionItems.map((item, index) => (<div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600"/>
                    <span className="flex-1">{item}</span>
                    <button_1.Button onClick={() => removeFromList('actionItems', index)} size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                      Remove
                    </button_1.Button>
                  </div>))}
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="recommendations">Recommendations for Future Sessions</label_1.Label>
              <textarea_1.Textarea id="recommendations" value={summaryData.recommendations} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { recommendations: e.target.value })))} placeholder="What recommendations do you have for future counselors working with this child?" rows={4}/>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label_1.Label htmlFor="volunteerConfidence">Your Confidence Level</label_1.Label>
                <select_1.Select value={summaryData.volunteerConfidence} onValueChange={(value) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { volunteerConfidence: value })))}>
                  <select_1.SelectTrigger>
                    <select_1.SelectValue placeholder="Rate your confidence"/>
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {CONFIDENCE_LEVELS.map(level => (<select_1.SelectItem key={level} value={level}>{level}</select_1.SelectItem>))}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="nextSessionTiming">Recommended Next Session Timing</label_1.Label>
                <input_1.Input id="nextSessionTiming" value={summaryData.nextSessionTiming} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { nextSessionTiming: e.target.value })))} placeholder="e.g., Within 1 week, 2 weeks, etc."/>
              </div>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="nextSessionFocus">Next Session Focus Areas</label_1.Label>
              <textarea_1.Textarea id="nextSessionFocus" value={summaryData.nextSessionFocus} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { nextSessionFocus: e.target.value })))} placeholder="What should be the focus areas for the next session with this child?" rows={3}/>
            </div>

            <div className="space-y-2">
              <label_1.Label htmlFor="additionalNotes">Additional Notes</label_1.Label>
              <textarea_1.Textarea id="additionalNotes" value={summaryData.additionalNotes} onChange={(e) => setSummaryData(prev => (Object.assign(Object.assign({}, prev), { additionalNotes: e.target.value })))} placeholder="Any other important observations, notes, or information..." rows={4}/>
            </div>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Complete all relevant sections to provide comprehensive session documentation
          </div>
          <div className="flex items-center gap-2">
            <button_1.Button onClick={handleSave} variant="outline" disabled={isSaving}>
              <lucide_react_1.Save className="h-4 w-4 mr-2"/>
              {isSaving ? "Saving..." : "Save Draft"}
            </button_1.Button>
            <button_1.Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              <lucide_react_1.Send className="h-4 w-4 mr-2"/>
              {isSubmitting ? "Submitting..." : "Submit Summary"}
            </button_1.Button>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>);
}
exports.RichSessionSummary = RichSessionSummary;
