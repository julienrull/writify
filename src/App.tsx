import styles from './App.module.css';
import {Panel, Direction} from './components/Panel/Panel';
import { Component, createSignal } from "solid-js";
import Supervisor from './components/Supervisor/Supervisor';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Supervisor/>
    </div>
  );
};

export default App;
