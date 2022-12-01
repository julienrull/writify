import styles from './App.module.css';
import { Component } from "solid-js";
import Supervisor from './components/Supervisor/Supervisor';
import { Providers } from './application/Providers';
import services from './infrastructure/services';
import { Sidenav } from './components/Sidenav/Sidenav';
import { Direction, Panel } from './components/Panel/Panel';
import { LayoutType } from './application/LayerProvider';
import { SidebarPanel } from './components/SidebarPanel/SidebarPanel';


const layout= {
  id: "sidebarPanel",
  type: LayoutType.PANEL,
  position: "400px",
  direction: Direction.HORIZONTAL,
};

const App: Component = () => {
  return (
    <div class={styles.App}>
      <Providers services={services}>
        <SidebarPanel layout={layout} >
          <Sidenav/>
          <Supervisor/>
        </SidebarPanel>
      </Providers>
    </div>
  );
};

export default App;
