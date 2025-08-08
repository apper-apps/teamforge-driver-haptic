import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import ProjectCard from "@/components/molecules/ProjectCard";
import ProjectForm from "@/components/molecules/ProjectForm";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { projectsService } from "@/services/api/projectsService";
import { tasksService } from "@/services/api/tasksService";
import { projectAssignmentsService } from "@/services/api/projectAssignmentsService";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [projectsData, tasksData, assignmentsData] = await Promise.all([
        projectsService.getAll(),
        tasksService.getAll(),
        projectAssignmentsService.getAll()
      ]);

      setProjects(projectsData);
      setTasks(tasksData);
      setAssignments(assignmentsData);
    } catch (err) {
      setError("Failed to load projects. Please try again.");
      console.error("Projects load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await projectsService.create(projectData);
      setProjects(prev => [newProject, ...prev]);
      setShowForm(false);
      setEditingProject(null);
      toast.success("Project created successfully!");
    } catch (err) {
      toast.error("Failed to create project");
      console.error("Create project error:", err);
    }
  };

  const handleUpdateProject = async (projectData) => {
    try {
      const updatedProject = await projectsService.update(editingProject.Id, projectData);
      setProjects(prev => prev.map(p => p.Id === editingProject.Id ? updatedProject : p));
      setShowForm(false);
      setEditingProject(null);
      toast.success("Project updated successfully!");
    } catch (err) {
      toast.error("Failed to update project");
      console.error("Update project error:", err);
    }
  };

  const getProjectTeamCount = (projectId) => {
    return assignments.filter(a => a.projectId === projectId).length;
  };

  const getProjectTaskCount = (projectId) => {
    return tasks.filter(t => t.projectId === projectId).length;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    return {
      all: projects.length,
      active: projects.filter(p => p.status === "active").length,
      completed: projects.filter(p => p.status === "completed").length,
      "on-hold": projects.filter(p => p.status === "on-hold").length
    };
  };

  if (loading) {
    return <Loading variant="skeleton" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Projects</h1>
          <p className="text-slate-600 mt-2">Manage and track all your projects</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="mt-4 md:mt-0"
          disabled={showForm}
        >
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </motion.div>

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
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).map(([status, count]) => {
            const isActive = statusFilter === status;
            const statusLabels = {
              all: "All",
              active: "Active", 
              completed: "Completed",
              "on-hold": "On Hold"
            };
            
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {statusLabels[status]} ({count})
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Project Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ProjectForm
              project={editingProject}
              onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
              onCancel={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Empty
          title={searchTerm || statusFilter !== "all" ? "No projects match your filters" : "No projects yet"}
          description={searchTerm || statusFilter !== "all" ? "Try adjusting your search or filter criteria" : "Create your first project to get started"}
          action={!searchTerm && statusFilter === "all" ? {
            label: "Create Project",
            onClick: () => setShowForm(true),
            icon: "Plus"
          } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.Id}
              project={project}
              teamCount={getProjectTeamCount(project.Id)}
              taskCount={getProjectTaskCount(project.Id)}
              onClick={(project) => navigate(`/projects/${project.Id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;