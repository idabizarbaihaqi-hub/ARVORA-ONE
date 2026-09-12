import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Bell, Settings } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    {
      to: '/app/dashboard',
      label: 'Home',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      to: '/app/team',
      label: 'Tim',
      icon: <Users className="w-4 h-4" />,
    },
    {
      to: '/app/business',
      label: 'Bisnis',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      to: '/app/notifications',
      label: 'Notif',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      to: '/app/settings',
      label: 'Setelan',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 transition-colors min-h-[44px] cursor-pointer ${
                isActive
                  ? 'text-blue-700 font-bold'
                  : 'text-slate-400 hover:text-slate-700 font-medium'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] leading-none">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
