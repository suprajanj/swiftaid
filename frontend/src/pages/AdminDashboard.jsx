import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Sidebar } from "../components/Sidebar";
import {
  Activity,
  Users,
  Clock,
  User,
  AlertTriangle,
  TrendingUp,
  Shield as LucideShield,
} from "lucide-react";

const AnalyticsChart = ({ data = [] }) => {
  const maxValue = data.length ? Math.max(...data) : 1;
  const safeMax = maxValue === 0 ? 1 : maxValue;

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <div className="h-48 flex items-end justify-between gap-1">
        {data.map((value, index) => (
          <div
            key={index}
            className="flex-1 bg-gradient-to-t from-red-500 to-red-300 rounded-t transition-all duration-300 hover:from-red-600 hover:to-red-400"
            style={{ height: `${(value / safeMax) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
};

const MiniChart = ({ data = [], color = "red" }) => {
  const colorMap = {
    red: "bg-gradient-to-t from-red-500 to-red-300",
    blue: "bg-gradient-to-t from-blue-500 to-blue-300",
    green: "bg-gradient-to-t from-green-500 to-green-300",
    purple: "bg-gradient-to-t from-purple-500 to-purple-300",
  };

  const maxValue = data.length ? Math.max(...data) : 1;
  const safeMax = maxValue === 0 ? 1 : maxValue;

  return (
    <div className="h-12 flex items-end gap-1">
      {data.map((value, index) => (
        <div
          key={index}
          className={`flex-1 rounded-t transition-all duration-300 hover:opacity-80 ${colorMap[color] || colorMap.red}`}
          style={{ height: `${(value / safeMax) * 100}%` }}
        />
      ))}
    </div>
  );
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    activeEmergencies: 0,
    totalUsers: 0,
    avgResponseTime: 0,
    resolvedToday: 0,
    highPriority: 0,
    coverageArea: "0%",
  });
  const [realtimeUpdates, setRealtimeUpdates] = useState([]);
  const [emergencyTrend, setEmergencyTrend] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  const formatTime = (ts) => {
    const d = ts instanceof Date ? ts : new Date(ts);
    return !isNaN(d.getTime()) ? d.toLocaleTimeString() : "";
  };

  // Fetch user data and authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      setLoading(true);

      // Fetch all SOS data
      const sosResponse = await axios.get("http://localhost:3000/api/sos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allSOS = sosResponse.data || [];

      // Fetch all users for total users count
      const usersResponse = await axios.get("http://localhost:3000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allUsers = usersResponse.data || [];

      // Calculate active emergencies (Pending and Accepted status)
      const activeEmergencies = allSOS.filter(
        (sos) => sos.status === "Pending" || sos.status === "Accepted"
      ).length;

      // Calculate total users (all users in the database)
      const totalUsers = allUsers.length;

      // Calculate emergency trends for the last 7 days
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });

      const dailyCounts = last7Days.map((date) => {
        return allSOS.filter((sos) => {
          const sosDate = new Date(sos.createdAt).toISOString().split("T")[0];
          return sosDate === date;
        }).length;
      });

      // Calculate resolved today
      const todayStr = today.toISOString().split("T")[0];
      const resolvedToday = allSOS.filter((sos) => {
        const sosDate = new Date(sos.createdAt).toISOString().split("T")[0];
        return sosDate === todayStr && sos.status === "Completed";
      }).length;

      // Calculate average response time (based on status changes)
      const completedEmergencies = allSOS.filter(
        (sos) => sos.status === "Completed"
      );
      const avgResponseTime =
        completedEmergencies.length > 0
          ? completedEmergencies.reduce((acc, sos) => {
              const created = new Date(sos.createdAt);
              const completed = sos.completedAt
                ? new Date(sos.completedAt)
                : new Date();
              const diffMinutes = (completed - created) / (1000 * 60);
              return acc + diffMinutes;
            }, 0) / completedEmergencies.length
          : 0;

      // Get recent SOS for real-time updates (last 5)
      const recentSOS = allSOS
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map((sos) => ({
          id: sos._id,
          message: `${sos.emergency} reported by ${sos.name}`,
          timestamp: sos.createdAt,
        }));

      // Calculate coverage area (based on users with addresses)
      const usersWithAddress = allUsers.filter((user) => user.address).length;
      const coverageArea =
        allUsers.length > 0
          ? `${Math.round((usersWithAddress / allUsers.length) * 100)}%`
          : "0%";

      // Update state with real data
      setStats({
        activeEmergencies,
        totalUsers,
        avgResponseTime: Math.round(avgResponseTime * 10) / 10,
        resolvedToday,
        highPriority: allSOS.filter((sos) => sos.status === "Pending").length,
        coverageArea,
      });

      setEmergencyTrend(dailyCounts);
      setRealtimeUpdates(recentSOS);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color = "red",
    chartData = [],
  }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {loading ? "..." : value}
            </span>
            {change && (
              <span
                className={`text-sm ${change.includes("+") ? "text-green-600" : "text-red-600"} pb-1 flex items-center gap-1`}
              >
                <TrendingUp size={14} />
                {change}
              </span>
            )}
          </div>
        </div>
        <div
          className={`p-3 rounded-lg ${
            color === "red"
              ? "bg-red-50 group-hover:bg-red-100"
              : color === "blue"
                ? "bg-blue-50 group-hover:bg-blue-100"
                : color === "green"
                  ? "bg-green-50 group-hover:bg-green-100"
                  : "bg-purple-50 group-hover:bg-purple-100"
          }`}
        >
          {Icon && <Icon size={24} className={`text-${color}-600`} />}
        </div>
      </div>
      <MiniChart data={chartData} color={color} />
    </div>
  );

  // Get day names for the chart
  const getDayNames = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      days.push(date.toLocaleDateString("en-US", { weekday: "short" }));
    }
    return days;
  };

  const dayNames = getDayNames();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-inter flex">
      <Sidebar />
      <div className="flex-1 p-6 ml-0 transition-all duration-300">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user ? user.firstName : "Admin"}!
                <span className="text-red-600 font-medium ml-2">
                  {loading ? "..." : stats.activeEmergencies} active emergencies
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 text-left group hover:border-red-200"
            onClick={() => navigate("/requests")}
          >
            <Activity size={20} className="text-red-600 mb-2" />
            <p className="font-medium text-gray-900">SOS</p>
            <p className="text-sm text-gray-600 mt-1">View SOS requests</p>
          </button>
          <button
            className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 text-left group hover:border-blue-200"
            onClick={() => navigate("/roles")}
          >
            <Users size={20} className="text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">Role Management</p>
            <p className="text-sm text-gray-600 mt-1">View users</p>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Active Emergencies"
                value={stats.activeEmergencies}
                change="+12%"
                icon={AlertTriangle}
                color="red"
                chartData={emergencyTrend}
              />
              <StatCard
                title="Total Users"
                value={stats.totalUsers}
                change="+5%"
                icon={Users}
                color="blue"
                chartData={emergencyTrend.map((val) => Math.round(val * 0.8))}
              />
              <StatCard
                title="Response Time"
                value={`${stats.avgResponseTime}m`}
                icon={Clock}
                color="green"
                chartData={emergencyTrend.map((val) => Math.round(val * 0.6))}
              />
              <StatCard
                title="Coverage Area"
                value={stats.coverageArea}
                change="+3%"
                icon={User}
                color="purple"
                chartData={emergencyTrend.map((val) => Math.round(val * 0.4))}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Emergency Trends (Last 7 Days)
                  </h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg font-medium">
                      Last 7 Days
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg font-medium">
                      Last 30 Days
                    </button>
                  </div>
                </div>
                <AnalyticsChart data={emergencyTrend} />
                <div className="flex justify-between mt-4 px-2">
                  {dayNames.map((day, index) => (
                    <span
                      key={index}
                      className="text-xs text-gray-500 font-medium"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Recent Emergencies
                </h2>
                <div className="space-y-4">
                  {realtimeUpdates.map((update) => (
                    <div
                      key={update.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 animate-pulse" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 font-medium">
                          {update.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(update.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {realtimeUpdates.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No recent emergencies</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
