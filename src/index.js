import './style.css';
import { UiControl } from './uiControl';
import { Forms } from './forms';
import { Header } from "./header";
import { loadFooter } from './footer';
import { Sidebar } from './sidebar';

Header.loadHeader();
loadFooter();
Sidebar.loadSidebar();
Forms.addHiddenForms();
UiControl.displayAllTasks();