// Creates form DOM elements for the page
import { Header } from "./header";
import { Project } from "./project";
import { Task } from "./task";
import { format } from "date-fns";

export { Forms };

const Forms = (function() {

    // Create the forms
    const body = document.querySelector('body');
    const addForm = createAddTaskForm();
    const editForm = createEditTaskForm();

    // Add event listener to form submissions
    addForm.addEventListener('submit', function(event) { 
        event.preventDefault()
        if (this.checkValidity()) { addTaskFormSubmitted(event) };
    });

    editForm.addEventListener('submit', function(event) { 
        event.preventDefault()
        if (this.checkValidity()) { editTaskFormSubmitted(event) };
    });

    // Function to add hidden forms to the DOM
    function addHiddenForms() {
        addForm.classList.add('hidden');
        editForm.classList.add('hidden');
        body.appendChild(addForm);
        body.appendChild(editForm);
    }

    // Function to show the add task form
    function showAddTaskForm() {
        // Disable interaction with rest of DOM
        const otherBodyElements = document.querySelectorAll('body > :not(.add-task-form)');
        otherBodyElements.forEach(el => el.classList.add('disabled'));
        // Show the form
        addForm.classList.remove('hidden');
    }

    // Function to refresh the project list on the forms
    function refreshProjectList() {
        const forms = [addForm, editForm];
        forms.forEach(form => {
            const dropdownUl = form.querySelector('.project-select-dropdown > ul')
            const projectNames = Project.getAllProjectNames();
            dropdownUl.innerHTML = '';
            projectNames.forEach(projectName => {
                dropdownUl.innerHTML += `<li><input type="checkbox" name="project-selection" value="${projectName}">${projectName}</li>`;
        })
        })
    }

    // Function show edit task form
    function showEditTaskForm(taskId, description, projects, dueDate, importance, notes) {
        // Disable interaction with rest of DOM
        const otherBodyElements = document.querySelectorAll('body > :not(.edit-task-form)');
        otherBodyElements.forEach(el => el.classList.add('disabled'));
        // Attach the task ID to the form for reference during submission
        editForm.dataset.taskId = taskId;
        // Fill with task info
        fillWithTaskInfo(editForm, description, projects, dueDate, importance, notes);
        // Show the form
        editForm.classList.remove('hidden');
    }


    // HELPERS

    function createAddTaskForm() {
        const formContainer = document.createElement("div");
        formContainer.classList.add("add-task-form-container");
        formContainer.innerHTML = `
            <form action="" class="task-form add-task-form">
                <h3>Add Task</h3>
                <span class="close-btn">×</span>
                <div class="task-container">
                    <input type="text" name="description" id="description" required>
                    <div class="add-to-project-btn">
                        <span>Add to Project</span>
                        <span class='dropdown-arrow'>&#x25BC</span>
                    </div> 
                </div>
                <div class="due-date-container">
                    <label for="due-date">Due Date</label>
                    <input type="date" name="due-date" id="due-date" required>
                </div>
                <div class="importance-container">
                    <span>Importance</span>
                    <div class="radio-group"></div>
                </div>
                <div class="notes-container">
                    <span>Notes</span>
                    <textarea name="notes" cols="30" rows="1"></textarea>
                </div>
                <button type="submit">Add</button>
            </form>
        `;
        const form = formContainer.querySelector(".add-task-form");

        // Add project selector
        const addToProjectBtn = form.querySelector(".add-to-project-btn");
        addToProjectBtn.addEventListener('click', event => addToProjectBtnClicked(event));
        addToProjectBtn.appendChild(getProjectDropdown());
        
        // Add event listener on entire document that will hide the dropdown if clicked anywhere else
        document.addEventListener('click', event => documentClicked(event));


        // Add radio group
        const radioGroup = form.querySelector(".radio-group");
        radioGroup.appendChild(getRadioButton(2));
        radioGroup.appendChild(getRadioButton(1));
        // Initialize this radio as checked to force user to pick an option
        const radioBtn0 = getRadioButton(0);
        radioBtn0.classList.add("checked");
        radioGroup.appendChild(radioBtn0);

        // Add event listener to close button
        form.querySelector('.close-btn').addEventListener('click', (event) => closeForm(event));

        return form;
    }

    function createEditTaskForm() {
        // Get the usual add task form
        const form = createAddTaskForm();

        // Give it a different class name
        form.classList.remove('add-task-form');
        form.classList.add('edit-task-form');

        // Change title
        form.querySelector('h3').innerText = 'Edit Task'

        // Change the button label from "Add" to "Submit"
        form.querySelector('button[type="submit"]').innerText = "Submit";

        return form;
    }

    function fillWithTaskInfo(form, description, projects, dueDate, importance, notes) {
        // Description
        form.querySelector('.task-container #description').value = description;
        // Projects
        const projectCheckboxes = form.querySelectorAll('.project-select-dropdown input');
        Array.from(projectCheckboxes).forEach(projectCheckbox => {
            if (projects.includes(projectCheckbox.value)) {
                projectCheckbox.checked = true;
            }
        });
        // Due Date
        const dueDateStr = format(dueDate, "yyyy-MM-dd");
        form.querySelector('#due-date').value = dueDateStr;
        // Importance
        const radios = form.querySelectorAll('.importance-container .radio');
        Array.from(radios).forEach(radio => radio.classList.remove("checked"));
        const radioToCheck = Array.from(radios).filter(radio => radio.dataset.importance == importance);
        radioToCheck[0].classList.add("checked");
        // Notes
        form.querySelector('.notes-container textarea').value = notes;
    }   

    function getRadioButton(importance) {
        const radioBtn = document.createElement("div");
        radioBtn.classList.add("radio");
        radioBtn.dataset.importance = importance;
        radioBtn.addEventListener("click", event => radioBtnClicked(event));
        return radioBtn;
    }

    function radioBtnClicked(event) {
        const radioBtn = event.target;
        // If radio button already selected, do nothing
        if (radioBtn.classList.contains("checked")) return;

        // Remove "checked" from class list of currently checked radio
        const radioGroup = radioBtn.parentNode;
        const checkedRadioBtn = radioGroup.querySelector(`.radio.checked`);
        if (checkedRadioBtn) { 
            checkedRadioBtn.classList.remove("checked") 
        };

        // Add "checked" to class list of this radio
        radioBtn.classList.add("checked");

    }

    function getProjectDropdown() {
        // Get the project names
        const projects = Project.getAllProjects();

        // Create the menu element
        const dropdown = document.createElement("div");
        dropdown.classList.add("project-select-dropdown", "hidden");

        // Add projects to the selections
        const dropdownList = document.createElement("ul");
        projects.forEach(project => {
            dropdownList.innerHTML += `<li><input type="checkbox" name="project-selection" value="${project.name}">${project.name}</li>`;
        });
        dropdown.appendChild(dropdownList);

        return dropdown;
    }

    // Event listener for the add to project button
    function addToProjectBtnClicked(event) {
        // Prevent bubbling up from dropdown menu
        if (isElementInDropdown(event.target)) {
            return;
        }
        // Get the dropdown element
        const btn = event.target.closest('.add-to-project-btn');
        const dropdown = btn.querySelector('.project-select-dropdown');
        // Toggle it's hidden class
        dropdown.classList.toggle("hidden");
    }

    // Returns true if element is a child of the dropdown menu
    function isElementInDropdown(element) {
        return element.closest(".project-select-dropdown") != null;
    }

    // Event listener for when the form is successfully submitted
    function addTaskFormSubmitted(event) {
        const form = event.target;
        // Get task and project info
        const description = form.querySelector('#description').value;
        const dropdownSelections = form.querySelectorAll('input[name="project-selection"]:checked');
        const projectNames = Array.from(dropdownSelections).map(node => node.value);
        const dueDateUTC = form.querySelector("#due-date").valueAsDate;
        // Date input creates a UTC time, but user was specifying local time. Correct this.
        // Make due by 11:59:59 that day
        const dueDateLocal = new Date(dueDateUTC.getUTCFullYear(), dueDateUTC.getUTCMonth(), dueDateUTC.getUTCDate(), 11, 59, 59);
        const importance = parseInt(form.querySelector(".radio.checked").dataset.importance);
        const notes = form.querySelector('textarea[name="notes"]').value;
        
        // Create the task and assign to projects
        const task = Task.addNewTask(description, importance, dueDateLocal, notes, false);
        projectNames.forEach(projectName => Project.getProjectByName(projectName).addTask(task));

        // Clear the form, hide, and re-enable rest of DOM
        form.reset();
        form.classList.add("hidden");
        document.querySelectorAll('*').forEach(el => el.classList.remove('disabled'));

        // Refresh header nex ttask due
        Header.updateNextDue()
    }

    // Event listener for when the form is successfully submitted
    function editTaskFormSubmitted(event) {
        const form = event.target;
        // Get task and project info
        const taskId = form.dataset.taskId;
        let taskData = {};
        taskData.description = form.querySelector('#description').value;
        const dueDateUTC = form.querySelector("#due-date").valueAsDate;
        // Date input creates a UTC time, but user was specifying local time. Correct this.
        // Make due by 11:59:59 that day
        taskData.dueDate = new Date(dueDateUTC.getUTCFullYear(), dueDateUTC.getUTCMonth(), dueDateUTC.getUTCDate(), 11, 59, 59);
        taskData.importance = parseInt(form.querySelector(".radio.checked").dataset.importance);
        taskData.notes = form.querySelector('textarea[name="notes"]').value;
        
        // Update the task
        const task = Task.getTaskById(taskId);
        task.update(taskData);

        // Update the projects
        const dropdownSelections = form.querySelectorAll('input[name="project-selection"]:checked');
        const projectNames = Array.from(dropdownSelections).map(node => node.value);
        Project.removeTaskFromAllProjects(task);
        projectNames.forEach(projectName => {
            Project.getProjectByName(projectName).addTask(task);
        })

        // Clear the form, hide, and re-enable rest of DOM
        form.reset();
        form.classList.add("hidden");
        document.querySelectorAll('*').forEach(el => el.classList.remove('disabled'));

        // Refresh header next task due
        Header.updateNextDue()
    }

    // Close the form (reset and hide)
    function closeForm(event) {
        const form = event.target.closest('.add-task-form') || event.target.closest('.edit-task-form');
        form.reset();
        form.classList.add("hidden");
        document.querySelectorAll('*').forEach(el => el.classList.remove('disabled'));
    }

    // Close dropdown menu if clicking outside of it
    function documentClicked(event) {
        // If we clicked outside of the dropdown menu, hide it. Make sure to ignore clicks on the add
        // to project button since we handle that with it's own event listener
        const activeForm = document.querySelector('.task-form:not(.hidden)')
        if (activeForm && !isElementInDropdown(event.target) && !event.target.closest('.add-to-project-btn')) {
            const dropdown = activeForm.querySelector(".project-select-dropdown");
            dropdown.classList.add("hidden");
        }
    }

    return { addHiddenForms, showAddTaskForm, showEditTaskForm, refreshProjectList };

})();