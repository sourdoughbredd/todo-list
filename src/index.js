import './style.css';
import { loadHeader } from "./header";
import { loadFooter } from './footer';
import { loadSidebar } from './sidebar';
import { Task } from './task';

loadHeader();
loadFooter();
loadSidebar();

if (Object.keys(Task.tasks).length === 0) {
    let task1 = Task.addTask("hi","my","name","is","brett", false);
    let task2 = Task.addTask("hi","my","name","is","berscilla", false);
    let task3 = Task.addTask("hi","my","name","is","gus", false);
}
console.log(Task.tasks)
console.log(Task.currentId)