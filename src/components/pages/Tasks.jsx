import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import TeamMemberAvatar from "@/components/molecules/TeamMemberAvatar";
import ApperIcon from "@/components/ApperIcon";
import { tasksService } from "@/services/api/tasksService";
import { teamsService } from "@/services/api/teamsService";
import { projectsService } from "@/services/api/projectsService";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [tasksData, membersData, projectsData] = await Promise.all([
        tasksService.getAll(),
        teamsService.getAll(),
        projectsService.getAll()
      ]);

      setTasks(tasksData);
      setTeamMembers(membersData);
      setProjects(projectsData);
    } catch (err) {
      setError("Failed to load tasks. Please try again.");
      console.error("Tasks load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTaskProject = (projectId) => {
    return projects.find(p => p.Id === projectId);
  };

  const getTaskAssignee = (assigneeId) => {
    return teamMembers.find(m => m.Id === assigneeId);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusCounts = () => {
    return {
      all: tasks.length,
      todo: tasks.filter(t => t.status === "todo").length,
      "in-progress": tasks.filter(t => t.status === "in-progress").length,
      completed: tasks.filter(t => t.status === "completed").length
    };
  };

  const getPriorityCounts = () => {
    return {
      all: tasks.length,
      high: tasks.filter(t => t.priority === "high").length,
      medium: tasks.filter(t => t.priority === "medium").length,
      low: tasks.filter(t => t.priority === "low").length
    };
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "completed": return "success";
      case "in-progress": return "warning";
      case "todo": return "default";
      default: return "default";
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high": return "error";
      case "medium": return "warning";
      case "low": return "success";
      default: return "default";
    }
  };

  if (loading) {
    return <Loading variant="skeleton" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  const statusCounts = getStatusCounts();
  const priorityCounts = getPriorityCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Tasks</h1>
          <p className="text-slate-600 mt-2">Track and manage all project tasks</p>
        </div>
        <Button className="mt-4 md:mt-0">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </motion.div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <ApperIcon name="CheckSquare" className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Total Tasks</p>
                <p className="text-2xl font-bold text-blue-900">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <ApperIcon name="CheckCircle" className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">{statusCounts.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl">
                <ApperIcon name="Clock" className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-900">{statusCounts["in-progress"]}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                <ApperIcon name="AlertTriangle" className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-600">High Priority</p>
                <p className="text-2xl font-bold text-red-900">{priorityCounts.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4 p-6 bg-white rounded-xl shadow-lg"
      >
        <div className="flex-1">
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1">
            {Object.entries(statusCounts).map(([status, count]) => {
              const isActive = statusFilter === status;
              const statusLabels = {
                all: "All",
                todo: "To Do",
                "in-progress": "In Progress",
                completed: "Completed"
              };
              
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {statusLabels[status]} ({count})
                </button>
              );
            })}
          </div>
          
          <div className="w-px bg-slate-300 mx-2"></div>
          
          <div className="flex gap-1">
            {Object.entries(priorityCounts).map(([priority, count]) => {
              const isActive = priorityFilter === priority;
              const priorityLabels = {
                all: "All",
                high: "High",
                medium: "Medium",
                low: "Low"
              };
              
              return (
                <button
                  key={priority}
                  onClick={() => setPriorityFilter(priority)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? "bg-gradient-to-r from-accent-500 to-accent-600 text-white shadow-md" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {priorityLabels[priority]} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Empty
          title={searchTerm || statusFilter !== "all" || priorityFilter !== "all" ? "No tasks match your filters" : "No tasks yet"}
          description={searchTerm || statusFilter !== "all" || priorityFilter !== "all" ? "Try adjusting your search or filter criteria" : "Create your first task to get started"}
          action={!searchTerm && statusFilter === "all" && priorityFilter === "all" ? {
            label: "Create Task",
            onClick: () => {},
            icon: "Plus"
          } : undefined}
        />
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const project = getTaskProject(task.projectId);
            const assignee = getTaskAssignee(task.assigneeId);
            
            return (
              <motion.div
                key={task.Id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                          {project && (
                            <p className="text-sm text-slate-600">
                              Project: <span className="font-medium">{project.code} - {project.name}</span>
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center space-x-2">
                            <ApperIcon name="Calendar" className="w-4 h-4" />
                            <span>Created: {format(new Date(task.createdAt), "MMM dd, yyyy")}</span>
                          </div>
                          {task.dueDate && (
                            <div className="flex items-center space-x-2">
                              <ApperIcon name="Clock" className="w-4 h-4" />
                              <span>Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 ml-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                          <Badge variant={getStatusVariant(task.status)} className="text-xs">
                            {task.status}
                          </Badge>
                        </div>
                        
                        {assignee && (
                          <div className="flex items-center space-x-2">
                            <TeamMemberAvatar member={assignee} size="sm" />
                            <div className="text-right">
                              <p className="text-sm font-medium text-slate-900">{assignee.name}</p>
                              <p className="text-xs text-slate-500">{assignee.role}</p>
                            </div>
                          </div>
                        )}
                        
                        <Button variant="ghost" size="sm">
                          <ApperIcon name="MoreVertical" className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tasks;