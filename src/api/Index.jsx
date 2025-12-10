import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4001",
});

const STORAGE_KEY = "team-todo-tasks";

// Funciones para localStorage (solo en el navegador)
const getTasksFromStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveTasksToStorage = (tasks) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error guardando en localStorage:", error);
  }
};

// Obtener todas las tareas
export const getTasks = async () => {
  try {
    const response = await api.get("/tasks");
    saveTasksToStorage(response.data);
    return response.data;
  } catch {
    return getTasksFromStorage();
  }
};

// Crear nueva tarea
export const createTask = async (task) => {
  try {
    const response = await api.post("/tasks", task);
    const allTasks = await api.get("/tasks").then((r) => r.data);
    saveTasksToStorage(allTasks);
    return response.data;
  } catch {
    const tasks = getTasksFromStorage();
    const newTask = {
      ...task,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
    tasks.push(newTask);
    saveTasksToStorage(tasks);
    return newTask;
  }
};

// Actualizar tarea
export const updateTask = async (id, updatedTask) => {
  try {
    const response = await api.put(`/tasks/${id}`, updatedTask);
    const allTasks = await api.get("/tasks").then((r) => r.data);
    saveTasksToStorage(allTasks);
    return response.data;
  } catch {
    const tasks = getTasksFromStorage();
    const index = tasks.findIndex((t) => t.id === id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      saveTasksToStorage(tasks);
      return updatedTask;
    }
    throw new Error("Tarea no encontrada");
  }
};

// Eliminar tarea
export const deleteTask = async (id) => {
  try {
    await api.delete(`/tasks/${id}`);
    const allTasks = await api.get("/tasks").then((r) => r.data);
    saveTasksToStorage(allTasks);
  } catch {
    const tasks = getTasksFromStorage();
    const filtered = tasks.filter((t) => t.id !== id);
    saveTasksToStorage(filtered);
  }
};

// ========== FUNCIONES PARA USUARIOS ==========

const USERS_STORAGE_KEY = "team-todo-users";

// Funciones para localStorage de usuarios
const getUsersFromStorage = () => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    
    const oldStored = localStorage.getItem("users_db");
    if (oldStored) {
      const oldUsers = JSON.parse(oldStored);
      saveUsersToStorage(oldUsers);
      return oldUsers;
    }
    
    return [];
  } catch {
    return [];
  }
};

const saveUsersToStorage = (users) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error guardando usuarios en localStorage:", error);
  }
};

// Obtener todos los usuarios
export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    saveUsersToStorage(response.data);
    return response.data;
  } catch {
    return getUsersFromStorage();
  }
};

// Crear nuevo usuario
export const createUser = async (user) => {
  try {
    const response = await api.post("/users", user);
    const allUsers = await api.get("/users").then((r) => r.data);
    saveUsersToStorage(allUsers);
    return response.data;
  } catch (error) {
    console.error("Error creando usuario en servidor:", error);
    const users = getUsersFromStorage();
    const newUser = {
      ...user,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
    users.push(newUser);
    saveUsersToStorage(users);
    return newUser;
  }
};

// Buscar usuario por nombre
export const findUserByName = async (name) => {
  try {
    const cleanName = name.trim();
    console.log("Buscando usuario:", cleanName);
    
    const serverUsers = await getUsers();
    console.log("Usuarios en servidor:", serverUsers);
    const found = serverUsers.find((u) => u.name && u.name.trim() === cleanName);
    if (found) {
      console.log("Usuario encontrado en servidor:", found);
      return found;
    }
    
    const localUsers = getUsersFromStorage();
    console.log("Usuarios en localStorage:", localUsers);
    const localFound = localUsers.find((u) => u.name && u.name.trim() === cleanName);
    
    if (localFound) {
      console.log("Usuario encontrado en localStorage:", localFound);
    } else {
      console.log("Usuario NO encontrado en ninguna ubicación");
    }
    
    return localFound || null;
  } catch (error) {
    console.error("Error buscando usuario:", error);
    const users = getUsersFromStorage();
    const cleanName = name.trim();
    return users.find((u) => u.name && u.name.trim() === cleanName) || null;
  }
};