import { isDate } from 'date-fns';
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
                        saveTask(this);  // update local storage
                    }, 
                    updateTaskData: function(newData) {
                        for (const property in newData) {
                            if (isEditableTaskProperty(property)) {
                                this[property] = newData[property];
                            } else {
                                console.log("WARNING: Tried to update an invalid task property!")
                            }
                        }
                        saveTask(this);  // update local storage
                    },
                };
    }

    // Function to generate ID for a new task
    function getNextId() {
        let id = "task-" + currentId;
        currentId += 1;
        return id;
    }

    function isTaskDataValid(description, importance, dueDate, projects, notes, completed) {
        let result = true;
        if (typeof(description) !== "string") {
            console.log("Error: Description must be a string!")
            result = false;
        }
        if (typeof(importance) !== "number" || !(importance == 0 || importance == 1 || importance == 2)) {
            console.log("Error: Importance must be an integer 0, 1, or 2!");
            result = false;
        };
        if (!isDate(dueDate)) {
            console.log("Error: dueDate must be an instance of Date!");
            result = false;
        };
        if (projects.constructor !== Array) {
            console.log('Error: projects must be an array!');
            result = false;
        }
        if (projects.constructor === Array && projects.length !== 0) {
            // Projects in a non-empty array. Check that it contains strings.
            for (let i = 0; i < projects.length; i++) {
                if (typeof(projects[i]) !== "string") {
                    console.log("Error: non-string found in projects array!")
                    result = false;
                    break;
                }
            }
        }
        if (typeof(notes) !== "string") {
            console.log("Error: notes must be a string!");
            result = false;
        };
        if (typeof(completed) !== "boolean") {
            console.log("Error: completed must be a boolean!");
            result = false;
        };
        return result;
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
        saveTask(task);
        saveCurrentId();
    }

    // Function to save task to local storage
    function saveTask(task) {
        localStorage.setItem(task.id, JSON.stringify(task));
    }

    // Public function to delete task
    function deleteTask(id) {
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
                tasks[key] = rehydrateTask(taskData);
            }
        }
    }

    // Function to see if a local storage key is a task key
    function isTaskKey(key) {
        // Keys of the form "task-{id#}"
        return key.slice(0,5) == 'task-';
    }

    // Function to update the task in local storage
    function updateTask(id) {
        tasks[id] = task;       // update in module
        saveTask(tasks[id]);    // update in local storage
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

    return { getTasks, getNumTasks, addNewTask, updateTask, deleteTask, addProject }
})();