import React from 'react';
import { BarChart3, Database, Cpu, UploadCloud as CloudUpload, Activity, AlertTriangle, FileText, Settings, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'pipelines', label: 'Pipelines', icon: Cpu },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'models', label: 'Models', icon: CloudUpload },
  { id: 'monitoring', label: 'Monitoring', icon: Activity },
  { id: 'sync', label: 'Data Sync', icon: RefreshCw },
  { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
  { id: 'logs', label: 'Logs', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-700 h-full">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={clsx(
                'w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200',
                {
                  'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30': activeView === item.id,
                  'text-slate-400 hover:text-slate-200 hover:bg-slate-800': activeView !== item.id,
                }
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}