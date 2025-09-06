import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/ui/Sidebar';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import HeaderComponent from '@/components/header';
import FooterComponent from '@/components/footer';

const ProtectedLayout = ({ setIsStickyHeader }) => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1030;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!user) return <Navigate to="/signin" replace />;

  return (
    <div className="relative flex h-screen overflow-hidden bg-white-100">
      {/* Mobile menu button - only shows on mobile when sidebar is collapsed */}
      {isMobile && isSidebarCollapsed && (
        <button
          onClick={() => setIsSidebarCollapsed(false)}
          className="fixed top-1 left-4 z-40 p-2 rounded-md bg-[#1E1E1E] text-white lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      <Sidebar 
        userEmail={user.email} 
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        setIsStickyHeader={setIsStickyHeader}
        isMobile={isMobile}
      />

      <main className={cn(
        "flex-1 overflow-auto flex flex-col transition-all duration-300",
        !isSidebarCollapsed && "lg:ml-[300px]",
        isSidebarCollapsed && "lg:ml-16",
         isMobile ? "mt-10" : ""
      )}>
        {!isDashboard &&  <HeaderComponent />}

        <div className="flex-1 overflow-auto mt-1">
          <Outlet />
        </div>
        {!isDashboard && <FooterComponent />}

      </main>
    </div>
  );
};

export default ProtectedLayout;