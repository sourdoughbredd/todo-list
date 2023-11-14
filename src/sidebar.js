export { loadSidebar }


function loadSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.innerHTML = `
        <ul class="task-explorer">
            <li class="filter today" tabindex="0">Today</li>
            <li class="filter week" tabindex="0">This Week</li>
            <li class="filter important" tabindex="0">Important</li>
            <li class="filter done" tabindex="0">Done</li>
        </ul>
        <div class="project-explorer">
            <div class="title">
                <h3>Projects</h3>
                <div class="add-project-btn" tabindex="0">+</div>
            </div>
            <ul class="projects"></ul>
        </div>
    `;
}