import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { differenceInDays, format } from "date-fns";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { projectsService } from "@/services/api/projectsService";
import { teamsService } from "@/services/api/teamsService";
import { tasksService } from "@/services/api/tasksService";
import { projectAssignmentsService } from "@/services/api/projectAssignmentsService";
import ApperIcon from "@/components/ApperIcon";
import TeamMemberAvatar from "@/components/molecules/TeamMemberAvatar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Projects from "@/components/pages/Projects";
import Tasks from "@/components/pages/Tasks";
import { cn } from "@/utils/cn";
const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
const [project, setProject] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    assigneeId: "",
    status: "todo",
    priority: "medium",
    dueDate: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const loadProjectData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [projectData, allTeamMembers, projectTasks, projectAssignments] = await Promise.all([
        projectsService.getById(parseInt(id)),
        teamsService.getAll(),
        tasksService.getAll(),
        projectAssignmentsService.getAll()
      ]);

      if (!projectData) {
        setError("Project not found");
        return;
      }

      setProject(projectData);
      setTeamMembers(allTeamMembers);
      setTasks(projectTasks.filter(t => t.projectId === parseInt(id)));
      setAssignments(projectAssignments.filter(a => a.projectId === parseInt(id)));
    } catch (err) {
      setError("Failed to load project details. Please try again.");
      console.error("Project detail load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const getAssignedTeamMembers = () => {
    return assignments
      .map(assignment => {
        const member = teamMembers.find(m => m.Id === assignment.memberId);
        return member ? { ...member, role: assignment.role } : null;
      })
      .filter(Boolean);
  };

  const getTaskStatusCounts = () => {
    const completed = tasks.filter(t => t.status === "completed").length;
    const inProgress = tasks.filter(t => t.status === "in-progress").length;
    const todo = tasks.filter(t => t.status === "todo").length;
    return { completed, inProgress, todo, total: tasks.length };
  };

  const getProjectProgress = () => {
    if (!project) return 0;
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const today = new Date();
    const totalDays = differenceInDays(endDate, startDate);
    const daysElapsed = Math.max(0, differenceInDays(today, startDate));
    return totalDays > 0 ? Math.min(100, (daysElapsed / totalDays) * 100) : 0;
  };

  const getTaskProgress = () => {
    const statusCounts = getTaskStatusCounts();
    return statusCounts.total > 0 ? (statusCounts.completed / statusCounts.total) * 100 : 0;
  };

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "success";
      case "completed": return "info";
      case "on-hold": return "warning";
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

  const openTaskModal = () => {
    setTaskFormData({
      title: "",
      assigneeId: "",
      status: "todo",
      priority: "medium",
      dueDate: ""
    });
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setTaskFormData({
      title: "",
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
    return true;
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!validateTaskForm()) return;

    try {
      setSubmitting(true);
      const taskData = {
        ...taskFormData,
        projectId: parseInt(id),
        assigneeId: taskFormData.assigneeId ? parseInt(taskFormData.assigneeId) : null,
        dueDate: taskFormData.dueDate || null
      };

      await tasksService.create(taskData);
      toast.success("Task created successfully!");
      await loadProjectData();
      closeTaskModal();
    } catch (err) {
      toast.error("Failed to create task");
      console.error("Task submit error:", err);
    } finally {
      setSubmitting(false);
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
                Add Task to {project?.name}
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
                  Assignee
                </label>
                <select
                  value={taskFormData.assigneeId}
                  onChange={(e) => handleTaskFormChange("assigneeId", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Unassigned</option>
                  {getAssignedTeamMembers().map(member => (
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                      Add Task
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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadProjectData} />;
  }

  if (!project) {
    return <Error message="Project not found" />;
  }

  const assignedTeamMembers = getAssignedTeamMembers();
  const taskStatusCounts = getTaskStatusCounts();
  const progress = getProjectProgress();
  const taskProgress = getTaskProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between"
      >
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/projects")}
          >
            <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">{project.code}</h1>
            <p className="text-lg text-slate-600 font-medium">{project.name}</p>
          </div>
        </div>
        <Badge variant={getStatusVariant(project.status)} className="text-sm px-4 py-2">
          {project.status}
        </Badge>
      </motion.div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Card */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ApperIcon name="Calendar" className="w-5 h-5 mr-2 text-primary-600" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Progress</span>
                <span className="font-semibold text-slate-900">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Start Date</span>
                <span className="font-medium">{format(new Date(project.startDate), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">End Date</span>
                <span className="font-medium">{format(new Date(project.endDate), "MMM dd, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Duration</span>
                <span className="font-medium">{project.duration} days</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Card */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ApperIcon name="Users" className="w-5 h-5 mr-2 text-primary-600" />
              Team ({assignedTeamMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignedTeamMembers.length === 0 ? (
              <div className="text-center py-4">
                <ApperIcon name="UserPlus" className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No team members assigned</p>
              </div>
            ) : (
              <div className="space-y-3">
                {assignedTeamMembers.slice(0, 4).map((member) => (
                  <div key={member.Id} className="flex items-center space-x-3">
                    <TeamMemberAvatar member={member} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.role}</p>
                    </div>
                  </div>
                ))}
                {assignedTeamMembers.length > 4 && (
                  <p className="text-xs text-slate-500 text-center">
                    +{assignedTeamMembers.length - 4} more members
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ApperIcon name="CheckSquare" className="w-5 h-5 mr-2 text-primary-600" />
              Tasks ({taskStatusCounts.total})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Completion</span>
                <span className="font-semibold text-slate-900">{Math.round(taskProgress)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Completed</span>
                <span className="font-medium text-green-600">{taskStatusCounts.completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">In Progress</span>
                <span className="font-medium text-yellow-600">{taskStatusCounts.inProgress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">To Do</span>
                <span className="font-medium text-slate-600">{taskStatusCounts.todo}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {project.description && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 leading-relaxed">{project.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Tasks</span>
<Button onClick={openTaskModal} size="sm">
              <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <Empty
              title="No tasks yet"
              description="Create the first task for this project"
              action={{
label: "Add Task",
                onClick: openTaskModal,
                icon: "Plus"
              }}
            />
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const assignee = teamMembers.find(m => m.Id === task.assigneeId);
                
                return (
                  <motion.div
                    key={task.Id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{task.title}</h4>
                      {task.dueDate && (
                        <p className="text-sm text-slate-500">
                          Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
                        {task.priority}
                      </Badge>
                      <Badge variant={getStatusVariant(task.status)} className="text-xs">
                        {task.status}
                      </Badge>
                      {assignee && (
                        <TeamMemberAvatar member={assignee} size="sm" />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
)}
        </CardContent>
      </Card>

      <TaskModal />
    </div>
  );
};

export default ProjectDetail;