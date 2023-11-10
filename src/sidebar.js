export { loadSidebar }


function loadSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.innerHTML = `
        <ul class="task-explorer">
            <li class="filter today">Today</li>
            <li class="filter week">This Week</li>
            <li class="filter important">Important</li>
            <li class="filter done">Done</li>
        </ul>
        <div class="project-explorer">
            <div class="title">
                <h3>Projects</h3>
                <div class="add-btn">+</div>
            </div>
            <ul class="projects"></ul>
        </div>
    `;
}