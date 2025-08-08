import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const MetricCard = ({ title, value, change, icon, trend = "neutral", className, delay = 0 }) => {
  const getTrendColor = (trend) => {
    switch (trend) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      default: return "text-slate-600";
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up": return "TrendingUp";
      case "down": return "TrendingDown";
      default: return "Minus";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className={cn("card-hover bg-gradient-to-br from-white to-slate-50", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl">
                  <ApperIcon name={icon} className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">{title}</p>
                  <p className="text-3xl font-bold gradient-text">{value}</p>
                </div>
              </div>
              {change && (
                <div className="flex items-center space-x-1">
                  <ApperIcon 
                    name={getTrendIcon(trend)} 
                    className={cn("w-4 h-4", getTrendColor(trend))} 
                  />
                  <span className={cn("text-sm font-medium", getTrendColor(trend))}>
                    {change}
                  </span>
                  <span className="text-sm text-slate-500">vs last month</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MetricCard;