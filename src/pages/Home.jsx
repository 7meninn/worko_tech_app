import React, { useState, useEffect } from 'react';
import UserNavbar from '@/components/UserNavbar';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, ShieldCheck, Wrench, Paintbrush, Hammer, Sparkles, Tv, Snowflake, User } from "lucide-react";
import { toast } from "sonner";
import { getAllExperts } from "@/api/auth";

const CATEGORIES = [
  { id: 'plumbing', label: 'Plumbing', icon: <Wrench size={24} /> },
  { id: 'paint', label: 'Painting', icon: <Paintbrush size={24} /> },
  { id: 'home-repairs', label: 'Repairs', icon: <Hammer size={24} /> },
  { id: 'cleaning', label: 'Cleaning', icon: <Sparkles size={24} /> },
  { id: 'ac-repair', label: 'AC Repair', icon: <Snowflake size={24} /> },
  { id: 'tv-installation', label: 'Electronics', icon: <Tv size={24} /> },
];

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Experts on Load
  useEffect(() => {
    const loadExperts = async () => {
      try {
        const data = await getAllExperts();
        setExperts(data);
      } catch (error) {
        console.error("Failed to load experts", error);
      } finally {
        setLoading(false);
      }
    };
    loadExperts();
  }, []);

  // Filter Logic
  const filteredExperts = experts.filter((expert) => {
    const matchesSearch = expert.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          expert.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || expert.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-10">
      <UserNavbar />

      {/* --- HERO SECTION --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Home services at your <span className="text-indigo-600">doorstep</span>
          </h1>
          <p className="text-gray-600 text-lg">What are you looking for today?</p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-lg mx-auto mb-12">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input 
            className="pl-10 h-12 rounded-full shadow-sm border-gray-200 focus:ring-2 focus:ring-indigo-500"
            placeholder="Search for 'Plumber', 'Electrician'..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? "all" : cat.id)}
              className={`flex flex-col items-center gap-3 p-4 rounded-xl transition-all ${
                selectedCategory === cat.id 
                  ? "bg-indigo-600 text-white shadow-lg scale-105" 
                  : "bg-white text-gray-600 hover:bg-gray-50 hover:shadow-md border border-gray-100"
              }`}
            >
              <div className={selectedCategory === cat.id ? "text-white" : "text-indigo-600"}>
                {cat.icon}
              </div>
              <span className="text-xs font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* --- EXPERTS LIST --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Top Rated Professionals</h2>
          <span className="text-sm text-gray-500">{filteredExperts.length} experts found</span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading experts...</div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
            No experts found for this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert) => (
              <Card key={expert._id} className="hover:shadow-lg transition-all border-gray-100 overflow-hidden group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Expert Avatar */}
                      <div className="h-16 w-16 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm">
                        {expert.photo ? (
                          <img src={expert.photo} alt={expert.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-600 font-bold text-xl">
                            {expert.fullName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {expert.fullName}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">{expert.category}</p>
                        <div className="flex items-center gap-1 mt-1 text-yellow-500 text-xs font-bold">
                          <Star className="h-3 w-3 fill-current" /> {expert.ratings || "New"}
                          <span className="text-gray-300 font-normal ml-1">({expert.numberOfJobs} jobs)</span>
                        </div>
                      </div>
                    </div>
                    {expert.featured && (
                      <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-100 gap-1">
                        <ShieldCheck className="h-3 w-3" /> Trusted
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <span className="block text-xs text-gray-400 uppercase font-semibold">Starts from</span>
                      <span className="font-bold text-gray-900">₹{expert.priceRange || "500"}</span>
                    </div>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;