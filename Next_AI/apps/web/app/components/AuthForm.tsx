"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, Lock, Github, Chrome, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Register, Login } from "@/lib/AxiosInstanxe";
import { AuthType } from "@/types/AuthType";
import { BACKEND_URL } from "config";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Handle OAuth token from URL
  useEffect(() => {
    const oauthToken = searchParams.get("token");
    if (oauthToken) {
      localStorage.setItem("token", oauthToken);
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let formData: AuthType = { email, password };
      if (mode === "register") {
        if (!name.trim()) {
          setError("Name is required");
          setLoading(false);
          return;
        }
        formData.name = name;
      }

      const response = mode === "register" ? await Register(formData) : await Login(formData);

      if (response?.token) {
        localStorage.setItem("token", response.token);
        setSuccess(true);
        setError(null);
        // Redirect to home page after successful login/signup
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setError(
        error.response?.data?.error || 
        `Failed to ${mode === "login" ? "sign in" : "create account"}. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/v1/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${BACKEND_URL}/api/v1/auth/github`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {mode === "login" 
              ? "Sign in to your account to continue" 
              : "Get started with Next AI today"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{mode === "login" ? "Successfully signed in! Redirecting..." : "Account created successfully! Redirecting..."}</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || success}
              className="w-full h-11 bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-medium shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {mode === "login" ? "Signed In!" : "Account Created!"}
                </>
              ) : (
                mode === "login" ? "Sign In" : "Create Account"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="h-11 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Google
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleGithubLogin}
              disabled={loading}
              className="h-11 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="font-medium text-gray-900 hover:underline"
                >
                  Sign up
                </a>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <a
                  href="/login"
                  className="font-medium text-gray-900 hover:underline"
                >
                  Sign in
                </a>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

