import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Users, HardDrive, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UsageCard = ({ title, used, limit, percentage, icon: Icon, color }) => {
  const isWarning = percentage >= 80;
  const isCritical = percentage >= 95;
  const progressColor = isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : `bg-${color}-500`;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className={`p-2 bg-${color}-100 dark:bg-${color}-900/20 rounded-lg mr-3`}>
            <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
        </div>
        {(isWarning || isCritical) && (
          <div className={`flex items-center text-sm font-bold ${isCritical ? 'text-red-600' : 'text-yellow-600'}`}>
            <AlertCircle className="w-4 h-4 mr-1" />
            {isCritical ? 'Critical' : 'Warning'}
          </div>
        )}
      </div>

      <div className="mb-2 flex justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          Used: <span className="font-bold text-gray-900 dark:text-white">{used}</span>
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          Limit: <span className="font-bold text-gray-900 dark:text-white">{limit === -1 ? 'Unlimited' : limit}</span>
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
        <div 
          className={`h-2.5 rounded-full ${progressColor}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
      <div className="text-right text-xs text-gray-500 font-medium">
        {percentage}%
      </div>
    </div>
  );
};

const UsageDashboard = () => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await api.get('/usage');
      if (res.data.success) {
        setUsage(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Usage Metrics...</div>;

  const requiresUpgrade = usage?.books.percentage >= 80 || usage?.members.percentage >= 80;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resource Usage</h1>
          <p className="text-gray-500 mt-1">Monitor your subscription limits and resource consumption.</p>
        </div>
        
        {requiresUpgrade && (
          <button 
            onClick={() => navigate('/plans')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-sm transition-colors"
          >
            Upgrade Plan
          </button>
        )}
      </div>

      {requiresUpgrade && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                You are approaching or have exceeded your plan limits. Please upgrade your plan to avoid service interruption when adding new books or members.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UsageCard 
          title="Books Capacity" 
          used={usage?.books.used} 
          limit={usage?.books.limit} 
          percentage={usage?.books.percentage} 
          icon={BookOpen} 
          color="blue" 
        />
        <UsageCard 
          title="Members Capacity" 
          used={usage?.members.used} 
          limit={usage?.members.limit} 
          percentage={usage?.members.percentage} 
          icon={Users} 
          color="green" 
        />
        <UsageCard 
          title="Storage Capacity" 
          used={`${usage?.storage.used} MB`} 
          limit={`${usage?.storage.limit} MB`} 
          percentage={usage?.storage.percentage} 
          icon={HardDrive} 
          color="purple" 
        />
      </div>
    </div>
  );
};

export default UsageDashboard;
