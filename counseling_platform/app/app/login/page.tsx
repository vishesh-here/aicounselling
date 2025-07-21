"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Eye, EyeOff, AlertCircle, Users, BookOpen, Sparkles, ArrowRight, Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const callbackUrl = searchParams?.get('callbackUrl');

  useEffect(() => {
    const message = searchParams?.get('message');
    if (message === 'signup-success') {
      toast.success('Registration submitted successfully! Your application is pending admin approval.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (supabaseError) {
        setError(supabaseError.message || "Invalid email or password");
        toast.error(supabaseError.message || "Invalid email or password");
      } else if (data.user) {
        toast.success("Login successful!");
        const isSafeCallback = callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.includes("://");
        if (isSafeCallback && callbackUrl !== "/login" && callbackUrl !== "") {
          router.push(callbackUrl);
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Invalid email or password");
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 text-white p-12 flex-col justify-center">
        <div className="max-w-md mx-auto">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <Heart className="h-10 w-10 text-white mr-3" />
            <span className="text-2xl font-bold">Talesmith.ai</span>
          </div>

          {/* Hero Content */}
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Rise above the script written by circumstance
          </h1>
          
          <p className="text-xl mb-8 text-orange-100 leading-relaxed">
            A youth-led movement reimagining what's possible for India's children through courage, care and connection.
          </p>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-3 text-orange-200" />
              <span className="text-orange-100">AI-powered storytelling companion</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-3 text-orange-200" />
              <span className="text-orange-100">Culturally-aware mentoring</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-3 text-orange-200" />
              <span className="text-orange-100">Indian context understanding</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-orange-400">
            <div className="text-center">
              <div className="text-2xl font-bold">100+</div>
              <div className="text-sm text-orange-200">Active Mentors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">25+</div>
              <div className="text-sm text-orange-200">States Covered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">1000+</div>
              <div className="text-sm text-orange-200">Mentorship Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="h-12 w-12 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Talesmith.ai
            </h1>
            <p className="text-gray-600">
              Indian Context-Aware AI for Empowering Stories
            </p>
          </div>

          {/* Login Card */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to continue your journey of empowering stories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 h-10 w-10 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Signup Section */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center mb-4">
                  New to Talesmith.ai?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400"
                  onClick={() => router.push('/signup')}
                >
                  Apply to Volunteer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 space-y-2">
            <div className="flex items-center justify-center space-x-1 text-sm text-gray-500">
              <Star className="h-4 w-4 text-orange-500" />
              <span>Built with ❤️ for India</span>
              <Star className="h-4 w-4 text-orange-500" />
            </div>
            <p className="text-xs text-gray-400">
              Empowering underprivileged children through culturally-aware AI storytelling
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
