import { Task } from './task';
export { Project };

const Project = (function() {
    
    let projects = {}
    loadProjects();

    // Function to create a project object
    function createProject(name, description, tasks = {}) {
        return {    name,
                    description,
                    tasks,
                    addTask: function(taskId) {
                        this.tasks[taskId] = taskId; // add to list of tasks
                        Task.getTaskById(taskId).addProject(this.name); // update project list on the task
                        saveProjectToLocalStorage(this);    // update local storage
                    },
                    removeTask: function(taskId) {
                        delete this.tasks[taskId];  // remove from list of tasks
                        Task.getTaskById(taskId).removeProject(this.name); // update project list on the task
                        saveProjectToLocalStorage(this);    // update local storage
                    },
                    delete: function() {
                        delete projects[this.name];  // delete from module memory
                        Task.removeProjectFromAllTasks(this.name); // delete from all tasks
                        deleteProjectFromLocalStorage(this); // delete from local storage
                    }
                };
    }

    // Function to add new project
    function addNewProject(name, description) {
        if (name in projects) {
            console.log("Tried to add a project that already exists!");
            return;
        }
        const project = createProject(name, description);
        projects[name] = project;
        saveProjectToLocalStorage(project)
        return project;
    }

    // Function to add methods back to projects loaded from local storage
    function rehydrateProject(projectData) {
        return createProject(projectData.name, projectData.description, projectData.tasks);
    }

    // Function to save projects to local storage
    function saveProjectToLocalStorage(project) {
        localStorage.setItem("proj-" + project.name, JSON.stringify(project));
    }

    function deleteProjectFromLocalStorage(project) {
        localStorage.removeItem("proj-" + project.name);
    }

    // Function to load projects from local storage
    function loadProjects() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (isProjectKey(key)) {
                const projectData = JSON.parse(localStorage.getItem(key));
                projects[projectData.name] = rehydrateProject(projectData);
            }
        }
    }
    
    // Function to check if a local storage key is for a project
    function isProjectKey(key) {
        return key.slice(0, 5) == "proj-";
    }

    function getProject(projectName) {
        return projects[projectName];
    }

    function getProjectTasks(projectName) {
        console.log(projectName);
        return Object.keys(projects[projectName].tasks);
    }

    function getAllProjects() {
        return Object.values(projects);
    }

    function getAllProjectNames() {
        return Object.keys(projects);
    }

    function addTaskToProject(taskId, projectName) {
        projects[projectName].addTask(taskId);
    }

    function removeTaskFromAllProjects(taskId) {
        for (const projectName in projects) {
            projects[projectName].removeTask(taskId);
        }
    }

    function wipeMemory() {
        // Clear module memory
        projects = {};
        // Clear local storage
        const storedKeys = Object.keys(localStorage);
        for (const key of storedKeys) {
            if (isProjectKey(key)) {
                localStorage.removeItem(key);
            }
        }
    }

    return { addNewProject, getProject, getAllProjects, getAllProjectNames, getProjectTasks, addTaskToProject, 
            removeTaskFromAllProjects, wipeMemory }

})()