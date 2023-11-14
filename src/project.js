import { Task } from "./task";
export { Project };

const Project = (function() {
    
    let projects = {}
    projects = loadProjects();

    // Function to create a project
    function createProject(name, description, tasks = []) {
        return {    name,
                    description,
                    tasks,
                    addTask: function(taskId) {
                        if (!this.tasks.includes(taskId)) {
                            this.tasks += taskId;
                        }
                    }
                };
    }

    // Function to add new project
    function addProject(name, description) {
        if (name in projects) {
            console.log("Tried to add a project that already exists!");
            return;
        }
        const project = createProject(name, description);
        projects[name] = project;
        saveProject(project)
    }

    // Function to add methods back to projects loaded from local storage
    function rehydrateProject(projectData) {
        return createProject(projectData.name, projectData.description, projectData.tasks);
    }

    // Function to save projects to local storage
    function saveProject(project) {
        localStorage.setItem("proj-" + project.name, JSON.stringify(project));
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

    return { addProject }

})()