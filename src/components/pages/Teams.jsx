import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import { teamsService } from "@/services/api/teamsService";
import { projectAssignmentsService } from "@/services/api/projectAssignmentsService";
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

const Teams = () => {
const [teamMembers, setTeamMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberFormData, setMemberFormData] = useState({
    name: "",
    email: "",
    role: ""
  });
  const [submitting, setSubmitting] = useState(false);
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

  const openMemberModal = () => {
    setMemberFormData({
      name: "",
      email: "",
      role: ""
    });
    setShowMemberModal(true);
  };

  const closeMemberModal = () => {
    setShowMemberModal(false);
    setMemberFormData({
      name: "",
      email: "",
      role: ""
    });
  };

  const openContactModal = (member) => {
    setSelectedMember(member);
    setShowContactModal(true);
  };

  const closeContactModal = () => {
    setShowContactModal(false);
    setSelectedMember(null);
  };

  const openViewModal = (member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedMember(null);
  };

  const handleMemberFormChange = (field, value) => {
    setMemberFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateMemberForm = () => {
    if (!memberFormData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!memberFormData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberFormData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!memberFormData.role.trim()) {
      toast.error("Role is required");
      return false;
    }
    return true;
  };

  const handleMemberSubmit = async (e) => {
    e.preventDefault();
    if (!validateMemberForm()) return;

    try {
      setSubmitting(true);
      await teamsService.create(memberFormData);
      toast.success("Team member added successfully!");
      await loadData();
      closeMemberModal();
    } catch (err) {
      toast.error("Failed to add team member");
      console.error("Member submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendEmail = (member) => {
    const subject = encodeURIComponent("TeamForge Contact");
    const body = encodeURIComponent(`Hi ${member.name},\n\nI hope this message finds you well.\n\nBest regards`);
    window.open(`mailto:${member.email}?subject=${subject}&body=${body}`, '_blank');
    toast.success("Email client opened!");
    closeContactModal();
  };

  const MemberModal = () => (
    <AnimatePresence>
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Add New Team Member
              </h3>
              <Button variant="ghost" size="sm" onClick={closeMemberModal}>
                <ApperIcon name="X" className="w-4 h-4" />
              </Button>
            </div>

            <form onSubmit={handleMemberSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name *
                </label>
                <Input
                  type="text"
                  value={memberFormData.name}
                  onChange={(e) => handleMemberFormChange("name", e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={memberFormData.email}
                  onChange={(e) => handleMemberFormChange("email", e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Role *
                </label>
                <select
                  value={memberFormData.role}
                  onChange={(e) => handleMemberFormChange("role", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Select a role</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Senior Developer">Senior Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="UX Designer">UX Designer</option>
                  <option value="UI Designer">UI Designer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="QA Engineer">QA Engineer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Technical Lead">Technical Lead</option>
                  <option value="Security Specialist">Security Specialist</option>
                  <option value="Mobile Developer">Mobile Developer</option>
                </select>
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
                      Adding...
                    </>
                  ) : (
                    <>
                      <ApperIcon name="UserPlus" className="w-4 h-4 mr-2" />
                      Add Member
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeMemberModal}
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

  const ContactModal = () => (
    <AnimatePresence>
      {showContactModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Contact {selectedMember.name}
              </h3>
              <Button variant="ghost" size="sm" onClick={closeContactModal}>
                <ApperIcon name="X" className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                <TeamMemberAvatar member={selectedMember} size="lg" />
                <div>
                  <h4 className="font-medium text-slate-900">{selectedMember.name}</h4>
                  <p className="text-sm text-slate-600">{selectedMember.role}</p>
                  <p className="text-sm text-slate-500">{selectedMember.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => handleSendEmail(selectedMember)}
                  className="w-full"
                >
                  <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedMember.email);
                    toast.success("Email copied to clipboard!");
                  }}
                  className="w-full"
                >
                  <ApperIcon name="Copy" className="w-4 h-4 mr-2" />
                  Copy Email Address
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={closeContactModal}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const ViewModal = () => (
    <AnimatePresence>
      {showViewModal && selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Team Member Details
              </h3>
              <Button variant="ghost" size="sm" onClick={closeViewModal}>
                <ApperIcon name="X" className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              {/* Member Info */}
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-lg">
                <TeamMemberAvatar member={selectedMember} size="xl" />
                <div>
                  <h4 className="text-xl font-semibold text-slate-900">{selectedMember.name}</h4>
                  <p className="text-slate-600">{selectedMember.role}</p>
                  <p className="text-sm text-slate-500">{selectedMember.email}</p>
                </div>
              </div>

              {/* Projects */}
              <div>
                <h5 className="font-medium text-slate-900 mb-3">Project Assignments</h5>
                <div className="space-y-3">
                  {getMemberProjects(selectedMember.Id).map((project) => (
                    <div key={project.Id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                      <div>
                        <h6 className="font-medium text-slate-900">{project.code}</h6>
                        <p className="text-sm text-slate-600">{project.name}</p>
                      </div>
                      <Badge variant={getRoleColor(project.role)} className="text-xs">
                        {project.role}
                      </Badge>
                    </div>
                  ))}
                  {getMemberProjects(selectedMember.Id).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      No project assignments
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  closeViewModal();
                  openContactModal(selectedMember);
                }}
              >
                <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                Contact
              </Button>
              <Button variant="outline" onClick={closeViewModal}>
                Close
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

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
<Button onClick={openMemberModal} className="mt-4 md:mt-0">
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
onClick: openMemberModal,
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
<Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => openContactModal(member)}
                        >
                          <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
                          Contact
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => openViewModal(member)}
                        >
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
    
    <>
      <MemberModal />
      <ContactModal />
      <ViewModal />
    </>
  );
};
export default Teams;