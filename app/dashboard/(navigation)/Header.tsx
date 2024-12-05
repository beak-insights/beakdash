'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Moon, Bell, ShoppingBag, Menu, LogOut, User, Plus } from 'lucide-react';
import AddPageModal from '@/app/dashboard/(navigation)/AddPageModal'
import { useMenuStore } from '@/app/store/menu'

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Header = ({ isSidebarOpen, onToggleSidebar }: HeaderProps) => {
  const { addMenu } = useMenuStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddPageOpen, setIsAddPageOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {};

  return (
    <div className="bg-white rounded-xl mb-4 sticky top-0 z-10">
      <div className="h-16 flex items-center justify-between px-6">
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg"
          onClick={onToggleSidebar}
        >
          <Menu size={20} />
        </button>
        <button
          onClick={() => setIsAddPageOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-blue-400 rounded-lg hover:text-blue-600"
        >
          <Plus size={20} />
          Page
        </button>

        <div className="flex-1 max-w-2xl ml-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Try to searching..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Moon size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <img src="https://flagcdn.com/w20/gb.png" alt="English" className="w-5" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <ShoppingBag size={20} />
            <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              8
            </span>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 bg-red-500 w-2 h-2 rounded-full"></span>
          </button>
          
          <div className="relative" ref={profileRef}>
            <button
              className="flex items-center gap-2 ml-2 p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=48&h=48&q=80"
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <div className="font-medium">Mike Nielsen</div>
                <div className="text-sm text-gray-500">Admin</div>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                <button className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50">
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-50 text-red-600"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddPageModal
        isOpen={isAddPageOpen}
        onClose={() => setIsAddPageOpen(false)}
        onAdd={(item) => {
          addMenu(item);
          setIsAddPageOpen(false);
        }}
      />

    </div>
  );
};

export default Header;