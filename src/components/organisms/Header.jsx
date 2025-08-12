import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { useSelector } from 'react-redux';
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { AuthContext } from "@/App";

const Header = ({ onMobileMenuToggle, title = "TeamForge" }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2"
          >
            <ApperIcon name="Menu" className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold gradient-text">{title}</h1>
            <p className="text-sm text-slate-600">
              {currentTime.toLocaleDateString("en-US", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </p>
          </div>
        </div>
        
<div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
            <ApperIcon name="Clock" className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">
              {currentTime.toLocaleTimeString("en-US", { 
                hour: "2-digit", 
                minute: "2-digit" 
              })}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
            <ApperIcon name="Activity" className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">Live</span>
          </div>
          
          <LogoutButton />
        </div>
</div>
    </motion.header>
  );
};

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  const user = useSelector((state) => state.user.user);
  
  if (!user) return null;
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={logout}
      className="flex items-center space-x-2"
    >
      <ApperIcon name="LogOut" className="w-4 h-4" />
      <span className="hidden md:inline">Logout</span>
    </Button>
  );
};

export default Header;