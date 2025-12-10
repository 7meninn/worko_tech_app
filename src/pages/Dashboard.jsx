import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Clock, Wallet, Star, History, ArrowRight } from "lucide-react"; 
import { logoutUser, getWalletDetails, requestWithdrawal, getExpertJobs, acceptJob } from "@/api/auth";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // States
  const [balance, setBalance] = useState(0);
  const [upiId, setUpiId] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [activeRequest, setActiveRequest] = useState(null);
  const [jobs, setJobs] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("worko_user");
    if (!storedUser) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchDashboardData(parsedUser.id);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user?.id) return;
    const intervalId = setInterval(() => { fetchDashboardData(user.id, true); }, 3000);
    return () => clearInterval(intervalId);
  }, [user]);

  const fetchDashboardData = useCallback(async (expertId, silent = false) => {
    try {
      const [walletData, jobsData] = await Promise.all([
        getWalletDetails(),
        getExpertJobs(expertId)
      ]);
      setBalance(walletData.balance);
      setUpiId(walletData.upiId || "");
      setActiveRequest(walletData.activeRequest);
      // Filter dashboard to only show active/in-progress jobs
      setJobs(jobsData.filter(j => j.status !== 'completed' && j.status !== 'cancelled'));
    } catch (error) {
      if (!silent) console.error("Failed to load dashboard data", error);
    }
  }, []);

  const handleAcceptJob = async (jobId) => {
    setActionLoading(jobId);
    try {
      await acceptJob(jobId);
      toast.success("Job accepted!");
      fetchDashboardData(user.id);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return toast.error("Invalid amount");
    if (Number(withdrawAmount) > balance) return toast.error("Insufficient balance");
    if (!upiId) return toast.error("Enter UPI ID");

    setIsLoading(true);
    try {
      await requestWithdrawal(Number(withdrawAmount), upiId);
      toast.success("Request submitted!");
      setWithdrawAmount("");
      fetchDashboardData(user.id);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try { await logoutUser(); localStorage.removeItem("worko_user"); navigate("/"); } catch (error) {}
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Expert Dashboard</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg text-gray-600">Welcome, </span>
              <span className="text-lg font-semibold text-gray-900">{user.name}</span>
              <Badge variant="outline" className="ml-2 border-indigo-200 text-indigo-700 bg-indigo-50 capitalize">
                {user.category}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             {/* RATING DISPLAY */}
             <div className="flex flex-col items-end">
                <span className="text-xs text-gray-500 uppercase font-semibold">Average Rating</span>
                <div className="flex items-center gap-1">
                   <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                   <span className="text-2xl font-bold text-gray-900">{user.ratings || "0.0"}</span>
                </div>
             </div>
             
             <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>

             <Button variant="destructive" onClick={handleLogout} size="sm">Logout</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Wallet (1/3) */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="shadow-sm border-indigo-100 overflow-hidden relative">
              <div className="bg-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 opacity-90">
                    <Wallet className="h-4 w-4" />
                    <span className="text-sm font-medium">Balance</span>
                  </div>
                  {/* HISTORY BUTTON */}
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-indigo-500 h-6 px-2 text-xs"
                    onClick={() => navigate("/withdrawals")}
                  >
                    History <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
                <div className="text-4xl font-bold tracking-tight">
                  ₹{balance.toLocaleString()}
                </div>
              </div>
              
              <div className="p-6 bg-white space-y-4">
                 {activeRequest ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-yellow-800 font-semibold mb-1">
                        <Clock className="h-4 w-4" /> Pending
                      </div>
                      <p className="text-sm text-yellow-700">₹{activeRequest.amount}</p>
                    </div>
                 ) : (
                   <>
                     <div className="space-y-2">
                       <Label className="text-xs text-gray-500 uppercase font-semibold">Withdraw</Label>
                       <Input placeholder="UPI ID" value={upiId} onChange={e => setUpiId(e.target.value)} className="h-9" />
                       <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-500">₹</span>
                          <Input type="number" placeholder="0" className="pl-8 h-9" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
                       </div>
                     </div>
                     <Button onClick={handleWithdraw} disabled={isLoading || balance <= 0} className="w-full bg-indigo-600 hover:bg-indigo-700 h-9">
                       {isLoading ? "Processing..." : "Request Payout"}
                     </Button>
                   </>
                 )}
              </div>
            </Card>
          </div>

          {/* RIGHT: Active Jobs (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <h2 className="text-xl font-bold text-gray-900">Active Jobs</h2>
                 <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                 </span>
               </div>
               
               {/* PAST JOBS BUTTON */}
               <Button variant="outline" size="sm" onClick={() => navigate("/jobs-history")}>
                 <History className="mr-2 h-4 w-4" /> View Completed Jobs
               </Button>
            </div>
            
            {jobs.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center text-gray-400 gap-2">
                <p>No active jobs found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {jobs.map((job) => (
                  <Card key={job._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 shadow-sm hover:shadow-md transition-all border-l-4 border-l-indigo-500">
                    <div className="flex flex-col gap-1 mb-4 sm:mb-0">
                      <h3 className="text-lg font-bold text-gray-900">{job.userId?.name || "Guest User"}</h3>
                      <p className="text-gray-600 text-sm">📍 {job.location}</p>
                      <div className="flex gap-4 text-sm text-gray-500 mt-1">
                        <span>📅 {job.date}</span>
                        <span>⏰ {job.time}</span>
                      </div>
                    </div>

                    <div>
                      {job.status === 'active' && (
                        <Button 
                          onClick={() => handleAcceptJob(job._id)}
                          disabled={actionLoading === job._id}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
                        >
                          {actionLoading === job._id ? "Accepting..." : "Accept Job"}
                        </Button>
                      )}
                      {job.status === 'in-progress' && (
                        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md border border-blue-100 text-sm font-medium animate-pulse">
                          In Progress...
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;