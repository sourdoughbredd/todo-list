import { UiControl } from "./uiControl";
import { Project } from "./project";
import { Forms } from "./forms";
export { Sidebar }

const Sidebar = (function() {

    function loadSidebar() {
        const sidebar = document.querySelector(".sidebar");
        sidebar.innerHTML = `
            <ul class="task-explorer">
                <li class="filter all" tabindex="0">All</li>
                <li class="filter today" tabindex="0">Today</li>
                <li class="filter week" tabindex="0">This Week</li>
                <li class="filter important" tabindex="0">Important</li>
                <li class="filter done" tabindex="0">Done</li>
            </ul>
            <div class="project-explorer">
                <h3 class="title">Projects</h3>
                <ul class="projects"></ul>
            </div>
        `;
    
        // Add projects
        addProjectList();
    
        // Add event listeners for nav buttons
        const allBtn = sidebar.querySelector(".filter.all");
        allBtn.addEventListener('click', UiControl.displayAllTasks);
    
        const todayBtn = sidebar.querySelector(".filter.today");
        todayBtn.addEventListener("click", UiControl.displayTodaysTasks)
    
        const weekBtn = sidebar.querySelector(".filter.week");
        weekBtn.addEventListener("click", UiControl.displayWeeksTasks)
    
        const importantBtn = sidebar.querySelector(".filter.important");
        importantBtn.addEventListener("click", UiControl.displayImportantTasks);
    
        const doneBtn = sidebar.querySelector(".filter.done");
        doneBtn.addEventListener("click", UiControl.displayCompletedTasks)
    
    }

    return { loadSidebar };

})();


// Function to add all saved projects ot the project list
function addProjectList() {
    // Get projects
    const projectNames = Project.getAllProjectNames();

    // Create sidebar elements
    const projectsListEl = document.querySelector(".sidebar .projects");
    projectNames.forEach(projectName => addProjectToList(projectName));

    // Add the element that adds a project
    addAddProjectElement();
}

// Function to append a single project to the end of the project list
function addProjectToList(projectName) {
    const projectsListEl = document.querySelector(".sidebar .projects");
    const projectEl = document.createElement("li");
    projectEl.classList.add("filter", "project");
    projectEl.setAttribute('tabindex', '0');
    projectEl.innerText = projectName;
    projectEl.addEventListener('click', (event) => UiControl.displayProject(event));
    projectsListEl.appendChild(projectEl);
}

// Function to add the "add project button" to the end of the project list
function addAddProjectElement() {
    const projectsListEl = document.querySelector(".sidebar .projects");
    const addProjectEl = document.createElement("li");
    addProjectEl.classList.add("add-project-btn", "project", "filter");  // add filter class to match formatting
    addProjectEl.setAttribute('tabindex', '0');
    addProjectEl.innerText = 'New Project +';
    addProjectEl.addEventListener('click', (event) => addProjectPressed(event));
    projectsListEl.appendChild(addProjectEl);
}

// Callback for when add project button is pressed
function addProjectPressed(event) {
    // Remove the project adding button 
    const addProjectEl = event.target;
    const parent = addProjectEl.parentNode;
    addProjectEl.remove();

    // Create an input element
    const newProjectInput = document.createElement("form");
    newProjectInput.classList.add("add-project-form");
    newProjectInput.innerHTML = `
        <input type="text" name="project-name" id="project-input" placeholder="Project Name" autofocus="autofocus" required></input>
    `;

    // Add event listener for document clicks to remove the input element
    document.addEventListener('click', event => documentClicked(event));

    // Attach event listener for form submission
    newProjectInput.addEventListener("submit", event => newProjectSubmitted(event));

    // Place it where the add project button was
    parent.appendChild(newProjectInput);

}

// Callback for when a new project name is submitted
function newProjectSubmitted(event) {
    event.preventDefault();
    // Add to list of projects
    const input = document.querySelector('#project-input');
    const projectName = input.value;
    Project.addNewProject(projectName);
    // Refresh the project list in the add task form
    Forms.refreshProjectList();
    // Remove the form from the DOM
    document.querySelector(".add-project-form").remove();
    // Add to sidebar list
    addProjectToList(projectName);
    // Add add project button back to sidebar list
    addAddProjectElement();
}

// Close the form if the user clicks anywhere but the add project form
function documentClicked(event) {
    if (document.querySelector('.add-project-form')) {
        if (!event.target.closest('.add-project-form') && !event.target.closest('.add-project-btn')) {
            // Remove the form from the DOM
            document.querySelector(".add-project-form").remove();
            document.removeEventListener('click', event => documentClicked(event));
            addAddProjectElement();
        }
    }
}