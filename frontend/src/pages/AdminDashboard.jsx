import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Shield, 
  FileText, 
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    overview: {
      totalOrganizations: 0,
      activeOrganizations: 0,
      totalCases: 0,
      verifiedCases: 0,
      pendingReports: 0
    },
    organizationStats: [],
    caseStats: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        toast.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'LOGIN': return <Shield className="h-4 w-4 text-green-600" />;
      case 'CREATE_ORGANIZATION': return <Users className="h-4 w-4 text-blue-600" />;
      case 'CREATE_CASE': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'VERIFY_CASE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'EXPORT_DATA': return <FileText className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'LOGIN': return 'text-green-600';
      case 'CREATE_ORGANIZATION': return 'text-blue-600';
      case 'CREATE_CASE': return 'text-red-600';
      case 'VERIFY_CASE': return 'text-green-600';
      case 'EXPORT_DATA': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage organizations and emergency cases</p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/admin/panel"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Users className="h-4 w-4 mr-2" />
                Manage Organizations
              </Link>
              <Link
                to="/emergency-cases"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                View Cases
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Organizations</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.overview.totalOrganizations}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Organizations</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.overview.activeOrganizations}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Cases</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.overview.totalCases}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Verified Cases</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.overview.verifiedCases}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Reports</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.overview.pendingReports}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Organization Stats */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Organizations by Type</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {stats.organizationStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">{stat._id}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{stat.count}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">{stat.active}</div>
                        <div className="text-xs text-gray-500">Active</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Case Stats */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Cases by Type</h3>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {stats.caseStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                      <span className="text-sm font-medium text-gray-900">{stat._id}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{stat.count}</div>
                        <div className="text-xs text-gray-500">Total</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">{stat.verified}</div>
                        <div className="text-xs text-gray-500">Verified</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="px-6 py-4">
            <div className="flow-root">
              <ul className="-mb-8">
                {stats.recentActivity.map((activity, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== stats.recentActivity.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.success ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {getActionIcon(activity.action)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              <span className={`font-medium ${getActionColor(activity.action)}`}>
                                {activity.action.replace(/_/g, ' ')}
                              </span>
                              {' '}
                              {activity.performedBy?.name && (
                                <span>by {activity.performedBy.name}</span>
                              )}
                            </p>
                            {activity.details && (
                              <p className="text-xs text-gray-400 mt-1">
                                {JSON.stringify(activity.details)}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time dateTime={activity.timestamp}>
                              {new Date(activity.timestamp).toLocaleString()}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
