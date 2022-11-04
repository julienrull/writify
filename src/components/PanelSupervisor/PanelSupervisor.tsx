import styles from './PanelSupervisor.module.css';
import { Component, createSignal } from "solid-js";
import Editor from '../editor/Editor';
import { Direction, Panel } from "../Panel/Panel";
import { style } from 'solid-js/web';

const PanelSupervisor: Component = () => {
    let [direction, setDirection] = createSignal<Direction>(Direction.HORIZONTAL);
    return (
        <div id={styles.Container}>
            <button onClick={() => setDirection(old => old === Direction.HORIZONTAL ? Direction.VERTICAL : Direction.HORIZONTAL)} class={styles.ButtonDirection}>|-</button>
            <Panel direction={direction()}> 
                <Editor/>
                <Editor/>   
            </Panel>
        </div>
    );
};

export default PanelSupervisor;