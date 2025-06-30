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
const lucide_react_1 = require("lucide-react");
const alert_1 = require("@/components/ui/alert");
const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
];
const SPECIALIZATIONS = [
    "Child Psychology", "Career Guidance", "Educational Support", "Emotional Support",
    "Family Counseling", "Trauma Counseling", "Academic Support", "Life Skills",
    "Art Therapy", "Play Therapy", "Behavioral Support", "Crisis Intervention",
    "Special Needs", "Learning Disabilities", "Mathematics Tutoring", "Science Tutoring",
    "Language Support", "Social Skills", "Conflict Resolution", "Peer Mediation"
];
function SignupPage() {
    const router = (0, navigation_1.useRouter)();
    const [formData, setFormData] = (0, react_1.useState)({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        state: '',
        specialization: '',
        experience: '',
        motivation: ''
    });
    const [errors, setErrors] = (0, react_1.useState)({});
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [submitStatus, setSubmitStatus] = (0, react_1.useState)('idle');
    const validateForm = () => {
        var _a, _b, _c, _d, _e;
        const newErrors = {};
        if (!((_a = formData.name) === null || _a === void 0 ? void 0 : _a.trim())) {
            newErrors.name = 'Full name is required';
        }
        if (!((_b = formData.email) === null || _b === void 0 ? void 0 : _b.trim())) {
            newErrors.email = 'Email is required';
        }
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters long';
        }
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        }
        else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (!((_c = formData.phone) === null || _c === void 0 ? void 0 : _c.trim())) {
            newErrors.phone = 'Phone number is required';
        }
        else if (!/^[+]?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }
        if (!formData.state) {
            newErrors.state = 'Please select your state';
        }
        if (!formData.specialization) {
            newErrors.specialization = 'Please select your area of specialization';
        }
        if (!((_d = formData.experience) === null || _d === void 0 ? void 0 : _d.trim())) {
            newErrors.experience = 'Please describe your experience';
        }
        else if (formData.experience.length < 20) {
            newErrors.experience = 'Please provide more details about your experience (at least 20 characters)';
        }
        if (!((_e = formData.motivation) === null || _e === void 0 ? void 0 : _e.trim())) {
            newErrors.motivation = 'Please explain your motivation';
        }
        else if (formData.motivation.length < 20) {
            newErrors.motivation = 'Please provide more details about your motivation (at least 20 characters)';
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
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        setSubmitStatus('idle');
        try {
            const response = yield fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim().toLowerCase(),
                    password: formData.password,
                    phone: formData.phone.trim(),
                    state: formData.state,
                    specialization: formData.specialization,
                    experience: formData.experience.trim(),
                    motivation: formData.motivation.trim()
                })
            });
            const result = yield response.json();
            if (response.ok) {
                setSubmitStatus('success');
                setTimeout(() => {
                    router.push('/login?message=signup-success');
                }, 3000);
            }
            else {
                setSubmitStatus('error');
                if (result.errors) {
                    setErrors(result.errors);
                }
            }
        }
        catch (error) {
            console.error('Signup error:', error);
            setSubmitStatus('error');
        }
        finally {
            setIsLoading(false);
        }
    });
    if (submitStatus === 'success') {
        return (<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <card_1.Card className="w-full max-w-md">
          <card_1.CardContent className="pt-6">
            <div className="text-center space-y-4">
              <lucide_react_1.CheckCircle className="mx-auto h-16 w-16 text-green-500"/>
              <h2 className="text-2xl font-bold text-gray-900">Registration Submitted!</h2>
              <p className="text-gray-600">
                Thank you for your interest in volunteering. Your application has been submitted 
                and is pending admin approval. You will be notified once your account is reviewed.
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to login page...
              </p>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Talesmith.ai</h1>
          <p className="text-gray-600">
            Help make a difference through AI-powered counseling and storytelling for children across India
          </p>
        </div>

        <card_1.Card>
          <card_1.CardHeader>
            <card_1.CardTitle>Volunteer Registration</card_1.CardTitle>
            <card_1.CardDescription>
              Please fill out this form to apply as a volunteer counselor. All applications 
              require admin approval before account activation.
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="name">Full Name *</label_1.Label>
                    <input_1.Input id="name" type="text" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter your full name" className={errors.name ? 'border-red-500' : ''}/>
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="email">Email Address *</label_1.Label>
                    <input_1.Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="Enter your email" className={errors.email ? 'border-red-500' : ''}/>
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="password">Password *</label_1.Label>
                    <input_1.Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="Minimum 8 characters" className={errors.password ? 'border-red-500' : ''}/>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="confirmPassword">Confirm Password *</label_1.Label>
                    <input_1.Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} placeholder="Confirm your password" className={errors.confirmPassword ? 'border-red-500' : ''}/>
                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label_1.Label htmlFor="phone">Phone Number *</label_1.Label>
                    <input_1.Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="+91-9876543210" className={errors.phone ? 'border-red-500' : ''}/>
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <label_1.Label htmlFor="state">State *</label_1.Label>
                    <select_1.Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <select_1.SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                        <select_1.SelectValue placeholder="Select your state"/>
                      </select_1.SelectTrigger>
                      <select_1.SelectContent>
                        {INDIAN_STATES.map(state => (<select_1.SelectItem key={state} value={state}>{state}</select_1.SelectItem>))}
                      </select_1.SelectContent>
                    </select_1.Select>
                    {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>
                
                <div className="space-y-2">
                  <label_1.Label htmlFor="specialization">Area of Specialization *</label_1.Label>
                  <select_1.Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                    <select_1.SelectTrigger className={errors.specialization ? 'border-red-500' : ''}>
                      <select_1.SelectValue placeholder="Select your specialization"/>
                    </select_1.SelectTrigger>
                    <select_1.SelectContent>
                      {SPECIALIZATIONS.map(spec => (<select_1.SelectItem key={spec} value={spec}>{spec}</select_1.SelectItem>))}
                    </select_1.SelectContent>
                  </select_1.Select>
                  {errors.specialization && <p className="text-sm text-red-500">{errors.specialization}</p>}
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="experience">Experience & Background *</label_1.Label>
                  <textarea_1.Textarea id="experience" value={formData.experience} onChange={(e) => handleInputChange('experience', e.target.value)} placeholder="Describe your relevant experience, education, certifications, or background that qualifies you to help children..." rows={4} className={errors.experience ? 'border-red-500' : ''}/>
                  {errors.experience && <p className="text-sm text-red-500">{errors.experience}</p>}
                </div>

                <div className="space-y-2">
                  <label_1.Label htmlFor="motivation">Motivation *</label_1.Label>
                  <textarea_1.Textarea id="motivation" value={formData.motivation} onChange={(e) => handleInputChange('motivation', e.target.value)} placeholder="Why do you want to volunteer with Talesmith.ai? What motivates you to help underprivileged children through our AI-powered platform?" rows={4} className={errors.motivation ? 'border-red-500' : ''}/>
                  {errors.motivation && <p className="text-sm text-red-500">{errors.motivation}</p>}
                </div>
              </div>

              {submitStatus === 'error' && (<alert_1.Alert variant="destructive">
                  <lucide_react_1.AlertCircle className="h-4 w-4"/>
                  <alert_1.AlertDescription>
                    Registration failed. Please check your information and try again.
                  </alert_1.AlertDescription>
                </alert_1.Alert>)}

              <div className="space-y-4">
                <button_1.Button type="submit" className="w-full" disabled={isLoading} size="lg">
                  {isLoading ? (<>
                      <lucide_react_1.Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                      Submitting Application...
                    </>) : ('Submit Application')}
                </button_1.Button>

                <p className="text-sm text-gray-500 text-center">
                  Already have an account?{' '}
                  <button type="button" onClick={() => router.push('/login')} className="text-blue-600 hover:text-blue-500 font-medium">
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    </div>);
}
exports.default = SignupPage;
