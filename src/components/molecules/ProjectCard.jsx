import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const ProjectCard = ({ project, teamCount, taskCount, onClick, className }) => {
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const today = new Date();
  const totalDays = differenceInDays(endDate, startDate);
  const daysElapsed = Math.max(0, differenceInDays(today, startDate));
  const progress = totalDays > 0 ? Math.min(100, (daysElapsed / totalDays) * 100) : 0;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "border-l-green-500 bg-gradient-to-br from-green-50 to-green-100";
      case "completed":
        return "border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100";
      case "on-hold":
        return "border-l-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100";
      default:
        return "border-l-slate-500 bg-gradient-to-br from-slate-50 to-slate-100";
    }
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "success";
      case "completed": return "info";
      case "on-hold": return "warning";
      default: return "default";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "cursor-pointer border-l-4 card-hover",
          getStatusColor(project.status),
          className
        )}
        onClick={() => onClick?.(project)}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="gradient-text text-xl font-bold">
                {project.code}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1 font-medium">{project.name}</p>
            </div>
            <Badge variant={getStatusVariant(project.status)} className="text-xs font-semibold">
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timeline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Timeline</span>
              <span className="text-slate-900 font-semibold">{project.duration} days</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{format(startDate, "MMM dd")}</span>
              <span>{format(endDate, "MMM dd")}</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-white to-slate-50 rounded-lg border border-slate-200">
              <div className="p-2 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg">
                <ApperIcon name="Users" className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{teamCount}</p>
                <p className="text-xs text-slate-600 font-medium">Team Members</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-white to-slate-50 rounded-lg border border-slate-200">
              <div className="p-2 bg-gradient-to-br from-accent-100 to-accent-200 rounded-lg">
                <ApperIcon name="CheckSquare" className="w-4 h-4 text-accent-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{taskCount}</p>
                <p className="text-xs text-slate-600 font-medium">Tasks</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProjectCard;