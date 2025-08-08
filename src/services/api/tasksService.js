import tasksData from "@/services/mockData/tasks.json";

let tasks = [...tasksData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const tasksService = {
  async getAll() {
    await delay(250);
    return [...tasks];
  },

  async getById(id) {
    await delay(200);
    return tasks.find(task => task.Id === id) || null;
  },

  async getByProjectId(projectId) {
    await delay(250);
    return tasks.filter(task => task.projectId === projectId);
  },

  async create(taskData) {
    await delay(400);
    const maxId = Math.max(...tasks.map(t => t.Id), 0);
    const newTask = {
      ...taskData,
      Id: maxId + 1,
      createdAt: new Date().toISOString(),
      status: taskData.status || "todo",
      priority: taskData.priority || "medium"
    };
    tasks.unshift(newTask);
    return { ...newTask };
  },

  async update(id, taskData) {
    await delay(400);
    const index = tasks.findIndex(t => t.Id === id);
    if (index === -1) throw new Error("Task not found");
    
    tasks[index] = { ...tasks[index], ...taskData };
    return { ...tasks[index] };
  },

  async delete(id) {
    await delay(300);
    const index = tasks.findIndex(t => t.Id === id);
    if (index === -1) throw new Error("Task not found");
    
    tasks.splice(index, 1);
    return true;
  }
};