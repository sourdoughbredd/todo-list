import logo from './assets/todo-logo.png';
import profilePic from './assets/headshot.png';
import clock from './assets/clock.svg';

export { loadHeader }

function loadHeader() {
    const header = document.querySelector('header');
    header.innerHTML = `
        <div id="logo"><img src=${logo} alt="Application logo"></div>
        <div class="add-task-btn" tabindex="0">+</div>
        <div id="next-due" tabindex="0">
            <img src=${clock} alt="Icon of a clock" id="clock">
            <span>Nov 11</span>
        </div>
        <img src=${profilePic} alt="Profile photo" id="profile">
    `;
}