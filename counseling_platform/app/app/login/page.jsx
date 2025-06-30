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
const react_1 = require("react");
const react_2 = require("next-auth/react");
const navigation_1 = require("next/navigation");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const card_1 = require("@/components/ui/card");
const alert_1 = require("@/components/ui/alert");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
function LoginPage() {
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [showPassword, setShowPassword] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)("");
    const router = (0, navigation_1.useRouter)();
    const searchParams = (0, navigation_1.useSearchParams)();
    (0, react_1.useEffect)(() => {
        const message = searchParams === null || searchParams === void 0 ? void 0 : searchParams.get('message');
        if (message === 'signup-success') {
            sonner_1.toast.success('Registration submitted successfully! Your application is pending admin approval.');
        }
    }, [searchParams]);
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const result = yield (0, react_2.signIn)("credentials", {
                email,
                password,
                redirect: false,
            });
            if (result === null || result === void 0 ? void 0 : result.error) {
                if (result.error.includes("pending approval")) {
                    setError("Your account is pending admin approval. Please wait for approval before logging in.");
                    sonner_1.toast.error("Account pending approval");
                }
                else if (result.error.includes("rejected")) {
                    setError("Your account application has been rejected. Please contact support for more information.");
                    sonner_1.toast.error("Account rejected");
                }
                else {
                    setError("Invalid email or password");
                    sonner_1.toast.error("Invalid email or password");
                }
            }
            else {
                sonner_1.toast.success("Login successful!");
                router.push("/dashboard");
            }
        }
        catch (error) {
            console.error("Login error:", error);
            setError("Something went wrong. Please try again.");
            sonner_1.toast.error("Something went wrong. Please try again.");
        }
        finally {
            setIsLoading(false);
        }
    });
    const fillDemoCredentials = (role) => {
        if (role === "admin") {
            setEmail("admin@counseling.org");
            setPassword("admin123");
        }
        else {
            setEmail("john@doe.com");
            setPassword("johndoe123");
        }
    };
    return (<div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <lucide_react_1.Heart className="h-12 w-12 text-orange-600"/>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Talesmith.ai
          </h1>
          <p className="text-gray-600">
            AI-powered counseling for India's children through stories and guidance
          </p>
        </div>

        {/* Login Card */}
        <card_1.Card className="shadow-lg">
          <card_1.CardHeader>
            <card_1.CardTitle>Welcome Back</card_1.CardTitle>
            <card_1.CardDescription>
              Sign in to your account to continue
            </card_1.CardDescription>
          </card_1.CardHeader>
          <card_1.CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input_1.Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required/>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input_1.Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required/>
                  <button_1.Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-8 w-8" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? (<lucide_react_1.EyeOff className="h-4 w-4"/>) : (<lucide_react_1.Eye className="h-4 w-4"/>)}
                  </button_1.Button>
                </div>
              </div>

              <button_1.Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </button_1.Button>
            </form>

            {/* Error Display */}
            {error && (<alert_1.Alert variant="destructive" className="mt-4">
                <lucide_react_1.AlertCircle className="h-4 w-4"/>
                <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
              </alert_1.Alert>)}

            {/* Signup Section */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                New volunteer?
              </p>
              <button_1.Button type="button" variant="outline" className="w-full" onClick={() => router.push('/signup')}>
                Apply to Volunteer
              </button_1.Button>
            </div>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3 text-center">
                Demo Accounts:
              </p>
              <div className="flex gap-2">
                <button_1.Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fillDemoCredentials("admin")}>
                  Admin Demo
                </button_1.Button>
                <button_1.Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fillDemoCredentials("volunteer")}>
                  Volunteer Demo
                </button_1.Button>
              </div>
            </div>
          </card_1.CardContent>
        </card_1.Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Talesmith.ai - Where AI meets compassion</p>
          <p>Empowering underprivileged children across India through stories</p>
        </div>
      </div>
    </div>);
}
exports.default = LoginPage;
