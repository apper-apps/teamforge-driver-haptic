import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Button = forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md",
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:from-primary-600 hover:to-primary-700 hover:shadow-xl transform hover:scale-[1.02] focus:ring-primary-500",
    secondary: "bg-gradient-to-r from-secondary-500 to-secondary-600 text-white shadow-lg hover:from-secondary-600 hover:to-secondary-700 hover:shadow-xl transform hover:scale-[1.02] focus:ring-secondary-500",
    outline: "border-2 border-slate-300 bg-white text-slate-700 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:border-slate-400 focus:ring-slate-500 hover:shadow-md",
    ghost: "text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 hover:text-slate-900 focus:ring-slate-500",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-xl transform hover:scale-[1.02] focus:ring-red-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;