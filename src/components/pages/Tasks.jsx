import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { tasksService } from "@/services/api/tasksService";
import { teamsService } from "@/services/api/teamsService";
import { projectsService } from "@/services/api/projectsService";
import ApperIcon from "@/components/ApperIcon";
import TeamMemberAvatar from "@/components/molecules/TeamMemberAvatar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import { cn } from "@/utils/cn";

const Tasks = () => {
const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    projectId: "",
    assigneeId: "",
    status: "todo",
    priority: "medium",
    dueDate: ""
  });
  const [submitting, setSubmitting] = useState(false);
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

  const openTaskModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskFormData({
        title: task.title,
        projectId: task.projectId.toString(),
        assigneeId: task.assigneeId?.toString() || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""
      });
    } else {
      setEditingTask(null);
      setTaskFormData({
        title: "",
        projectId: "",
        assigneeId: "",
        status: "todo",
        priority: "medium",
        dueDate: ""
      });
    }
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
    setTaskFormData({
      title: "",
      projectId: "",
      assigneeId: "",
      status: "todo",
      priority: "medium",
      dueDate: ""
    });
  };

  const handleTaskFormChange = (field, value) => {
    setTaskFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateTaskForm = () => {
    if (!taskFormData.title.trim()) {
      toast.error("Task title is required");
      return false;
    }
    if (!taskFormData.projectId) {
      toast.error("Please select a project");
      return false;
    }
    return true;
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!validateTaskForm()) return;

    try {
      setSubmitting(true);
      const taskData = {
        ...taskFormData,
        projectId: parseInt(taskFormData.projectId),
        assigneeId: taskFormData.assigneeId ? parseInt(taskFormData.assigneeId) : null,
        dueDate: taskFormData.dueDate || null
      };

      if (editingTask) {
        await tasksService.update(editingTask.Id, taskData);
        toast.success("Task updated successfully!");
      } else {
        await tasksService.create(taskData);
        toast.success("Task created successfully!");
      }

      await loadData();
      closeTaskModal();
    } catch (err) {
      toast.error(editingTask ? "Failed to update task" : "Failed to create task");
      console.error("Task submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await tasksService.delete(taskId);
      toast.success("Task deleted successfully!");
      await loadData();
    } catch (err) {
      toast.error("Failed to delete task");
      console.error("Task delete error:", err);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await tasksService.update(taskId, { status: newStatus });
      toast.success("Task status updated!");
      await loadData();
    } catch (err) {
      toast.error("Failed to update task status");
      console.error("Status update error:", err);
    }
  };

  const TaskModal = () => (
    <AnimatePresence>
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeTaskModal}>
                <ApperIcon name="X" className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Task Title *
                </label>
                <Input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => handleTaskFormChange("title", e.target.value)}
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Project *
                </label>
                <select
                  value={taskFormData.projectId}
                  onChange={(e) => handleTaskFormChange("projectId", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project.Id} value={project.Id}>
                      {project.code} - {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Assignee
                </label>
                <select
                  value={taskFormData.assigneeId}
                  onChange={(e) => handleTaskFormChange("assigneeId", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Unassigned</option>
                  {teamMembers.map(member => (
                    <option key={member.Id} value={member.Id}>
                      {member.name} - {member.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={taskFormData.status}
                    onChange={(e) => handleTaskFormChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) => handleTaskFormChange("priority", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={(e) => handleTaskFormChange("dueDate", e.target.value)}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                      {editingTask ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <ApperIcon name={editingTask ? "Save" : "Plus"} className="w-4 h-4 mr-2" />
                      {editingTask ? "Update Task" : "Create Task"}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeTaskModal}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

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
<Button onClick={() => openTaskModal()} className="mt-4 md:mt-0">
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
            onClick: () => openTaskModal(),
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
                        
<div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openTaskModal(task)}
                            title="Edit task"
                          >
                            <ApperIcon name="Edit2" className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTaskDelete(task.Id)}
                            title="Delete task"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </Button>
                          <div className="relative">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusUpdate(task.Id, e.target.value)}
                              className="text-xs px-2 py-1 border border-slate-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                              title="Change status"
                            >
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
)}
      
      <TaskModal />
    </div>
  );
};

export default Tasks;