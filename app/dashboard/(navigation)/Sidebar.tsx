'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useMenuStore } from '@/app/store/menu'
import { ImenuItem } from '@/app/types/menu';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { setActive, items: menuItems, bottomItems } = useMenuStore()
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleSubmenu = (menu: ImenuItem) => {
    if (menu.submenu) {
      setExpandedMenus(prev => 
        prev.includes(menu.label) 
          ? prev.filter(item => item !== menu.label)
          : [...prev, menu.label]
      );
    } else {
      setActive(menu)
    }
  };

  const handleMenuClick = (item: ImenuItem, isBottomMenu: boolean = true) => {
    if (isBottomMenu) {
      // Handle bottom menu items (settings, connections, etc.)
      if (item.route && pathname !== item.route) {
        setActive(item)
        router.push(item.route);
      }
    } else {
      // Handle top menu items (dashboard items)
      toggleSubmenu(item);
      // Only navigate if we're not already on dashboard
      if (pathname !== '/dashboard') {
        router.push('/dashboard');
      }
    }
  };

   // Logo click handler
   const handleLogoClick = () => {
    if (pathname !== '/dashboard') {
      router.push('/dashboard');
    }
  };

  return (
    <div className={`bg-white rounded-xl h-full transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-20'
    } flex flex-col overflow-hidden`}>
      <div className={`flex items-center gap-2 p-4 ${!isOpen && 'justify-center'}`}
        onClick={handleLogoClick}>
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xl">B</span>
        </div>
        {isOpen && <h1 className="text-xl font-semibold">BeakDash</h1>}
      </div>

      {/* {isOpen && <div className="text-gray-500 text-sm px-4 mb-2">HOME</div>} */}

      <nav className="flex-1 overflow-y-auto">
        <div className="px-2">
          {menuItems.map((item, index) => (
            <div key={index}>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-1 ${
                  item.active ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleMenuClick(item, false)}
              >
                {/* <item.icon size={20} className="flex-shrink-0" /> */}
                {isOpen && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {item.submenu && (
                      <span className="ml-auto">
                        {expandedMenus.includes(item.label) ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>
              {isOpen && item.submenu && expandedMenus.includes(item.label) && (
                <div className="ml-9 mb-2">
                  {item.submenu.map((subItem, subIndex) => (
                    <div
                      key={subIndex}
                      className={`py-2 px-3 text-sm hover:text-blue-600 cursor-pointer ${
                        item.active ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setActive(item, subItem)}
                    >
                      {subItem.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
      <nav className="border-t pt-1">
        <div className="px-2">
          {bottomItems.map((item, index) => (
            <div key={index}>
              <div
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-1 ${
                  item.active ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleMenuClick(item, true)}
              >
                {isOpen && (<span className="truncate">{item.label}</span>)}
              </div>
            </div>
          ))}
        </div>
      </nav>
      <div className="border-t p-4">
        <div className={`flex items-center gap-3 ${!isOpen && 'justify-center'}`}>
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=48&h=48&q=80"
            alt="Profile"
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          {isOpen && (
            <div>
              <div className="font-medium">Mike Nielsen</div>
              <div className="text-sm text-gray-500">Admin</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;