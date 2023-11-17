import { Task } from "./task";
import { Project } from "./project";
import { isToday, format } from "date-fns";
import deleteIcon from './assets/delete-icon.svg';
import editIcon from './assets/edit-icon.svg';
import notesIcon from './assets/notes-icon.svg';

export { UiControl };

const UiControl = (function() {

    function clearMain() {
        document.querySelector(".main").innerHTML = "";
    }

    function displayTodaysTasks() {
        clearMain();
        // Get projects for today's tasks
        const todaysTasks = Task.getTodaysTasks();
        let todaysProjects = [];
        todaysTasks.forEach(task => {
            const taskProjects = task.getProjects();
            taskProjects.forEach(projectName => {
                if (!todaysProjects.includes(projectName)) {
                    // New project found. Add to array.
                    todaysProjects.push(projectName);
                }
            });
        });

        // Initialize main element
        const main = document.querySelector(".main");
        main.innerHTML = `
            <h2>Today</h2>
            <div class="projects"></div>
            `;

        // Create project elements
        todaysProjects.forEach(projectName => {
            // Initialize the project element
            const projectContainer = document.createElement("div");
            projectContainer.classList.add('project-container');
            projectContainer.innerHTML = `
                <h3>${projectName}</h3>
                <ul class="task-list"></ul>
            `;

            // Add task elements to the project task list
            const projectTaskIds = Project.getProjectTasks(projectName);
            const taskListEl = projectContainer.querySelector(".task-list");
            projectTaskIds.forEach(taskId => {
                const taskEl = getTaskDomElement(taskId);
                taskListEl.appendChild(taskEl);
            });

            // Append project to main
            main.appendChild(projectContainer);
        });
    }

    function displayWeeksTasks() {
        // Get this weeks tasks
        const weeksTasks = Task.getWeeksTasks();
        clearMain();
    }

    function displayImportantTasks() {
        clearMain();
    }

    function displayCompletedTasks() {
        clearMain();
    }

    function getTaskDomElement(taskId) {
        // Get task and add data to DOM element
        const task = Task.getTaskById(taskId);
        const taskEl = document.createElement("li");
        taskEl.classList.add("task");
        taskEl.dataset.importance = task.importance;
        taskEl.dataset.completed = task.completed;
        taskEl.dataset.taskId = task.id;

        // Add the radio button (to toggle completion)
        const radioBtn = getRadioButton(task.importance, task.completed);
        taskEl.appendChild(radioBtn);

        // Add the task description
        const taskDesc = document.createElement("span");
        taskDesc.classList.add("task-description");
        taskDesc.innerText = task.description;
        taskEl.appendChild(taskDesc);

        // Add task buttons
        const taskBtns = document.createElement("div");
        taskBtns.classList.add("task-btns");
        const deleteBtn = document.createElement("img");
        deleteBtn.classList.add('task-delete-btn');
        deleteBtn.setAttribute("src", deleteIcon);
        deleteBtn.setAttribute("title", "Delete");
        deleteBtn.addEventListener("click", (event) => deleteTaskBtnClicked(event));
        taskBtns.appendChild(deleteBtn);
        const editBtn = document.createElement("img");
        editBtn.classList.add('task-edit-btn');
        editBtn.setAttribute("src", editIcon);
        editBtn.setAttribute("title", "Edit");
        editBtn.addEventListener("click", (event) => editTaskBtnClicked(event));
        taskBtns.appendChild(editBtn);
        const notesBtn = document.createElement("img");
        notesBtn.classList.add('task-notes-btn');
        notesBtn.setAttribute("src", notesIcon);
        notesBtn.setAttribute("title", "View notes")
        notesBtn.addEventListener("click", (event) => viewNotesTaskBtnClicked(event));
        taskBtns.appendChild(notesBtn);
        taskEl.appendChild(taskBtns);

        // Add due date
        const dueDateEl = document.createElement("span");
        dueDateEl.classList.add("task-due-date");
        dueDateEl.setAttribute("title", "Due Date");
        const weekday = format(task.dueDate, "ccc");
        const month = format(task.dueDate, "MMM");
        const day = format(task.dueDate, "dd")
        dueDateEl.innerText = weekday + " " + month + " " + day; 
        taskEl.appendChild(dueDateEl);

        return taskEl;
    }
    
    function getRadioButton() {
        const radioBtn = document.createElement("div");
        radioBtn.classList.add("radio");
        radioBtn.addEventListener("click", event => taskRadioBtnClicked(event));
        return radioBtn;
    }
    
    function taskRadioBtnClicked(event) {
        // Update task
        const taskEl = getClosestTaskAncestor(event.target);
        const taskId = taskEl.dataset.taskId;
        Task.getTaskById(taskId).toggleComplete();
        // Update the DOM elements
        refreshTaskDataset(taskId);
    }

    function deleteTaskBtnClicked(event) {
        // Get task info
        const taskEl = getClosestTaskAncestor(event.target);
        const taskId = taskEl.dataset.taskId;
        const task = Task.getTaskById(taskId);
        // Delete task from memory
        task.delete();
        // Delete task from DOM
        const allTaskEls = document.querySelectorAll(`.task[data-task-id=${taskId}`);
        allTaskEls.forEach(taskEl => taskEl.remove());
    }

    function editTaskBtnClicked(event) {

    }

    function viewNotesTaskBtnClicked(event) {

    }

    // Gets the closest ancestor of element that is a task element
    function getClosestTaskAncestor(element) {
        return element.closest(".task");
    }

    // Function to refresh all DOM elements for the given task with the latest task data
    function refreshTaskDataset(taskId) {
        // Get the latest task object
        const task = Task.getTaskById(taskId);
        // Get all of the DOM elements for the task
        const taskElements = document.querySelectorAll(`.task[data-task-id=${taskId}]`);
        // Refresh DOM element datasets with latest task data
        taskElements.forEach(taskEl => {
            taskEl.dataset.importance = task.importance;
            taskEl.dataset.completed = task.completed;
            taskEl.dataset.taskId = task.id;
        });
    }

    return { displayTodaysTasks, displayWeeksTasks, displayImportantTasks, displayCompletedTasks };
})()