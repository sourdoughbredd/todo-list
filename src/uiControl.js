import { Task } from "./task";
import { Project } from "./project";
import { format, isPast, isFuture, isToday, isTomorrow } from "date-fns";
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
        let todaysProjects = {};  // map from projects to tasks
        todaysTasks.forEach(task => {
            const taskProjects = task.getProjects();
            taskProjects.forEach(projectName => {
                if (!todaysProjects.hasOwnProperty(projectName)) {
                    // New project found. Add to object.
                    todaysProjects[projectName] = [task];
                } else {
                    // Project already exists. Push task to it's values.
                    todaysProjects[projectName].push(task);
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
        for (const [projectName, projectTasks] of Object.entries(todaysProjects)) {
            // Initialize the project element
            const projectContainer = document.createElement("div");
            projectContainer.classList.add('project-container');
            projectContainer.innerHTML = `
                <h3>${projectName}</h3>
            `;

            // Add task elements to the project task list
            const taskListEl = getTaskListDomElement(projectTasks);
            projectContainer.appendChild(taskListEl);

            // Append project to main
            main.appendChild(projectContainer);
        }
    }

    // Displays weeks tasks in main
    function displayWeeksTasks() {
        // Initialize main
        clearMain();
        const main = document.querySelector(".main");
        main.innerHTML = `
            <h2>This Week</h2>
            <div class="days"></div>
        `;
        const daysContainer = main.querySelector(".days");

        // Get this weeks tasks
        const weeksTasks = Task.getWeeksTasks();
        const sortedWeeksTasks = Task.sortByDueDate(weeksTasks);

        // For each day of the week, add a task list
        let daysOfWeekStrs = []; // ordered array of day of week strings
        let daysOfWeekMap = {}; // maps days of week strings to tasks that day
        sortedWeeksTasks.forEach((task) => {
            const currDayOfWeekStr = isToday(task.dueDate) ? 'Today' : isTomorrow(task.dueDate) ? 'Tomorrow' : format(task.dueDate,'cccc');
            if (!(currDayOfWeekStr in daysOfWeekMap)) {
                // Add day to the array and map. Map to task.
                daysOfWeekStrs.push(currDayOfWeekStr);
                daysOfWeekMap[currDayOfWeekStr] = [task];
            } else {
                // Day of week already in map. Push task to its value.
                daysOfWeekMap[currDayOfWeekStr].push(task);
            }
        });
        daysOfWeekStrs.forEach(dayStr => {
            const currDayContainer = document.createElement("div");
            currDayContainer.classList.add("day");
            const currDayTasks = Task.sortByImportance(daysOfWeekMap[dayStr]);
            const formattedDate = getFormattedDate(currDayTasks[0].dueDate);
            currDayContainer.innerHTML = `
                <span>${dayStr}</span>
                <span>${formattedDate}</span>
            `;
            currDayContainer.appendChild(getTaskListDomElement(currDayTasks, false))
            daysContainer.appendChild(currDayContainer);
        })
    }


    function displayImportantTasks() {
        // Initialize main
        clearMain();
        const main = document.querySelector(".main");
        main.innerHTML = '<h2>Important</h2>';

        // Get all importance values and a map to their tasks
        const tasks = Task.getTaskObjects();
        // Only include (1) incomplete tasks and (2) completed tasks that are today or future
        const filteredTasks = tasks.filter(task => !task.completed || (isToday(task.dueDate) || isFuture(task.dueDate)));
        const importanceVals = [];
        const importanceMap = {};
        filteredTasks.forEach(task => {
            const taskImportance = task.importance;
            if (taskImportance in importanceMap) {
                // Add to the list of tasks for this importance level
                importanceMap[taskImportance].push(task);
            } else {
                // Add this importance level and add the task to it.
                importanceVals.push(taskImportance);
                importanceMap[taskImportance] = [task];
            }
        });
        importanceVals.sort((a, b) => b - a); // Sort in descending order
        // For each importance value, get the task and sort by due date
        const taskListEl = getTaskListDomElement([]);
        importanceVals.forEach(importanceVal => {
            const importanceTasks = importanceMap[importanceVal];
            const sortedImportanceTasks = Task.sortByDueDate(importanceTasks);
            appendToTaskListDomElement(taskListEl, sortedImportanceTasks);
        });

        main.appendChild(taskListEl);
    }

    // Display all completed tasks that were due before today
    function displayCompletedTasks() {
        // Initialize main
        clearMain();
        const main = document.querySelector(".main");
        main.innerHTML = '<h2>Completed</h2>';

        // Get all completed tasks that are in the past
        const tasks = Task.getTaskObjects();
        const completedTasks = tasks.filter(task => task.completed && isPast(task.dueDate) && !isToday(task.dueDate));

        // Sort by due date and append to DOM
        const sortedTasks = Task.sortByDueDate(completedTasks);
        main.appendChild(getTaskListDomElement(sortedTasks));
    }

    // Returns the DOM element for a list of tasks
    function getTaskListDomElement(tasks, addDates=true) {
        const taskListEl = document.createElement("ul");
        taskListEl.classList.add("task-list");
        tasks.forEach(task => {
            taskListEl.appendChild(getTaskDomElement(task, addDates));
        })
        return taskListEl;
    }

    function appendToTaskListDomElement(taskListEl, tasks, addDates=true) {
        tasks.forEach(task => {
            taskListEl.appendChild(getTaskDomElement(task, addDates));
        })
    }

    function getTaskDomElement(task, addDates=true) {
        // Get task and add data to DOM element
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
        if (addDates) {
            const dueDateEl = document.createElement("span");
            dueDateEl.classList.add("task-due-date");
            dueDateEl.setAttribute("title", "Due Date");
            dueDateEl.innerText = getFormattedDate(task.dueDate); 
            taskEl.appendChild(dueDateEl);
        }
        
        return taskEl;
    }

    // Returns date string formatted as, for example, Mon Nov 20
    function getFormattedDate(date) {
        const weekday = format(date, "ccc");
        const month = format(date, "MMM");
        const day = format(date, "dd")
        return weekday + " " + month + " " + day; 
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