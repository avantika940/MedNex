'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Users, 
  Activity, 
  AlertCircle, 
  TrendingUp, 
  Database,
  Trash2,
  LogOut,
  Home,
  PieChart
} from 'lucide-react';
import { isAdmin, getCurrentUser, logout } from '@/lib/auth';
import { 
  getAllUsers, 
  getAllDiseases, 
  getAllSymptoms, 
  getAnalytics,
  deleteUser,
  deleteDisease,
  deleteSymptom 
} from '@/lib/admin-api';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'diseases' | 'symptoms'>('overview');
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is admin
    const user = getCurrentUser();
    if (!user || !isAdmin()) {
      router.push('/admin/login');
      return;
    }
    setCurrentUser(user);

    loadData();
  }, [activeTab, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await getAnalytics();
        setAnalytics(data);
      } else if (activeTab === 'users') {
        const data = await getAllUsers();
        setUsers(data);
      } else if (activeTab === 'diseases') {
        const data = await getAllDiseases();
        setDiseases(data);
      } else if (activeTab === 'symptoms') {
        const data = await getAllSymptoms();
        setSymptoms(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: 'user' | 'disease' | 'symptom', id: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      if (type === 'user') {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } else if (type === 'disease') {
        await deleteDisease(id);
        setDiseases(diseases.filter(d => d.id !== id));
      } else if (type === 'symptom') {
        await deleteSymptom(id);
        setSymptoms(symptoms.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      alert(`Failed to delete ${type}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-red-600 to-red-700 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">MedNex Management Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-gray-900">{currentUser?.full_name}</p>
                <p className="text-xs text-gray-500">{currentUser?.email}</p>
              </div>
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">Home</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {[
                { id: 'overview', label: 'Overview', icon: PieChart },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'diseases', label: 'Diseases', icon: Activity },
                { id: 'symptoms', label: 'Symptoms', icon: Database }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
                <p className="text-gray-600 font-medium">Loading dashboard data...</p>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && analytics && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <Users className="h-8 w-8 opacity-80" />
                          <TrendingUp className="h-5 w-5 opacity-60" />
                        </div>
                        <h3 className="text-sm font-medium opacity-90">Total Users</h3>
                        <p className="text-3xl font-bold mt-2">{analytics.total_users || 0}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <Activity className="h-8 w-8 opacity-80" />
                          <TrendingUp className="h-5 w-5 opacity-60" />
                        </div>
                        <h3 className="text-sm font-medium opacity-90">Total Diseases</h3>
                        <p className="text-3xl font-bold mt-2">{analytics.total_diseases || 0}</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <Database className="h-8 w-8 opacity-80" />
                          <TrendingUp className="h-5 w-5 opacity-60" />
                        </div>
                        <h3 className="text-sm font-medium opacity-90">Total Symptoms</h3>
                        <p className="text-3xl font-bold mt-2">{analytics.total_symptoms || 0}</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                          <PieChart className="h-8 w-8 opacity-80" />
                          <TrendingUp className="h-5 w-5 opacity-60" />
                        </div>
                        <h3 className="text-sm font-medium opacity-90">Total Diagnoses</h3>
                        <p className="text-3xl font-bold mt-2">{analytics.total_diagnoses || 0}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.full_name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {user.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleDelete('user', user.id)}
                                  className="flex items-center space-x-1 text-red-600 hover:text-red-900 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'diseases' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {diseases.map((disease) => (
                      <div key={disease.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{disease.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{disease.description}</p>
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            disease.severity === 'critical' ? 'bg-red-100 text-red-800' :
                            disease.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                            disease.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {disease.severity}
                          </span>
                          <button
                            onClick={() => handleDelete('disease', disease.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'symptoms' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {symptoms.map((symptom) => (
                      <div key={symptom.id} className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{symptom.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{symptom.description}</p>
                        <button
                          onClick={() => handleDelete('symptom', symptom.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
