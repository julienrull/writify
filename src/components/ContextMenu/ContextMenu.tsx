import styles from "./ContextMenu.module.css";
import { Component, createSignal } from "solid-js";

interface ContextMenuProps {
  children: any;
}

const ContextMenu: Component<ContextMenuProps> = (props) => {

  const [show, setShow] = createSignal<boolean>(false);
  const [x, setX] = createSignal<number>(0);
  const [y, setY] = createSignal<number>(0);

  let contextMenu: HTMLDivElement = document.createElement('div'); 

  function onContextMenu(e: MouseEvent) {
    setShow(true);
    contextMenu.style.setProperty('--contextMenuX', e.pageX + "px");
    contextMenu.style.setProperty('--contextMenuY', e.pageY + "px");
    contextMenu.style.setProperty('--contextMenuShow', "flex");
    e.preventDefault();
  }

  function onElementClick(e: MouseEvent) {
    setShow(false);
    contextMenu.style.setProperty('--contextMenuShow', "none");
    e.stopPropagation();
  }

  function onMouseDown(e: MouseEvent) {
      if (e.target && e.target instanceof Element &&  !e.target.classList.contains(styles.ContextMenuElement) && !e.target.classList.contains("ContextMenuElementText")) {
        setShow(false);
        contextMenu.style.setProperty('--contextMenuShow', "none");
      }
      e.stopPropagation();
  }

  return (
    <div id={styles.ContextMenuContainer} onMouseDown={onMouseDown} onContextMenu={onContextMenu}>
      <div ref={contextMenu} id={styles.ContextMenu}>
        <div onClick={onElementClick} class={styles.ContextMenuElement}><span class="ContextMenuElementText">New File...</span></div>
        <div onClick={onElementClick} class={styles.ContextMenuElement}><span class="ContextMenuElementText">New Folder...</span></div>
        <div onClick={onElementClick} class={styles.ContextMenuElement}><span class="ContextMenuElementText">Rename...</span></div>
        <div onClick={onElementClick} class={styles.ContextMenuElement}><span class="ContextMenuElementText">Delete</span></div>
      </div>
      {props.children}
    </div>
  );
};

export default ContextMenu;
