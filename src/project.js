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
                        this.tasks[taskId] = taskId;
                        saveProjectToLocalStorage(this);
                    },
                    removeTask: function(taskId) {
                        delete this.tasks[taskId];
                        saveProjectToLocalStorage(this);
                    },
                    delete: function() {
                        delete projects[this.name];  // delete from module memory
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

    function getAllProjects() {
        return Object.values(projects);
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

    return { addNewProject, getProject, getAllProjects, removeTaskFromAllProjects, wipeMemory }

})()