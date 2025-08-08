import { cn } from "@/utils/cn";

const Loading = ({ className, variant = "default" }) => {
  if (variant === "skeleton") {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse mb-3"></div>
              <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse w-2/3"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse"></div>
                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse w-4/5"></div>
                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded animate-pulse w-3/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center p-12", className)}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary-100 rounded-full animate-spin"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
        </div>
        <div className="text-slate-600 font-medium">Loading...</div>
      </div>
    </div>
  );
};

export default Loading;