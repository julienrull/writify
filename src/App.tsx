import styles from './App.module.css';
import { Component } from "solid-js";
import Supervisor from './components/Supervisor/Supervisor';
import { EditorProvider } from './application/EditorProvider';
import { LayerProvider } from './application/LayerProvider';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <EditorProvider>
        <LayerProvider>
          <Supervisor/>
        </LayerProvider>
      </EditorProvider>
    </div>
  );
};

export default App;
