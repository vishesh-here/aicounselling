import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Plus, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const effectivenessOptions = [
  "Very Effective",
  "Effective",
  "Neutral",
  "Not Effective",
  "Needs Support",
];

export interface Concern {
  id: string;
  title: string;
}

interface SessionSummaryFormProps {
  existingConcerns: Concern[];
  onSubmit: (data: any) => void;
}

export const SessionSummaryForm: React.FC<SessionSummaryFormProps> = ({ existingConcerns, onSubmit }) => {
  const [summary, setSummary] = useState("");
  const [effectiveness, setEffectiveness] = useState("");
  const [followupNotes, setFollowupNotes] = useState("");
  const [newConcerns, setNewConcerns] = useState<string[]>([]);
  const [resolvedConcerns, setResolvedConcerns] = useState<string[]>([]);
  const [nextSessionDate, setNextSessionDate] = useState<string>("");
  const [newConcernInput, setNewConcernInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const wordCount = summary.trim().split(/\s+/).length;
  const minWords = 50;
  const canSubmit = summary.trim().length > 0 && wordCount >= minWords && effectiveness && !submitting;

  const handleAddNewConcern = () => {
    if (newConcernInput.trim() && !newConcerns.includes(newConcernInput.trim())) {
      setNewConcerns([...newConcerns, newConcernInput.trim()]);
      setNewConcernInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    onSubmit({
      summary,
      effectiveness,
      followup_notes: followupNotes,
      new_concerns: newConcerns.map(title => ({ title })),
      resolved_concerns: resolvedConcerns,
      next_session_date: nextSessionDate,
    });
    setSubmitting(false);
  };

  return (
    <Card className="w-full p-4 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <TrendingUp className="h-6 w-6 text-orange-600" />
          Session Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Summary */}
          <div>
            <label className="font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Session Summary <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              rows={6}
              minLength={minWords * 5}
              placeholder={`• Topics Discussed:\n  - Emotional check-in\n  - Key events shared\n• Observations:\n  - Engagement level\n  - Any resistance or breakthroughs\n• Guidance Given:\n  - Activities suggested\n  - Frameworks used`}
              className="mt-2"
            />
            <div className="text-xs text-gray-500 mt-1 flex justify-between">
              <span>Minimum {minWords} words</span>
              <span className={wordCount < minWords ? "text-red-500" : "text-green-600"}>{wordCount} words</span>
            </div>
          </div>

          {/* Session Effectiveness */}
          <div>
            <label className="font-medium flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Rate Session Effectiveness <span className="text-red-500">*</span>
            </label>
            <select
              value={effectiveness}
              onChange={e => setEffectiveness(e.target.value)}
              className="mt-2 w-full border rounded-md p-2"
              required
            >
              <option value="">Select effectiveness</option>
              {effectivenessOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Next Session Follow-up Notes */}
          <div>
            <label className="font-medium flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Next Session Follow-up Notes
            </label>
            <Textarea
              value={followupNotes}
              onChange={e => setFollowupNotes(e.target.value)}
              rows={2}
              placeholder="Notes for next session (e.g., themes to revisit)"
              className="mt-2"
            />
          </div>

          {/* New Concerns Raised */}
          <div>
            <label className="font-medium flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Any New Concerns Raised?
            </label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newConcernInput}
                onChange={e => setNewConcernInput(e.target.value)}
                placeholder="Add new concern..."
                className="flex-1"
              />
              <Button type="button" onClick={handleAddNewConcern} variant="outline" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {newConcerns.map((concern, idx) => (
                <Badge key={idx} variant="secondary">{concern}</Badge>
              ))}
            </div>
          </div>

          {/* Resolved Existing Concerns */}
          <div>
            <label className="font-medium flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              Resolved Existing Concerns
            </label>
            <div className="flex flex-col gap-1 mt-2">
              {existingConcerns.length === 0 && (
                <span className="text-xs text-gray-500">No unresolved concerns</span>
              )}
              {existingConcerns.map(concern => (
                <label key={concern.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={resolvedConcerns.includes(concern.id)}
                    onChange={e => {
                      if (e.target.checked) setResolvedConcerns([...resolvedConcerns, concern.id]);
                      else setResolvedConcerns(resolvedConcerns.filter(id => id !== concern.id));
                    }}
                  />
                  {concern.title}
                </label>
              ))}
            </div>
          </div>

          {/* Next Scheduled Session */}
          <div>
            <label className="font-medium flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Next Scheduled Session (Optional)
            </label>
            <Input
              type="date"
              value={nextSessionDate}
              onChange={e => setNextSessionDate(e.target.value)}
              className="mt-2 w-full"
            />
            {nextSessionDate && (
              <div className="text-xs text-gray-500 mt-1">
                Scheduled for {format(new Date(nextSessionDate), "PPP")}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={!canSubmit} className="bg-orange-600 hover:bg-orange-700">
              {submitting ? "Saving..." : "Save Summary"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 