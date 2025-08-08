import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: "LayoutDashboard" },
    { name: "Projects", href: "/projects", icon: "FolderOpen" },
    { name: "Teams", href: "/teams", icon: "Users" },
    { name: "Tasks", href: "/tasks", icon: "CheckSquare" }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
            <ApperIcon name="Zap" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">TeamForge</h1>
            <p className="text-xs text-slate-500">Project Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg"
                  : "text-slate-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 hover:text-primary-700"
              )}
            >
              <ApperIcon 
                name={item.icon} 
                className={cn(
                  "w-5 h-5 mr-3 transition-colors",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-primary-600"
                )} 
              />
              {item.name}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-2 h-2 bg-white rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Stats Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <ApperIcon name="TrendingUp" className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-slate-700">Quick Stats</span>
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Active Projects</span>
              <span className="font-medium text-slate-900">12</span>
            </div>
            <div className="flex justify-between">
              <span>Team Members</span>
              <span className="font-medium text-slate-900">48</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Tasks</span>
              <span className="font-medium text-slate-900">156</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200 z-30">
        <SidebarContent />
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm" 
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200"
          >
            <SidebarContent />
          </motion.div>
        </>
      )}
    </>
  );
};

export default Sidebar;