"use strict";
'use client';
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
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const card_1 = require("@/components/ui/card");
const input_1 = require("@/components/ui/input");
const label_1 = require("@/components/ui/label");
const button_1 = require("@/components/ui/button");
const textarea_1 = require("@/components/ui/textarea");
const select_1 = require("@/components/ui/select");
const badge_1 = require("@/components/ui/badge");
const lucide_react_1 = require("lucide-react");
const alert_1 = require("@/components/ui/alert");
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
function AddChildPage() {
    var _a;
    const router = (0, navigation_1.useRouter)();
    const [formData, setFormData] = (0, react_1.useState)({
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
    const [errors, setErrors] = (0, react_1.useState)({});
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [newInterest, setNewInterest] = (0, react_1.useState)('');
    const [newChallenge, setNewChallenge] = (0, react_1.useState)('');
    const validateForm = () => {
        var _a, _b, _c, _d;
        const newErrors = {};
        if (!((_a = formData.name) === null || _a === void 0 ? void 0 : _a.trim())) {
            newErrors.name = 'Child name is required';
        }
        if (!formData.age) {
            newErrors.age = 'Age is required';
        }
        else {
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
        if (!((_b = formData.district) === null || _b === void 0 ? void 0 : _b.trim())) {
            newErrors.district = 'District is required';
        }
        if (!((_c = formData.background) === null || _c === void 0 ? void 0 : _c.trim())) {
            newErrors.background = 'Background information is required';
        }
        if (!((_d = formData.schoolLevel) === null || _d === void 0 ? void 0 : _d.trim())) {
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
    const handleInputChange = (field, value) => {
        setFormData(prev => (Object.assign(Object.assign({}, prev), { [field]: value })));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors(prev => (Object.assign(Object.assign({}, prev), { [field]: '' })));
        }
    };
    const addInterest = (interest) => {
        if (interest.trim() && !formData.interests.includes(interest.trim())) {
            handleInputChange('interests', [...formData.interests, interest.trim()]);
            setNewInterest('');
        }
    };
    const removeInterest = (interest) => {
        handleInputChange('interests', formData.interests.filter(i => i !== interest));
    };
    const addChallenge = (challenge) => {
        if (challenge.trim() && !formData.challenges.includes(challenge.trim())) {
            handleInputChange('challenges', [...formData.challenges, challenge.trim()]);
            setNewChallenge('');
        }
    };
    const removeChallenge = (challenge) => {
        handleInputChange('challenges', formData.challenges.filter(c => c !== challenge));
    };
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        try {
            const response = yield fetch('/api/children', {
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
            const result = yield response.json();
            if (response.ok) {
                router.push('/children?message=child-added');
            }
            else {
                if (result.errors) {
                    setErrors(result.errors);
                }
                else {
                    setErrors({ general: result.error || 'Failed to add child profile' });
                }
            }
        }
        catch (error) {
            console.error('Add child error:', error);
            setErrors({ general: 'Something went wrong. Please try again.' });
        }
        finally {
            setIsLoading(false);
        }
    });
    if (((_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.role) !== 'ADMIN') {
        return (<div className="p-6">
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertCircle className="h-4 w-4"/>
          <alert_1.AlertDescription>
            You don't have permission to add child profiles. Only administrators can perform this action.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      </div>);
    }
    return (<div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Child Profile</h1>
        <p className="text-gray-600">Create a comprehensive profile for a new child in the program</p>
      </div>

      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Child Information</card_1.CardTitle>
          <card_1.CardDescription>
            Please fill out all the required information to create a complete profile
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="name">Full Name *</label_1.Label>
                  <input_1.Input id="name" type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter child's full name" className={errors.name ? 'border-red-500' : ''}/>
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="age">Age *</label_1.Label>
                  <input_1.Input id="age" type="number" min="5" max="18" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} placeholder="Enter age (5-18)" className={errors.age ? 'border-red-500' : ''}/>
                  {errors.age && <p className="text-sm text-red-500">{errors.age}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="gender">Gender *</label_1.Label>
                  <select_1.Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <select_1.SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                      <select_1.SelectValue placeholder="Select gender"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      <select_1.SelectItem value="MALE">Male</select_1.SelectItem>
                      <select_1.SelectItem value="FEMALE">Female</select_1.SelectItem>
                      <select_1.SelectItem value="OTHER">Other</select_1.SelectItem>
                    </select_1.SelectContent>
                  </select_1.Select>
                  {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="language">Preferred Language *</label_1.Label>
                  <select_1.Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                    <select_1.SelectTrigger>
                      <select_1.SelectValue placeholder="Select language"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {LANGUAGES.map(lang => (<select_1.SelectItem key={lang} value={lang}>{lang}</select_1.SelectItem>))}
                    </select_1.SelectContent>
                  </select_1.Select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Location</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="state">State *</label_1.Label>
                  <select_1.Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                    <select_1.SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                      <select_1.SelectValue placeholder="Select state"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {INDIAN_STATES.map(state => (<select_1.SelectItem key={state} value={state}>{state}</select_1.SelectItem>))}
                    </select_1.SelectContent>
                  </select_1.Select>
                  {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="district">District *</label_1.Label>
                  <input_1.Input id="district" type="text" value={formData.district} onChange={(e) => handleInputChange('district', e.target.value)} placeholder="Enter district name" className={errors.district ? 'border-red-500' : ''}/>
                  {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                </div>
              </div>
            </div>

            {/* Educational Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Educational Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label_1.Label htmlFor="schoolLevel">School Level *</label_1.Label>
                  <input_1.Input id="schoolLevel" type="text" value={formData.schoolLevel} onChange={(e) => handleInputChange('schoolLevel', e.target.value)} placeholder="e.g., Class 8, Class 10, etc." className={errors.schoolLevel ? 'border-red-500' : ''}/>
                  {errors.schoolLevel && <p className="text-sm text-red-500">{errors.schoolLevel}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label htmlFor="background">Background Information *</label_1.Label>
                <textarea_1.Textarea id="background" value={formData.background} onChange={(e) => handleInputChange('background', e.target.value)} placeholder="Provide information about family background, economic situation, etc." rows={3} className={errors.background ? 'border-red-500' : ''}/>
                {errors.background && <p className="text-sm text-red-500">{errors.background}</p>}
              </div>
            </div>

            {/* Interests */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Interests *</h3>
              
              <div className="space-y-2">
                <label_1.Label>Add Interests</label_1.Label>
                <div className="flex gap-2">
                  <input_1.Input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="Type an interest..." onKeyPress={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addInterest(newInterest);
            }
        }}/>
                  <button_1.Button type="button" onClick={() => addInterest(newInterest)} size="sm">
                    <lucide_react_1.Plus className="h-4 w-4"/>
                  </button_1.Button>
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label>Common Interests (click to add)</label_1.Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_INTERESTS.map(interest => (<badge_1.Badge key={interest} variant={formData.interests.includes(interest) ? "default" : "outline"} className="cursor-pointer" onClick={() => addInterest(interest)}>
                      {interest}
                    </badge_1.Badge>))}
                </div>
              </div>

              {formData.interests.length > 0 && (<div className="space-y-2">
                  <label_1.Label>Selected Interests</label_1.Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests.map(interest => (<badge_1.Badge key={interest} variant="default" className="flex items-center gap-1">
                        {interest}
                        <button type="button" onClick={() => removeInterest(interest)} className="ml-1 hover:text-red-300">
                          <lucide_react_1.X className="h-3 w-3"/>
                        </button>
                      </badge_1.Badge>))}
                  </div>
                </div>)}
              {errors.interests && <p className="text-sm text-red-500">{errors.interests}</p>}
            </div>

            {/* Challenges */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Challenges *</h3>
              
              <div className="space-y-2">
                <label_1.Label>Add Challenges</label_1.Label>
                <div className="flex gap-2">
                  <input_1.Input value={newChallenge} onChange={(e) => setNewChallenge(e.target.value)} placeholder="Type a challenge..." onKeyPress={(e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addChallenge(newChallenge);
            }
        }}/>
                  <button_1.Button type="button" onClick={() => addChallenge(newChallenge)} size="sm">
                    <lucide_react_1.Plus className="h-4 w-4"/>
                  </button_1.Button>
                </div>
              </div>

              <div className="space-y-2">
                <label_1.Label>Common Challenges (click to add)</label_1.Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_CHALLENGES.map(challenge => (<badge_1.Badge key={challenge} variant={formData.challenges.includes(challenge) ? "default" : "outline"} className="cursor-pointer" onClick={() => addChallenge(challenge)}>
                      {challenge}
                    </badge_1.Badge>))}
                </div>
              </div>

              {formData.challenges.length > 0 && (<div className="space-y-2">
                  <label_1.Label>Selected Challenges</label_1.Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.challenges.map(challenge => (<badge_1.Badge key={challenge} variant="destructive" className="flex items-center gap-1">
                        {challenge}
                        <button type="button" onClick={() => removeChallenge(challenge)} className="ml-1 hover:text-red-300">
                          <lucide_react_1.X className="h-3 w-3"/>
                        </button>
                      </badge_1.Badge>))}
                  </div>
                </div>)}
              {errors.challenges && <p className="text-sm text-red-500">{errors.challenges}</p>}
            </div>

            {/* Error Display */}
            {errors.general && (<alert_1.Alert variant="destructive">
                <lucide_react_1.AlertCircle className="h-4 w-4"/>
                <alert_1.AlertDescription>{errors.general}</alert_1.AlertDescription>
              </alert_1.Alert>)}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button_1.Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </button_1.Button>
              <button_1.Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (<>
                    <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                    Adding Child...
                  </>) : ('Add Child Profile')}
              </button_1.Button>
            </div>
          </form>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
exports.default = AddChildPage;
