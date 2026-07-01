import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useActivityLogs } from "../../hooks/useAudit";
import { Activity, Clock, User, Zap } from "lucide-react";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { getSocketUrl } from "../../services/runtimeConfig";

const ActivityLogs = () => {
  const { data, isLoading } = useActivityLogs();
  const { user } = useSelector(state => state.auth);
  
  const [liveLogs, setLiveLogs] = useState([]);
  
  useEffect(() => {
    if (data?.data) {
      setLiveLogs(data.data);
    }
  }, [data]);
  
  useEffect(() => {
    // Connect to Socket.IO for real-time feed
    const socket = io(getSocketUrl());
    
    if (user?.libraryId) {
      socket.on(`activity:${user.libraryId}`, (newLog) => {
        // Prepend new activity
        setLiveLogs(prev => [newLog, ...prev].slice(0, 100));
      });
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Activity className="text-blue-500" /> Live Activity Feed
          </h1>
          <p className="text-gray-500">Real-time narrative of events happening in your library.</p>
        </div>
        <div className="space-x-4">
          <Link to="/audit/security" className="text-red-600 hover:underline text-sm font-medium">Security Logs</Link>
          <Link to="/audit/logs" className="text-blue-600 hover:underline text-sm font-medium">Detailed Audit Logs</Link>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-6 relative overflow-hidden">
        {/* Pulsing indicator */}
        <div className="absolute top-6 right-6 flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Live
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-gray-400">Loading activity...</div>
        ) : liveLogs.length === 0 ? (
          <div className="py-20 text-center text-gray-500">No recent activity.</div>
        ) : (
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {liveLogs.map((log, index) => (
              <div key={log._id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* Icon */}
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  {log.module === "AUTH" ? <User size={18} /> : <Zap size={18} />}
                </div>
                
                {/* Card */}
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl shadow border border-slate-100 hover:border-blue-200 transition">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{log.description}</p>
                  <p className="text-xs text-blue-500 mt-2 font-medium bg-blue-50 w-max px-2 py-0.5 rounded">
                    Module: {log.module}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
