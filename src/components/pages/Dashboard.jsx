import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MetricCard from "@/components/molecules/MetricCard";
import ProjectCard from "@/components/molecules/ProjectCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { projectsService } from "@/services/api/projectsService";
import { teamsService } from "@/services/api/teamsService";
import { tasksService } from "@/services/api/tasksService";
import { projectAssignmentsService } from "@/services/api/projectAssignmentsService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [projectsData, teamData, tasksData, assignmentsData] = await Promise.all([
        projectsService.getAll(),
        teamsService.getAll(),
        tasksService.getAll(),
        projectAssignmentsService.getAll()
      ]);

      setProjects(projectsData);
      setTeamMembers(teamData);
      setTasks(tasksData);
      setAssignments(assignmentsData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const getProjectMetrics = () => {
    const activeProjects = projects.filter(p => p.status === "active");
    const completedProjects = projects.filter(p => p.status === "completed");
    const onHoldProjects = projects.filter(p => p.status === "on-hold");
    const totalTasks = tasks.length;

    return {
      totalProjects: projects.length,
      activeProjects: activeProjects.length,
      completedProjects: completedProjects.length,
      totalTasks
    };
  };

  const getProjectTeamCount = (projectId) => {
    return assignments.filter(a => a.projectId === projectId).length;
  };

  const getProjectTaskCount = (projectId) => {
    return tasks.filter(t => t.projectId === projectId).length;
  };

  const getRecentProjects = () => {
    return projects
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
      .slice(0, 6);
  };

  if (loading) {
    return <Loading variant="skeleton" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadDashboardData} />;
  }

  const metrics = getProjectMetrics();
  const recentProjects = getRecentProjects();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-slate-600 mt-2">Monitor your projects and team productivity</p>
        </div>
        <Button onClick={() => navigate("/projects")} className="mt-4 md:mt-0">
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </motion.div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Projects"
          value={metrics.totalProjects}
          change="+12%"
          trend="up"
          icon="FolderOpen"
          delay={0}
        />
        <MetricCard
          title="Active Projects"
          value={metrics.activeProjects}
          change="+8%"
          trend="up"
          icon="Activity"
          delay={0.1}
        />
        <MetricCard
          title="Team Members"
          value={teamMembers.length}
          change="+5%"
          trend="up"
          icon="Users"
          delay={0.2}
        />
        <MetricCard
          title="Total Tasks"
          value={metrics.totalTasks}
          change="+23%"
          trend="up"
          icon="CheckSquare"
          delay={0.3}
        />
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Projects</h2>
            <p className="text-slate-600">Your latest project activities</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/projects")}>
            View All Projects
            <ApperIcon name="ArrowRight" className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {recentProjects.length === 0 ? (
          <Empty
            title="No projects yet"
            description="Create your first project to get started"
            action={{
              label: "Create Project",
              onClick: () => navigate("/projects"),
              icon: "Plus"
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentProjects.map((project) => (
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

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-8 border border-slate-200"
      >
        <h3 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" onClick={() => navigate("/projects")} className="justify-start">
            <ApperIcon name="Plus" className="w-5 h-5 mr-3" />
            Create New Project
          </Button>
          <Button variant="outline" onClick={() => navigate("/teams")} className="justify-start">
            <ApperIcon name="UserPlus" className="w-5 h-5 mr-3" />
            Add Team Member
          </Button>
          <Button variant="outline" onClick={() => navigate("/tasks")} className="justify-start">
            <ApperIcon name="CheckSquare" className="w-5 h-5 mr-3" />
            View All Tasks
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;