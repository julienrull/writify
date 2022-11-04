import styles from './App.module.css';
import {Panel, Direction} from './components/Panel/Panel';
import { Component, createSignal } from "solid-js";
import Editor from './components/editor/Editor';
import PanelSupervisor from './components/PanelSupervisor/PanelSupervisor';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <PanelSupervisor/>
    </div>
  );
};

export default App;
