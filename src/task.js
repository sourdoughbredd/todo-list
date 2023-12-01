import { isDate, isToday, isThisWeek, isFuture, parseJSON } from 'date-fns';
import { Header } from './header';
import { Project } from './project';
export { Task };

const Task = (function() {

    let currentId = loadCurrentId(); // load the last ID used from local storage
    let tasks = {};
    loadTasks();
    
    // Task object factory function
    function createTask(id, description, importance, dueDate, notes, completed) {

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
                    notes, 
                    completed, 
                    toggleComplete: function() {
                        this.completed = !this.completed;
                        saveTaskToLocalStorage(this);  // update local storage
                        Header.updateNextDue();
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
                        Header.updateNextDue();
                    },
                    delete: function() {
                        // Delete from from any projects
                        Project.removeTaskFromAllProjects(this);
                        // Delete from tasks object
                        delete tasks[this.id];
                        // Delete from local storage
                        localStorage.removeItem(this.id);
                        // Update header next due
                        Header.updateNextDue();
                    },
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


    function isTaskDataValid(description, importance, dueDate, notes, completed) {
        const data = { description, importance, dueDate, notes, completed }; // build object
        return isTaskDataObjectValid(data);
    }

    // Public task adding function
    function addNewTask(description, importance, dueDate, notes, completed) {
        if (!isTaskDataValid(description, importance, dueDate, notes, completed)) {
            console.log('Task not created due to invalid task data!');
            return;
        }
        const id = getNextId();
        const task = createTask(id, description, importance, dueDate, notes, completed);
        tasks[task.id] = task;
        Header.updateNextDue();
        saveTaskToLocalStorage(task);
        saveCurrentId();
        return task;
    }

    // Function to save task to local storage
    function saveTaskToLocalStorage(task) {
        localStorage.setItem(task.id, JSON.stringify(task));
    }

    // // Public function to delete task using task ID
    // function deleteTask(id) {
        
    // }


    // Task rehydration function (adds methods back to task objects loaded from local storage)
    function rehydrateTask(taskData) {
        // Due date comes back as string, convert back to date object
        taskData.dueDate = parseJSON(taskData.dueDate);
        return createTask( taskData.id, taskData.description, taskData.importance, taskData.dueDate, taskData.notes, taskData.completed);
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

    // Function to return array of all tasks
    function getAllTasks() {
        return Object.values(tasks);
    }

    function getTaskIds() {
        return Object.keys(tasks);
    } 

    function getTaskById(taskId) {
        if (taskId in tasks) {
            return tasks[taskId];
        } else {
            console.log('ERROR: Task with ID (' + taskId + ") not found in memory!");
        }
    }

    // Returns tasks due today
    function getTodaysTasks() {
        const tasksArray = getAllTasks();
        return tasksArray.filter(task => isToday(task.dueDate))
    }

    // Returns tasks due from today to the end of the week
    function getWeeksTasks() {
        const tasksArray = getAllTasks();
        const weeksTasks = tasksArray.filter(task => isThisWeek(task.dueDate) && (isToday(task.dueDate) || isFuture(task.dueDate)));
        return sortByDueDate(weeksTasks);
    }

    function sortByDueDate(tasks) {
        return tasks.sort((a, b) => a.dueDate - b.dueDate);
    }

    function sortByImportance(tasks) {
        return tasks.sort((a, b) => b.importance - a.importance);
    }
    

    function wipeMemory() {
        // Clear from projects
        getAllTasks().forEach(task => Project.removeTaskFromAllProjects(task));
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

    return { getAllTasks, getTaskIds, getTaskById, getNumTasks, getTodaysTasks, getWeeksTasks, addNewTask, 
            sortByDueDate, sortByImportance, wipeMemory }
})();