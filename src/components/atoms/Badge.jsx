import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Badge = forwardRef(({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}, ref) => {
  const variants = {
    default: "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border border-slate-300",
    success: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300",
    warning: "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300",
    error: "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300",
    info: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300",
    primary: "bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border border-primary-300"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variants[variant],
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";
export default Badge;