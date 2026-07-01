import React from "react";
import { Link } from "react-router-dom";
import { BookPlus, UserPlus, Repeat, FileText, Upload } from "lucide-react";

const QuickActions = () => {
  const actions = [
    { title: "Add Book", icon: BookPlus, link: "/books/new", color: "text-blue-600", bg: "bg-blue-50 hover:bg-blue-100" },
    { title: "Add Member", icon: UserPlus, link: "/students/new", color: "text-purple-600", bg: "bg-purple-50 hover:bg-purple-100" },
    { title: "Issue Book", icon: Repeat, link: "/transactions", color: "text-green-600", bg: "bg-green-50 hover:bg-green-100" },
    { title: "Import Books", icon: Upload, link: "/import", color: "text-orange-600", bg: "bg-orange-50 hover:bg-orange-100" },
    { title: "Reports", icon: FileText, link: "/reports", color: "text-slate-600", bg: "bg-slate-50 hover:bg-slate-100" },
  ];

  return (
    <div className="bg-white border rounded-xl shadow-sm p-6">
      <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {actions.map((action, idx) => (
          <Link key={idx} to={action.link} className={`flex flex-col items-center justify-center p-4 rounded-xl transition ${action.bg}`}>
            <action.icon className={`${action.color} mb-2`} size={24} />
            <span className={`text-xs font-bold ${action.color}`}>{action.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
