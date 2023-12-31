import { Task } from "./task";
import { Project } from "./project";
import { Forms } from "./forms";
import { Sidebar } from "./sidebar";
import { format, isFuture, isBefore, startOfToday, isToday, isTomorrow, isThisWeek, isThisMonth, isAfter, startOfWeek,
    endOfWeek, startOfMonth, endOfMonth, addWeeks, addMonths } from "date-fns";
import deleteIcon from './assets/delete-icon.svg';
import editIcon from './assets/edit-icon.svg';
import notesIcon from './assets/notes-icon.svg';

export { UiControl };

const UiControl = (function() {

    function clearMain() {
        document.querySelector(".main").innerHTML = "";
    }

    // Displays all future tasks grouped by time frame and includes 
    function displayAllTasks() {
         // Initialize main
        clearMain();
        const main = document.querySelector(".main");
        main.innerHTML = `
            <h2>All Tasks</h2>
        `;

        // Get tasks, sort and filter
        const tasks = Task.getAllTasks();
        const sortedDateTasks = Task.sortByDueDate(tasks).filter(task => 
            !task.completed || (isToday(task.dueDate) || isFuture(task.dueDate)));
        // Group by time frame
        let timeFrameStrs = [];
        let timeFrameMap = {};
        sortedDateTasks.forEach(task => {
            const timeStr = getTimeFrameStrLong(task.dueDate);
            // Add to the list and map
            if (timeFrameStrs.includes(timeStr)) {
                // Already encountered this one. Just add the task to its list.
                timeFrameMap[timeStr].push(task);
            } else {
                // First time seeing this timeStr. Save it and initialize its task list
                timeFrameStrs.push(timeStr);
                timeFrameMap[timeStr] = [task];
            }
        });

        // For each time frame group, create a task list dom element
        timeFrameStrs.forEach(timeStr => {
            const currTimeFrameEl = document.createElement("div");
            currTimeFrameEl.classList.add("time-frame");
            const currTimeFrameTasks = Task.sortByImportance(timeFrameMap[timeStr]);
            const formattedDate = getFormattedDate(currTimeFrameTasks[0].dueDate);
            currTimeFrameEl.innerHTML = `
                <span>${timeStr}</span>
            `;
            currTimeFrameEl.appendChild(getTaskListDomElement(currTimeFrameTasks))
            main.appendChild(currTimeFrameEl);
        })
    }

    function displayTodaysTasks() {
        clearMain();
        // Get projects for today's tasks
        const todaysTasks = Task.getTodaysTasks();
        const projects = Project.getAllProjects();
        let todaysProjects = {};  // map from projects to tasks
        todaysTasks.forEach(task => {
            const taskProjects = projects.filter(project => project.hasTask(task));
            taskProjects.forEach(project => {
                if (!todaysProjects.hasOwnProperty(project.name)) {
                    // New project found. Add to object.
                    todaysProjects[project.name] = [task];
                } else {
                    // Project already exists. Push task to it's values.
                    todaysProjects[project.name].push(task);
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
                <span>${projectName}</span>
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
            currDayContainer.classList.add("time-frame");
            const currDayTasks = Task.sortByImportance(daysOfWeekMap[dayStr]);
            const formattedDate = getFormattedDate(currDayTasks[0].dueDate);
            currDayContainer.innerHTML = `
                <span>${dayStr}, ${formattedDate}</span>
            `;
            currDayContainer.appendChild(getTaskListDomElement(currDayTasks, false))
            daysContainer.appendChild(currDayContainer);
        })
    }

    // Display tasks by importance
    function displayImportantTasks() {
        // Initialize main
        clearMain();
        const main = document.querySelector(".main");
        main.innerHTML = '<h2>Important</h2>';

        // Get all importance values and a map to their tasks
        const tasks = Task.getAllTasks();
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
        main.innerHTML = '<h2>Done</h2>';

        // Get all completed tasks
        const tasks = Task.getAllTasks();
        const completedTasks = tasks.filter(task => task.completed);

        // Sort by due date and append to DOM
        const sortedTasks = Task.sortByDueDate(completedTasks).reverse();
        main.appendChild(getTaskListDomElement(sortedTasks));
    }


    function displayProject(event) {
        // Get project name that was clicked
        const projectName = event.target.innerText;
        const project = Project.getProjectByName(projectName);

        // Initialize main
        clearMain();
        const main = document.querySelector(".main");
        main.innerHTML = `
        <div class="project-title" data-project-name="${projectName}">
            <h2>${projectName}</h2>
            <img src=${deleteIcon}  title="Delete Project" data-project-name="${projectName}">
        </div>
        `;
        const deleteProjectBtn = main.querySelector('.project-title img');
        deleteProjectBtn.addEventListener('click', event => deleteProjectBtnClicked(event));

        // Get tasks for this project
        const tasks = project.getTasks();
        const processedTasks = Task.sortByDueDate(tasks).filter(task => 
            !task.completed || (isToday(task.dueDate) || isFuture(task.dueDate)));

        // Group by time frame
        let timeFrameStrs = [];
        let timeFrameMap = {};
        processedTasks.forEach(task => {
            const timeStr = getTimeFrameStrLong(task.dueDate);
            // Add to the list and map
            if (timeFrameStrs.includes(timeStr)) {
                // Already encountered this one. Just add the task to its list.
                timeFrameMap[timeStr].push(task);
            } else {
                // First time seeing this timeStr. Save it and initialize its task list
                timeFrameStrs.push(timeStr);
                timeFrameMap[timeStr] = [task];
            }
        });

        // For each time frame group, create a task list dom element
        timeFrameStrs.forEach(timeStr => {
            const currTimeFrameEl = document.createElement("div");
            currTimeFrameEl.classList.add("time-frame");
            const currTimeFrameTasks = Task.sortByImportance(timeFrameMap[timeStr]);
            currTimeFrameEl.innerHTML = `
                <span>${timeStr}</span>
            `;
            currTimeFrameEl.appendChild(getTaskListDomElement(currTimeFrameTasks))
            main.appendChild(currTimeFrameEl);
        })
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
        notesBtn.addEventListener("click", (event) => viewNotesBtnClicked(event));
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
        return format(date, "ccc MMM dd");
    }

    function getTimeFrameStrLong(date) {
        // Get the string representation for the time frame
        if (isBefore(date, startOfToday())) {
            return 'Overdue';
        } else if (isToday(date)) {
            return 'Today';
        } else if (isTomorrow(date)) {
            return 'Tomorrow';
        } else if (isThisWeek(date)) {
            return 'This Week';
        } else if (isNextWeek(date)) {
            return 'Next Week';    
        } else if (isThisMonth(date)) {
            return 'This Month';
        } else if (isNextMonth(date)) {
            return 'Next Month';
        } else {
            return 'After Next Month'
        }
    }

    function isNextWeek(date) {
        const today = startOfToday();
        const endOfThisWeek = endOfWeek(today)
        const endOfNextWeek = startOfWeek(addWeeks(endOfThisWeek, 2));
        return isAfter(date, endOfThisWeek) && isBefore(date, endOfNextWeek);
    }

    function isNextMonth(date) {
        const today = startOfToday();
        const endOfThisMonth = endOfMonth(today);
        const endOfNextMonth = startOfMonth(addMonths(today, 2));
        return isAfter(date, endOfThisMonth) && isBefore(date, endOfNextMonth);
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
        const task = Task.getTaskById(taskId)
        task.toggleComplete();
        // Update the DOM elements
        refreshTaskDataset(task);
    }

    function deleteProjectBtnClicked(event) {
        const projectName = event.target.dataset.projectName;
        const project = Project.getProjectByName(projectName);
        project.delete();
        Sidebar.loadSidebar();  // reload sidebar to update project list
        displayAllTasks();
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
        // Get task info
        const taskEl = getClosestTaskAncestor(event.target);
        const taskId = taskEl.dataset.taskId;
        const task = Task.getTaskById(taskId);
        // Show task edit form
        const projects = Project.getProjectNamesForTask(task);
        Forms.showEditTaskForm(taskId, task.description, projects, task.dueDate, task.importance, task.notes);
    }

    function viewNotesBtnClicked(event) {
        const viewNotesBtn = event.target;
        // Check if popup is already open
        if (viewNotesBtn.closest('.task-btns').querySelector('.notes-popup')) {
            return;
        }
        // Close any other popups on the page
        if (document.querySelector('.notes-popup')) {
            document.querySelector('.notes-popup').remove();
        }

        // Get the task notes
        const taskId = getClosestTaskAncestor(viewNotesBtn).dataset.taskId;
        const notes = Task.getTaskById(taskId).notes;

        // Create DOM element to display the notes
        const notesEl = document.createElement("div");
        notesEl.classList.add('notes-popup');
        notesEl.innerHTML = `
            <h3>Notes</h3>
            <p>${notes}</p>
        `;

        // Append it to the buttons
        const taskBtns = viewNotesBtn.closest('.task-btns');
        taskBtns.appendChild(notesEl);
    }

    // Gets the closest ancestor of element that is a task element
    function getClosestTaskAncestor(element) {
        return element.closest(".task");
    }

    // Function to refresh all DOM elements for the given task with the latest task data
    function refreshTaskDataset(task) {
        // Get all of the DOM elements for the task
        const taskElements = document.querySelectorAll(`.task[data-task-id=${task.id}]`);
        // Refresh DOM element datasets with latest task data
        taskElements.forEach(taskEl => {
            taskEl.dataset.importance = task.importance;
            taskEl.dataset.completed = task.completed;
            taskEl.dataset.taskId = task.id;
        });
    }

    // If page is clicked anywhere but the the show notes button, close the current popup
    document.addEventListener('click', event => {
        // Only close popups if click is outside not a popup or view notes btn
        const activePopup = document.querySelector('.notes-popup');
        if (activePopup) {
            const activeViewNotesBtn = activePopup.closest('.task-btns').querySelector('.task-notes-btn');
            if (event.target.closest('.notes-popup') !== activePopup && event.target !== activeViewNotesBtn) {
                activePopup.remove();
            }
        }
    })

    return { displayAllTasks, displayTodaysTasks, displayWeeksTasks, displayImportantTasks, displayCompletedTasks,
        displayProject };
})()