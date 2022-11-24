import styles from './App.module.css';
import { Component } from "solid-js";
import Supervisor from './components/Supervisor/Supervisor';
import { Providers } from './application/Providers';
import services from './infrastructure/services';

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Providers services={services}>
        <Supervisor/>
      </Providers>
    </div>
  );
};

export default App;
