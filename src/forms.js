// Creates form DOM elements for the page
import { Header } from "./header";
import { Project } from "./project";
import { Task } from "./task";

export { Forms };

const Forms = (function() {

    // Create the form
    const body = document.querySelector('body');
    const form = getAddTaskForm();

    // Function to add hidden form to the DOM
    function addHiddenForm() {
        form.classList.add('hidden');
        body.appendChild(form);
    }

    // Function to show the form
    function showAddTaskForm() {
        // Disable interaction with rest of DOM
        const otherBodyElements = document.querySelectorAll('body > :not(.add-task-form)');
        otherBodyElements.forEach(el => el.classList.add('disabled'));
        // Show the form
        form.classList.remove('hidden');
    }

    //Function to refresh the project list on the form
    function refreshProjectList() {
        const dropdownUl = document.querySelector('.project-select-dropdown > ul')
        const projectNames = Project.getAllProjectNames();
        dropdownUl.innerHTML = '';
        projectNames.forEach(projectName => {
            dropdownUl.innerHTML += `<li><input type="checkbox" name="project-selection" value="${projectName}">${projectName}</li>`;
        })
    }


    // HELPERS

    function getAddTaskForm() {
        const formContainer = document.createElement("div");
        formContainer.classList.add("add-task-form-container");
        formContainer.innerHTML = `
            <form action="" class="add-task-form">
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
        addToProjectBtn.appendChild(getProjectDropdown());
        addToProjectBtn.addEventListener('click', event => addToProjectBtnClicked(event));
        
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

        // Add event listener to form submission
        form.addEventListener('submit', function(event) { 
            event.preventDefault()
            if (this.checkValidity()) { formSubmitted(event) };
        });

        return form;
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
        const dropdown = document.querySelector(".add-task-form .project-select-dropdown")
        // Toggle it's hidden class
        dropdown.classList.toggle("hidden");
    }

    // Returns true if element is a child of the dropdown menu
    function isElementInDropdown(element) {
        return element.closest(".project-select-dropdown") != null;
    }

    // Event listener for when the form is successfully submitted
    function formSubmitted(event) {
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
        const notes = form.querySelector('input[name="notes"]') || "";
        
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

    // Close the form (reset and hide)
    function closeForm(event) {
        const form = event.target.closest('.add-task-form');
        form.reset();
        form.classList.add("hidden");
        document.querySelectorAll('*').forEach(el => el.classList.remove('disabled'));
    }

    // Close dropdown menu if clicking outside of it
    function documentClicked(event) {
        // If we clicked outside of the dropdown menu, hide it. Make sure to ignore clicks on the add
        // to project button since we handle that with it's own event listener
        const form = document.querySelector('.add-task-form');
        if (form && !isElementInDropdown(event.target) && !event.target.closest('.add-to-project-btn')) {
            const dropdown = form.querySelector(".project-select-dropdown");
            dropdown.classList.add("hidden");
        }
    }

    return { addHiddenForm, showAddTaskForm, refreshProjectList };

})();