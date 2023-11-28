import logo from './assets/todo-logo.png';
import profilePic from './assets/headshot.png';
import clock from './assets/clock.svg';
import { Forms } from './forms';
import { Task } from './task';
import format from 'date-fns/format';

export { Header }

const Header = (function () {
    function loadHeader() {
        const header = document.querySelector('header');
        header.innerHTML = `
            <div id="logo"><img src=${logo} alt="Application logo"></div>
            <div class="add-task-btn" tabindex="0">+</div>
            <div id="next-due" tabindex="0">
                <img src=${clock} alt="Icon of a clock" id="clock">
                <span></span>
            </div>
            <img src=${profilePic} alt="Profile photo" id="profile">
        `;
    
        updateNextDue();
    
        const addTaskBtn = header.querySelector('.add-task-btn');
        addTaskBtn.addEventListener('click', Forms.showAddTaskForm)
    }
    
    // Update next task due
    function updateNextDue() {
        // Get due date for next task due
        const tasks = Task.sortByDueDate(Task.getAllTasks());
        const incompleteTasks = tasks.filter(task => !task.completed);
        let nextDueDateStr = "No Tasks Due";
        if (incompleteTasks.length > 0) {
            const nextTaskDue = incompleteTasks[0];
            let nextDueDate = nextTaskDue.dueDate;
            nextDueDateStr = format(nextDueDate, "MMM dd");
        }
    
        const header = document.querySelector('header');
        const nextDueText = header.querySelector('#next-due > span');
        nextDueText.innerText = nextDueDateStr;
    }

    return { loadHeader, updateNextDue }
})();

