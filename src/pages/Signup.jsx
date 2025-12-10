import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import { toast } from "sonner";
import { register } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location state

  // Initialize role based on navigation state if available, else default to 'user'
  const [role, setRole] = useState(location.state?.preferredRole || "user");
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    category: "plumbing"
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        ...(role === 'expert' && { category: formData.category })
      };

      const response = await register(payload, role);
      toast.success("Account Created Successfully!");
      
      const userData = { ...response.user, role };
      localStorage.setItem("worko_user", JSON.stringify(userData));
      
      setTimeout(() => {
        if (role === "expert") navigate('/dashboard');
        else navigate('/home');
      }, 1000);

    } catch (error) {
      console.error(error);
      toast.error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    toast.info("For Google Signup, please use the Login page. If you are a new user, you will be prompted to create an account there.");
  };

  // Dynamic Theme Colors
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
           <h1 className="text-5xl font-bold mb-6 tracking-tight">Join Worko.</h1>
           <p className="text-xl opacity-90">
             {role === 'expert' ? "Grow your service business." : "The best experts, right at your doorstep."}
           </p>
        </div>
      </div>

      {/* RIGHT SIDE: Signup Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50/50">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            
             {/* ROLE TOGGLE */}
             <div className="pt-4 flex justify-center mb-2">
              <div className="grid grid-cols-2 bg-gray-100 p-1 rounded-lg w-full">
                <button type="button" onClick={() => setRole("user")} className={`py-2 text-sm font-medium rounded-md transition-all ${role === 'user' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>I need a Service</button>
                <button type="button" onClick={() => setRole("expert")} className={`py-2 text-sm font-medium rounded-md transition-all ${role === 'expert' ? 'bg-white shadow-sm text-zinc-900' : 'text-gray-500 hover:text-gray-900'}`}>I am an Expert</button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* GOOGLE BUTTON (Customer Only) - Redirects to Login for flow consistency */}
            {role === 'user' && (
              <div className="mb-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full h-11 border-gray-300 font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                  onClick={handleGoogleSignup}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />
                  Sign up with Google
                </Button>
                <div className="relative mt-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/0 px-2 text-gray-400 bg-white">Or continue with email</span></div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={formData.lastName} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} required />
              </div>
              {role === 'expert' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                   <Label htmlFor="category">Service Category</Label>
                   <div className="relative">
                     <select id="category" className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500" value={formData.category} onChange={handleInputChange}>
                       <option value="plumbing">Plumbing</option>
                       <option value="paint">Paint</option>
                       <option value="home-repairs">Home Repairs</option>
                       <option value="cleaning">Cleaning</option>
                     </select>
                   </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required />
              </div>
              <Button type="submit" className={`w-full h-11 text-white font-medium mt-2 shadow-md transition-all ${buttonColor}`} disabled={isLoading}>
                {isLoading ? "Creating..." : `Register as ${role === 'expert' ? 'Expert' : 'Customer'}`}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pt-2">
            <p className="text-sm text-gray-600">
              Already have an account? 
              {/* PASS STATE TO LOGIN PAGE */}
              <Link to="/" state={{ preferredRole: role }} className={`font-semibold hover:underline ${textColor}`}>Sign in</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;