import React, { useEffect, useState } from "react";
import { Activity, Clock } from "lucide-react";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { getSocketUrl } from "../../services/runtimeConfig";

const ActivityFeed = ({ initialFeed = [] }) => {
  const { user } = useSelector(state => state.auth);
  const [feed, setFeed] = useState(initialFeed);

  useEffect(() => {
    setFeed(initialFeed);
  }, [initialFeed]);

  useEffect(() => {
    const socket = io(getSocketUrl());
    
    if (user?.libraryId) {
      socket.on(`activity:${user.libraryId}`, (newLog) => {
        setFeed(prev => [newLog, ...prev].slice(0, 10)); // Keep only 10 on dashboard
      });
    }

    return () => socket.disconnect();
  }, [user]);

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <h2 className="font-bold text-gray-800 flex items-center gap-2"><Activity size={18} className="text-blue-500"/> Live Activity</h2>
        <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div> Live
        </div>
      </div>
      <div className="p-0 flex-1 overflow-y-auto max-h-[400px]">
        {feed.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No recent activity.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {feed.map((log, idx) => (
              <li key={log._id || idx} className="p-4 hover:bg-gray-50 transition">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-gray-800 text-sm">{log.action}</span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{log.description}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-mono">By {log.userId?.name || "System"}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
