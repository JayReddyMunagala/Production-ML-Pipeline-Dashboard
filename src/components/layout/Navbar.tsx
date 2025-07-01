import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ML Pipeline Dashboard
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <Bell size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            {user?.avatar ? (
              <button 
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => window.location.href = '#alerts'}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>
            ) : (
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <User size={16} className="text-slate-400" />
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-200">{user?.name}</span>
              <span className="text-xs text-slate-400 capitalize">{user?.role}</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut size={16} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}