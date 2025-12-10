import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, User } from "lucide-react";
import { toast } from "sonner";
import { getExpertJobs } from "@/api/auth";

const JobHistory = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("worko_user"));
        const data = await getExpertJobs(user.id);
        // Filter only completed jobs
        setJobs(data.filter(job => job.status === 'completed'));
      } catch (error) {
        toast.error("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Job History</h1>
        </div>

        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-10 text-gray-500">Loading history...</div>
          ) : jobs.length === 0 ? (
             <div className="text-center py-10 text-gray-500">No completed jobs yet.</div>
          ) : (
            jobs.map((job) => (
              <Card key={job._id} className="shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    
                    {/* Job Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-900">{job.userId?.name || "Guest User"}</h3>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
                      </div>
                      <p className="text-sm text-gray-600">📍 {job.location}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(job.date).toDateString()} • {job.time}
                      </p>
                    </div>

                    {/* Rating Section */}
                    <div className="bg-gray-50 p-4 rounded-lg min-w-[200px]">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= (job.clientRating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} 
                          />
                        ))}
                        <span className="text-sm font-semibold ml-2 text-gray-700">
                          {job.clientRating ? job.clientRating + ".0" : "No Rating"}
                        </span>
                      </div>
                      {job.clientReview ? (
                        <p className="text-sm text-gray-600 italic">"{job.clientReview}"</p>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No review provided</p>
                      )}
                    </div>

                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default JobHistory;