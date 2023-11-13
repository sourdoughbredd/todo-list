export { Task };

const Task = (function() {

    let currentId = loadCurrentId(); // load the last ID used from local storage
    let tasks = {};
    loadTasks();
    
    // Task object factory function
    function createTask(id, description, importance, dueDate, projects, notes, completed) {
        return {    id,
                    description, 
                    importance, 
                    dueDate, 
                    projects, 
                    notes, 
                    completed, 
                    toggleComplete: function() {
                        this.completed = !this.completed;
                    } };
    }

    // Function to generate ID for a new task
    function getNextId() {
        let id = "task-" + currentId;
        currentId += 1;
        return id;
    }

    // Public task adding function
    function addNewTask(description, importance, dueDate, projects, notes, completed) {
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


    // Task rehydration function (adds methods back)
    function rehydrateTask(task) {
        return createTask( task.id, task.description, task.importance, task.dueDate, task.projects, task.notes, task.completed);
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
        return key.slice(0,4) == 'task';
    }

    // Function to update the task in local storage
    function updateTask(id, task) {
        task[id] = task;
        saveTask(task);
    }

    // Function to save the current ID
    function saveCurrentId() {
        localStorage.setItem("currentId", currentId);
    }

    // Function to load the current ID. If none exists, starts at 0.
    function loadCurrentId(){
        return parseInt(localStorage.getItem("currentId" )) || 0;
    }

    return { tasks, addNewTask, deleteTask }
})();