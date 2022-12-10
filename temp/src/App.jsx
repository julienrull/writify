import styles from './App.module.css';
import Panel from './components/Panel/Panel';
import { createSignal } from "solid-js";

function App() {

  let [direction, setDirection] = createSignal("HORIZONTAL");

  return (
    <div class={styles.App}>
      <button onClick={() => setDirection(old => old === "HORIZONTAL" ? "VERTICAL" : "HORIZONTAL")} class={styles.ButtonDirection}>|-</button>
      <Panel direction={direction()} />
    </div>
  );
}

export default App;
