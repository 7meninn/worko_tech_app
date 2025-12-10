import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { toast } from "sonner";
import { login, googleInit, googleComplete } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoogleLogin } from '@react-oauth/google';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location state

  // Initialize role based on navigation state if available, else default to 'user'
  const [role, setRole] = useState(location.state?.preferredRole || "user");
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Google State
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [googleData, setGoogleData] = useState(null);
  const [googlePhone, setGooglePhone] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("worko_user");
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.role === "expert") navigate('/dashboard');
      else navigate('/home');
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // --- STANDARD LOGIN ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login(formData.email, formData.password, role);
      toast.success(`Welcome back, ${response.user.name}!`);
      
      const userData = { ...response.user, role }; 
      localStorage.setItem("worko_user", JSON.stringify(userData));
      
      if (role === "expert") navigate('/dashboard');
      else navigate('/home');

    } catch (error) {
      toast.error("Login Failed", { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // --- GOOGLE LOGIN FLOW ---
  const handleGoogleClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
           headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        handleBackendGoogleCheck({ email: userInfo.email, name: userInfo.name, picture: userInfo.picture });
      } catch (err) {
        toast.error("Google Login Failed");
      }
    },
    onError: () => toast.error("Google Login Failed"),
  });

  const handleBackendGoogleCheck = async (profileData) => {
    try {
      const response = await googleInit(null, profileData);
      if (response.status === "logged_in") {
        toast.success("Welcome back!");
        localStorage.setItem("worko_user", JSON.stringify({ ...response.user, role: "user" }));
        navigate('/home');
      } else if (response.status === "needs_phone") {
        setGoogleData(response.googleData);
        setShowPhoneInput(true); 
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleGoogleFinalize = async () => {
    if (!googlePhone) return toast.error("Phone number is required");
    try {
      const response = await googleComplete(googleData, googlePhone);
      toast.success("Account Created & Logged In!");
      localStorage.setItem("worko_user", JSON.stringify({ ...response.user, role: "user" }));
      navigate('/home');
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Colors
  const themeColor = role === 'expert' ? 'bg-zinc-900' : 'bg-indigo-600';
  const buttonColor = role === 'expert' ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-indigo-600 hover:bg-indigo-700';
  const textColor = role === 'expert' ? 'text-zinc-900' : 'text-indigo-600';

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* LEFT SIDE: Dynamic Art & LOGO */}
      <div className={`hidden lg:flex lg:w-1/2 relative justify-center items-center overflow-hidden transition-colors duration-500 ${themeColor}`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        <div className="relative z-10 text-center text-white p-12 flex flex-col items-center">
          {/* LOGO IMAGE */}
          <img src="/Logo.svg" alt="Worko Logo" className="w-20 h-20 mb-4" />
          <h1 className="text-5xl font-bold tracking-tight mb-4">Worko.</h1>
          <p className="text-lg opacity-90 max-w-sm mx-auto">
            {role === 'expert' 
              ? "Manage your business, accept jobs, and get paid instantly." 
              : "Book trusted professionals for all your home service needs."}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/50">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-zinc-900">
              {showPhoneInput ? "One Last Step" : "Welcome Back"}
            </CardTitle>
            
            {!showPhoneInput && (
              <div className="pt-4 flex justify-center mb-2">
                <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-lg w-full">
                  <button type="button" onClick={() => setRole("user")} className={`py-2 text-sm font-medium rounded-md transition-all ${role === 'user' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>Customer</button>
                  <button type="button" onClick={() => setRole("expert")} className={`py-2 text-sm font-medium rounded-md transition-all ${role === 'expert' ? 'bg-white shadow-sm text-zinc-900' : 'text-gray-500 hover:text-gray-900'}`}>Service Expert</button>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {/* --- GOOGLE PHONE INPUT & STANDARD FORM (No changes here) --- */}
            {showPhoneInput ? (
               <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                 <div className="text-center mb-4">
                  {/* AVATAR REPLACEMENT */}
                  <Avatar className="h-16 w-16 mx-auto mb-2 border-2 border-indigo-100">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold text-xl">
                      {googleData.name
                        ? googleData.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <p className="text-gray-700">Hi <strong>{googleData.name}</strong>,</p>
                  <p className="text-sm text-gray-500">Please confirm your phone number to continue.</p>
                </div>
                 <div className="space-y-2">
                   <Label htmlFor="gPhone">Phone Number</Label>
                   <Input id="gPhone" type="tel" value={googlePhone} onChange={(e) => setGooglePhone(e.target.value)} autoFocus required />
                 </div>
                 <Button onClick={handleGoogleFinalize} className={`w-full h-11 text-white font-medium ${buttonColor}`}>Complete Login</Button>
                 <Button variant="ghost" className="w-full" onClick={() => setShowPhoneInput(false)}>Back</Button>
               </div>
            ) : (
              <>
                {role === 'user' && (
                  <div className="mb-6">
                    <Button type="button" variant="outline" className="w-full h-11 border-gray-300 font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2" onClick={() => handleGoogleClick()}>
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
                      Continue with Google
                    </Button>
                    <div className="relative mt-4">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/0 px-2 text-gray-400 bg-white">Or continue with email</span></div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" className="h-11" value={formData.password} onChange={handleInputChange} required />
                  </div>
                  <Button type="submit" className={`w-full h-11 text-white font-medium shadow-md transition-all ${buttonColor}`} disabled={isLoading}>
                    {isLoading ? "Signing in..." : `Login as ${role === 'expert' ? 'Expert' : 'Customer'}`}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-2">
            {!showPhoneInput && (
              <p className="text-sm text-gray-600">
                New here?{' '}
                {/* PASS STATE TO SIGNUP PAGE */}
                <Link to="/signup" state={{ preferredRole: role }} className={`font-semibold hover:underline ${textColor}`}>
                  Create {role === 'expert' ? 'Expert' : 'Customer'} Account
                </Link>
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;