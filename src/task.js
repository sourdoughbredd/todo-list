
const Task = (function() {
    
    // Task object factory function
    function createTask(description, importance, dueDate, projects, notes) {
        const completed = false;
        return { description, importance, dueDate, projects, notes, completed };
    }

    return { createTask }
})();