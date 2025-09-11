import React from 'react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color: string;
  to: string;
}

export default function StatCard({ icon, title, value, color, to }: StatCardProps) {
  return (
    <Link to={to} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </Link>
  );
}
