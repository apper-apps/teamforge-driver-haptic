import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import TeamMemberAvatar from "@/components/molecules/TeamMemberAvatar";
import ApperIcon from "@/components/ApperIcon";
import { teamsService } from "@/services/api/teamsService";
import { projectAssignmentsService } from "@/services/api/projectAssignmentsService";
import { projectsService } from "@/services/api/projectsService";

const Teams = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [membersData, assignmentsData, projectsData] = await Promise.all([
        teamsService.getAll(),
        projectAssignmentsService.getAll(),
        projectsService.getAll()
      ]);

      setTeamMembers(membersData);
      setAssignments(assignmentsData);
      setProjects(projectsData);
    } catch (err) {
      setError("Failed to load team data. Please try again.");
      console.error("Teams load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMemberProjects = (memberId) => {
    const memberAssignments = assignments.filter(a => a.memberId === memberId);
    return memberAssignments.map(assignment => {
      const project = projects.find(p => p.Id === assignment.projectId);
      return project ? { ...project, role: assignment.role } : null;
    }).filter(Boolean);
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case "manager": return "primary";
      case "lead": return "secondary";
      case "developer": return "info";
      case "designer": return "success";
      default: return "default";
    }
  };

  if (loading) {
    return <Loading variant="skeleton" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Team Members</h1>
          <p className="text-slate-600 mt-2">Manage your team and track their assignments</p>
        </div>
        <Button className="mt-4 md:mt-0">
          <ApperIcon name="UserPlus" className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </motion.div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <ApperIcon name="Users" className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Total Members</p>
                <p className="text-2xl font-bold text-blue-900">{teamMembers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <ApperIcon name="UserCheck" className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Active Projects</p>
                <p className="text-2xl font-bold text-green-900">{projects.filter(p => p.status === "active").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <ApperIcon name="Crown" className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Managers</p>
                <p className="text-2xl font-bold text-purple-900">
                  {teamMembers.filter(m => m.role.toLowerCase().includes("manager")).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <ApperIcon name="Code" className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-600">Developers</p>
                <p className="text-2xl font-bold text-orange-900">
                  {teamMembers.filter(m => m.role.toLowerCase().includes("developer")).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members Grid */}
      {filteredMembers.length === 0 ? (
        <Empty
          title={searchTerm ? "No members match your search" : "No team members yet"}
          description={searchTerm ? "Try adjusting your search criteria" : "Add your first team member to get started"}
          action={!searchTerm ? {
            label: "Add Member",
            onClick: () => {},
            icon: "UserPlus"
          } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const memberProjects = getMemberProjects(member.Id);
            
            return (
              <motion.div
                key={member.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="card-hover h-full">
                  <CardHeader className="text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <TeamMemberAvatar member={member} size="lg" />
                      <div>
                        <CardTitle className="text-lg">{member.name}</CardTitle>
                        <p className="text-sm text-slate-600">{member.email}</p>
                      </div>
                      <Badge variant={getRoleColor(member.role)} className="px-3 py-1">
                        {member.role}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Active Projects</span>
                        <span className="font-semibold text-slate-900">{memberProjects.length}</span>
                      </div>
                      
                      {memberProjects.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-slate-700">Current Projects</h4>
                          <div className="space-y-2">
                            {memberProjects.slice(0, 3).map((project) => (
                              <div key={project.Id} className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 truncate flex-1">{project.code}</span>
                                <Badge variant="default" className="text-xs ml-2">
                                  {project.role}
                                </Badge>
                              </div>
                            ))}
                            {memberProjects.length > 3 && (
                              <p className="text-xs text-slate-500">
                                +{memberProjects.length - 3} more projects
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 pt-4">
                        <Button variant="outline" size="sm" className="flex-1">
                          <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <ApperIcon name="Eye" className="w-4 h-4 mr-2" />
                          View
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

export default Teams;