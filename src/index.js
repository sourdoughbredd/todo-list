import './style.css';
import { UiControl } from './uiControl';
import { Forms } from './forms';
import { Header } from "./header";
import { loadFooter } from './footer';
import { loadSidebar } from './sidebar';

Header.loadHeader();
loadFooter();
loadSidebar();
Forms.addHiddenForm();
UiControl.displayAllTasks();