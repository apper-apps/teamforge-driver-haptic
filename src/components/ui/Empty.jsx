import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Empty = ({ 
  title = "No data found", 
  description = "There's nothing here yet", 
  action,
  className 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center", className)}>
      <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name="FileX" className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick} className="min-w-[120px]">
          <ApperIcon name={action.icon || "Plus"} className="w-4 h-4 mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default Empty;