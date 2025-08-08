import assignmentsData from "@/services/mockData/projectAssignments.json";

let assignments = [...assignmentsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const projectAssignmentsService = {
  async getAll() {
    await delay(250);
    return [...assignments];
  },

  async getByProjectId(projectId) {
    await delay(200);
    return assignments.filter(assignment => assignment.projectId === projectId);
  },

  async getByMemberId(memberId) {
    await delay(200);
    return assignments.filter(assignment => assignment.memberId === memberId);
  },

  async create(assignmentData) {
    await delay(300);
    const newAssignment = {
      ...assignmentData,
      joinedAt: new Date().toISOString()
    };
    assignments.push(newAssignment);
    return { ...newAssignment };
  },

  async delete(projectId, memberId) {
    await delay(300);
    const index = assignments.findIndex(a => 
      a.projectId === projectId && a.memberId === memberId
    );
    if (index === -1) throw new Error("Assignment not found");
    
    assignments.splice(index, 1);
    return true;
  }
};