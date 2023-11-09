import logo from './todo-logo.png';
import profilePic from './headshot.png';
import clock from './clock.svg';

export { loadHeader }

function loadHeader() {
    const header = document.querySelector('header');
    header.innerHTML = `
        <img src=${logo} alt="Application logo" id="logo">
        <div id="next-due">
            <img src=${clock} alt="Icon of a clock" id="clock">
            <span>Nov 11</span>
        </div>
        <div id="add-btn">+</div>
        <img src=${profilePic} alt="Profile photo" id="profile">
    `;
}