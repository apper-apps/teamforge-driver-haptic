import projectsData from "@/services/mockData/projects.json";

let projects = [...projectsData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const projectsService = {
  async getAll() {
    await delay(300);
    return [...projects];
  },

  async getById(id) {
    await delay(200);
    return projects.find(project => project.Id === id) || null;
  },

  async create(projectData) {
    await delay(400);
    const maxId = Math.max(...projects.map(p => p.Id), 0);
    const newProject = {
      ...projectData,
      Id: maxId + 1
    };
    projects.unshift(newProject);
    return { ...newProject };
  },

  async update(id, projectData) {
    await delay(400);
    const index = projects.findIndex(p => p.Id === id);
    if (index === -1) throw new Error("Project not found");
    
    projects[index] = { ...projects[index], ...projectData };
    return { ...projects[index] };
  },

  async delete(id) {
    await delay(300);
    const index = projects.findIndex(p => p.Id === id);
    if (index === -1) throw new Error("Project not found");
    
    projects.splice(index, 1);
    return true;
  }
};