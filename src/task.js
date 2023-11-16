import { isDate } from 'date-fns';
import { Project } from './project';
export { Task };

const Task = (function() {

    let currentId = loadCurrentId(); // load the last ID used from local storage
    let tasks = {};
    loadTasks();
    
    // Task object factory function
    function createTask(id, description, importance, dueDate, projects, notes, completed) {

        function isEditableTaskProperty(property) {
            return property === "description"
                || property === "importance"
                || property === "dueDate"
                || property === "notes"
                || property === "completed";
        }

        return {    id,
                    description, 
                    importance, 
                    dueDate, 
                    projects, 
                    notes, 
                    completed, 
                    toggleComplete: function() {
                        this.completed = !this.completed;
                        saveTaskToLocalStorage(this);  // update local storage
                    }, 
                    update: function(data) {
                        // Check property names
                        for (const key in data) {
                            if (!isEditableTaskProperty(key)) {
                                console.log(key + " is a non-existent or non-editable task property! Update failed!")
                                return;
                            }
                        }
                        // Check property value validity
                        if (!isTaskDataObjectValid(data)) {
                            console.log("Invalid property value. Update failed!")
                            return;
                        }
                        // Update task
                        for (const key in data) {
                            this[key] = data[key];
                        }
                        saveTaskToLocalStorage(this);
                        
                    },
                    delete: function() {
                        deleteTask(this.id);
                    },
                    addProject: function(projectName) {
                        if (!this.projects.includes(projectName)) {
                            this.projects.push(projectName);
                            saveTaskToLocalStorage(this);
                        }
                    },
                    removeProject: function(projectName) {
                        if (this.projects.includes(projectName)) {
                            const index = this.projects.indexOf(projectName);
                            this.projects.splice(index, 1);
                            saveTaskToLocalStorage(this);
                        }
                    }
                };
    }

    // Function to generate ID for a new task
    function getNextId() {
        let id = "task-" + currentId;
        currentId += 1;
        return id;
    }

    function isTaskDataObjectValid(data) {
        let result = true;
        for (const key in data) {
            switch (key) {
                case "description":
                    if (typeof(data[key]) !== "string") {
                        console.log("Error: Description must be a string!")
                        result = false;
                    }
                    break;
                case "importance":
                    if (typeof(data[key]) !== "number" || !(data[key] == 0 || data[key] == 1 || data[key] == 2)) {
                        console.log("Error: Importance must be an integer 0, 1, or 2!");
                        result = false;
                    }
                    break;
                case "dueDate":
                    if (!isDate(data[key])) {
                        console.log("Error: dueDate must be an instance of Date!");
                        result = false;
                    }
                    break;
                case "projects":
                    if (data[key].constructor !== Array) {
                        console.log('Error: projects must be an array!');
                        result = false;
                    }
                    if (data[key].constructor === Array && data[key].length !== 0) {
                        // Projects is a non-empty array. Check that it contains strings.
                        for (let i = 0; i < data[key].length; i++) {
                            if (typeof(data[key][i]) !== "string") {
                                console.log("Error: non-string found in projects array!")
                                result = false;
                                break;
                            }
                        }
                    }
                    break;
                case "notes":
                    if (typeof(data[key]) !== "string") {
                        console.log("Error: notes must be a string!");
                        result = false;
                    };
                    break;
                case "completed":
                    if (typeof(data[key]) !== "boolean") {
                        console.log("Error: completed must be a boolean!");
                        result = false;
                    }
                    break;
                default:
                    console.log("Invalid property found in data.")
                    break;
            }
        }
        return result;
    }


    function isTaskDataValid(description, importance, dueDate, projects, notes, completed) {
        const data = { description, importance, dueDate, projects, notes, completed }; // build object
        return isTaskDataObjectValid(data);
    }

    // Public task adding function
    function addNewTask(description, importance, dueDate, projects, notes, completed) {
        if (!isTaskDataValid(description, importance, dueDate, projects, notes, completed)) {
            console.log('Task not created due to invalid task data!');
            return;
        }
        const id = getNextId();
        const task = createTask(id, description, importance, dueDate, projects, notes, completed);
        tasks[task.id] = task;
        saveTaskToLocalStorage(task);
        saveCurrentId();
        return task;
    }

    // Function to save task to local storage
    function saveTaskToLocalStorage(task) {
        localStorage.setItem(task.id, JSON.stringify(task));
    }

    // Public function to delete task using task ID
    function deleteTask(id) {
        // Delete from from any projects
        Project.removeTaskFromAllProjects(id);
        // Delete from array
        delete tasks[id];
        // Delete from memory
        localStorage.removeItem(id);
    }


    // Task rehydration function (adds methods back to task objects loaded from local storage)
    function rehydrateTask(taskData) {
        return createTask( taskData.id, taskData.description, taskData.importance, taskData.dueDate, taskData.projects, taskData.notes, taskData.completed);
    }


    // Function to get tasks from local storage
    function loadTasks() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (isTaskKey(key)) {
                const taskData = JSON.parse(localStorage.getItem(key));
                tasks[taskData.id] = rehydrateTask(taskData);
            }
        }
    }

    // Function to see if a local storage key is a task key
    function isTaskKey(key) {
        // Keys of the form "task-{id#}"
        return key.slice(0,5) == 'task-';
    }

    // Function to save the current ID
    function saveCurrentId() {
        localStorage.setItem("currentId", currentId);
    }

    // Function to load the current ID. If none exists, starts at 0.
    function loadCurrentId(){
        return parseInt(localStorage.getItem("currentId" )) || 0;
    }

    // Function to return number of tasks in memory
    function getNumTasks() {
        return Object.keys(tasks).length;
    }

    // Function to add a project to a task
    function addProject(id, projectName) {
        if (tasks[id].projects.includes(projectName)) {
            console.log("Project already added to this task!")
        } else {
            tasks[id].projects += projectName;
        }
    }

    // Function to return array of all tasks
    function getTasks() {
        return Object.values(tasks);
    }

    function getTaskById(taskId) {
        if (taskId in tasks) {
            return tasks[taskId];
        } else {
            console.log('ERROR: Task with ID (' + taskId + ") not found in memory!");
        }
    }
    

    function wipeMemory() {
        // Clear from projects
        for (const taskId in tasks) {
            Project.removeTaskFromAllProjects(taskId);
        }
        // Clear module memory
        tasks = {};
        currentId = 0;
        // Clear local storage
        const storedKeys = Object.keys(localStorage);
        for (const key of storedKeys) {
            if (isTaskKey(key) || key == "currentId") {
                localStorage.removeItem(key);
            }
        }
    }

    return { getTasks, getTaskById, getNumTasks, addNewTask, deleteTask, addProject, wipeMemory }
})();