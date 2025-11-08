import React, { useState, useEffect } from 'react';

interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    totalSessions: number;
    recentSessions: number;
    totalMessages: number;
    recentMessages: number;
    userMessages: number;
    totalTokens: number;
    avgResponseTimeMs: number;
  };
  modelUsage: Record<string, number>;
  subscriptionBreakdown: Record<string, number>;
}

interface AdminDashboardProps {
  apiUrl: string;
  adminApiKey: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ apiUrl, adminApiKey }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/admin/stats?range=${timeRange}`, {
        headers: {
          'X-Admin-Key': adminApiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-bold text-lg mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchStats}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Executive AI Advisor Dashboard</h1>
          <p className="text-gray-600">Monitor user engagement and system performance</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {range === 'all' ? 'All Time' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.overview.totalUsers}
            subtitle={`${stats.overview.newUsers} new`}
            icon="👥"
          />
          <StatCard
            title="Active Users"
            value={stats.overview.activeUsers}
            subtitle={`${Math.round((stats.overview.activeUsers / stats.overview.totalUsers) * 100)}% of total`}
            icon="🔥"
          />
          <StatCard
            title="Messages"
            value={stats.overview.recentMessages}
            subtitle={`${stats.overview.userMessages} from users`}
            icon="💬"
          />
          <StatCard
            title="Avg Response Time"
            value={`${stats.overview.avgResponseTimeMs}ms`}
            subtitle="Model response time"
            icon="⚡"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Chat Sessions"
            value={stats.overview.recentSessions}
            subtitle={`${stats.overview.totalSessions} total`}
            icon="💭"
          />
          <StatCard
            title="Total Tokens"
            value={stats.overview.totalTokens.toLocaleString()}
            subtitle="API usage"
            icon="🎯"
          />
          <StatCard
            title="Avg Msg/Session"
            value={Math.round(stats.overview.recentMessages / (stats.overview.recentSessions || 1))}
            subtitle="Engagement metric"
            icon="📊"
          />
        </div>

        {/* Model Usage */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Model Usage</h2>
          <div className="space-y-3">
            {Object.entries(stats.modelUsage).map(([model, count]) => (
              <div key={model} className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">{model}</span>
                <div className="flex items-center gap-3">
                  <div className="w-48 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 rounded-full h-2 transition-all"
                      style={{
                        width: `${(count / Object.values(stats.modelUsage).reduce((a, b) => a + b, 0)) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-gray-600 text-sm w-16 text-right">{count} calls</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.subscriptionBreakdown).map(([tier, count]) => (
              <div key={tier} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 uppercase tracking-wide mb-1">{tier}</div>
                <div className="text-3xl font-bold text-indigo-600">{count}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {Math.round((count / stats.overview.totalUsers) * 100)}% of users
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  );
};

export default AdminDashboard;
