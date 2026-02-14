import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/slices/authSlice";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Auth = () => {
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const validateEmail = (email) => emailRegex.test(email);

  const handleLogin = async () => {
    if (!email) return toast.error("Email is required");
    if (!validateEmail(email)) return toast.error("Invalid email address");
    if (!password) return toast.error("Password is required");

    try {
      const response = await apiClient.post(
        LOGIN_ROUTE,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        const user = response.data.message;
        dispatch(loginSuccess(user));
        toast.success(`Welcome back`);
      }
    } catch {
      toast.error("Login failed email or password is incorrect");
    }
  };

  const handleSignUp = async () => {
    if (!name) return toast.error("Name is required");
    if (!email) return toast.error("Email is required");
    if (!validateEmail(email)) return toast.error("Invalid email address");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword)
      return toast.error("Password and Confirm Password do not match");

    try {
      const response = await apiClient.post(
        SIGNUP_ROUTE,
        { name, email, password },
        { withCredentials: true }
      );
      if (response.data.success) {
        dispatch(loginSuccess(response.data.message));
        toast.success("Account created successfully");
      }
    } catch {
      toast.error("Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl px-10 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            Smart Bank Reconciliation
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Secure access for reconciliation & audit operations
          </p>
        </div>

        {/* Admin Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Switch checked={isAdminLogin} onCheckedChange={setIsAdminLogin} />
          <span className="text-sm font-medium">Admin Mode</span>
          {isAdminLogin && <Badge variant="destructive">Admin</Badge>}
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            {!isAdminLogin && <TabsTrigger value="signup">Sign Up</TabsTrigger>}
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login" className="space-y-5">
            <Input
              placeholder="Email address"
              type="email"
              className="h-11"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              className="h-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button className="w-full h-11 mt-4 cursor-pointer" onClick={handleLogin}>
              {isAdminLogin ? "Login as Admin" : "Login"}
            </Button>
          </TabsContent>

          {/* SIGNUP */}
          {!isAdminLogin && (
            <TabsContent value="signup" className="space-y-5">
              <Input
                placeholder="Full Name"
                className="h-11"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                placeholder="Email address"
                type="email"
                className="h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                placeholder="Password"
                type="password"
                className="h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                placeholder="Confirm Password"
                type="password"
                className="h-11"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button className="w-full h-11 mt-4 cursor-pointer" onClick={handleSignUp}>
                Create Account
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Analyst access is granted by administrators after approval
              </p>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
