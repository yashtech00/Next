"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, User, Lock, Github, Chrome, LogOut } from "lucide-react";
import { Register, Login } from "@/lib/AxiosInstanxe";
import { AuthType } from "@/types/AuthType";

export default function UniqueForm({ mode }: { mode: "register" | "login" }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let formData: AuthType = { email, password };

      if (mode === "register") formData.name = name;

      const response = mode === "register" ? await Register(formData) : await Login(formData);

      if (response?.token) {
        localStorage.setItem("token", response.token);
        setToken(response.token);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/api/v1/auth/google";
  };

  const handleGithubLogin = () => {
    window.location.href = "http://localhost:8080/api/v1/auth/github";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");
    if (oauthToken) {
      localStorage.setItem("token", oauthToken);
      setToken(oauthToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="w-full h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-xl rounded-2xl border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-3xl font-semibold text-center text-gray-900 tracking-tight">
            {token ? "Welcome Back" : mode === "login" ? "Sign in to continue" : "Create Your Account"}
          </CardTitle>
        </CardHeader>

        <CardContent className="px-7 pb-8">
          {token ? (
            <div className="flex flex-col items-center gap-6">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full border-gray-300 hover:bg-gray-100 h-11 rounded-xl"
              >
                <LogOut className="w-4 h-4 text-gray-800" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">

                {mode === "register" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-white">
                      <User className="w-4 h-4 text-gray-500" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-white">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="flex items-center gap-2 border rounded-xl px-3 py-2.5 bg-white">
                    <Lock className="w-4 h-4 text-gray-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:outline-none shadow-none"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 rounded-xl text-white font-medium shadow-md">
                  {mode === "login" ? "Sign In" : "Get Started"}
                </Button>
              </form>
                <div className="mt-3 flex flex-col gap-3">
                  <div className="text-center text-gray-500 text-sm">or continue with</div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleGoogleLogin}
                      className="flex items-center gap-2 w-full border-gray-300 hover:bg-gray-100 h-11 rounded-xl"
                    >
                      <Chrome className="w-4 h-4" />
                      Google
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleGithubLogin}
                      className="flex items-center gap-2 w-full border-gray-300 hover:bg-gray-100 h-11 rounded-xl"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </Button>
                  </div>
                </div>
            
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
