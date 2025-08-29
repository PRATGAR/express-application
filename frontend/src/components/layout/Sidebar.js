import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Customers', href: '/customers', icon: '👥' },
    { name: 'Transactions', href: '/transactions', icon: '💳' },
    { name: 'Documents', href: '/documents', icon: '📄' },
    { name: 'Reports', href: '/reports', icon: '📈' },
    { name: 'Calculator', href: '/calculator', icon: '🧮' }
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 bg-blue-900">
          <h2 className="text-xl font-bold text-white">SecureBank</h2>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={onClose}
                className={`
                  flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150
                  ${isActive(item.href)
                    ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900">Security Status</h4>
            <p className="text-xs text-gray-600 mt-1">
              Last scan: 2 hours ago
            </p>
            <div className="flex items-center mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">System secure</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;