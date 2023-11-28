import parseJSON from "date-fns/parseJSON";
export { Project };

const Project = (function() {
    
    let projects = {}
    loadProjects();

    // Function to create a project object
    function createProject(name, description, tasks = {}) {
        return {    name,
                    description,
                    tasks,
                    getTasks: function() {
                        return Object.values(this.tasks) || [];
                    },
                    hasTask: function(task) {
                        return task.id in this.tasks;
                    },
                    addTask: function(task) {
                        this.tasks[task.id] = task; // add to list of tasks
                        saveProjectToLocalStorage(this);    // update local storage
                    },
                    removeTask: function(task) {
                        delete this.tasks[task.id];  // remove from list of tasks
                        saveProjectToLocalStorage(this);    // update local storage
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
        // Convert task due dates back to Date objects
        for (let key in projectData.tasks) {
            projectData.tasks[key].dueDate = parseJSON(projectData.tasks[key].dueDate);
        }
        //
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

    function getProjectByName(projectName) {
        return projects[projectName];
    }

    function getProjectTaskIds(projectName) {
        return Object.values(projects[projectName].tasks);
    }

    function getAllProjects() {
        return Object.values(projects);
    }

    function getAllProjectNames() {
        return Object.keys(projects);
    }

    function removeTaskFromAllProjects(task) {
        for (const projectName in projects) {
            projects[projectName].removeTask(task);
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

    return { addNewProject, getProjectByName, getAllProjects, getAllProjectNames, getProjectTaskIds, 
            removeTaskFromAllProjects, wipeMemory }

})()