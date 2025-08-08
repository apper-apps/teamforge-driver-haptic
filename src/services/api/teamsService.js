import teamMembersData from "@/services/mockData/teamMembers.json";

let teamMembers = [...teamMembersData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const teamsService = {
  async getAll() {
    await delay(250);
    return [...teamMembers];
  },

  async getById(id) {
    await delay(200);
    return teamMembers.find(member => member.Id === id) || null;
  },

  async create(memberData) {
    await delay(400);
    const maxId = Math.max(...teamMembers.map(m => m.Id), 0);
    const newMember = {
      ...memberData,
      Id: maxId + 1,
      avatar: memberData.avatar || ""
    };
    teamMembers.unshift(newMember);
    return { ...newMember };
  },

  async update(id, memberData) {
    await delay(400);
    const index = teamMembers.findIndex(m => m.Id === id);
    if (index === -1) throw new Error("Team member not found");
    
    teamMembers[index] = { ...teamMembers[index], ...memberData };
    return { ...teamMembers[index] };
  },

  async delete(id) {
    await delay(300);
    const index = teamMembers.findIndex(m => m.Id === id);
    if (index === -1) throw new Error("Team member not found");
    
    teamMembers.splice(index, 1);
    return true;
  }
};