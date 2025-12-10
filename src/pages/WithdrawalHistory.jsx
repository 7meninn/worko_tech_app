import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { getWalletHistory } from "@/api/auth";

const WithdrawalHistory = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getWalletHistory();
        setTransactions(data);
      } catch (error) {
        toast.error("Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal History</h1>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">All Transactions</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No transactions found.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map((txn) => (
                  <div key={txn._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(txn.status)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">Withdrawal to {txn.upiId}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(txn.createdAt).toLocaleDateString()} at {new Date(txn.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">- ₹{txn.amount}</p>
                      <Badge variant="secondary" className={`text-[10px] ${
                        txn.status === 'processed' ? 'bg-green-100 text-green-700' :
                        txn.status === 'failed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {txn.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WithdrawalHistory;