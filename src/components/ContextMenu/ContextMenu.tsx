import styles from "./ContextMenu.module.css";
import { Component, createSignal, createContext, useContext, JSX } from "solid-js";
import { Tree } from "../../application/TreeProvider";
import { useApp } from '../../application/AppProvider';

interface ContextMenuProps {
  children: any;
}

const ContextMenuContext = createContext<any>();

export const ContextMenu: Component<ContextMenuProps> = (props) => {
  const [, appController] = useApp();
  const [data, setData] = createSignal<any>({});
  const [show, setShow] = createSignal<boolean>(false);
  const [x, setX] = createSignal<number>(0);
  const [y, setY] = createSignal<number>(0);

  type CommandType = "DELETE" | "RENAME" | "NEW_FILE" | "NEW_FOLDER";

  const commands = {
    DELETE: {
      "label": "Delete",
      "command":(fileName: string) => {
        appController.delete(fileName);
        console.log(fileName + " has been deleted !");
      },
    },
    RENAME: {
      "label": "Rename",
      "command":(fileName: string) => {
        console.log(fileName + " has been renamed !");
      }
    },
    NEW_FILE: {
      "label": "New File...",
      "command": () => {
        console.log("A file has been created !");
      },
    },
    NEW_FOLDER: {
      "label": "New Folder...",
      "command": () => {
        console.log("A folder has been created !");
      },
    },
  };

  let contextMenu: HTMLDivElement = document.createElement("div");

  function onContextMenu(e: MouseEvent) {
    setShow(true);
    contextMenu.style.setProperty("--contextMenuX", e.pageX + "px");
    contextMenu.style.setProperty("--contextMenuY", e.pageY + "px");
    contextMenu.style.setProperty("--contextMenuShow", "flex");
    e.preventDefault();
  }

  function onElementClick(e: MouseEvent) {
    setShow(false);
    contextMenu.style.setProperty("--contextMenuShow", "none");
    if (Object.keys(data()).length !== 0 && e.currentTarget && e.currentTarget instanceof HTMLDivElement) {
      const index: CommandType = e.currentTarget.id as CommandType;
      if (index === "DELETE") {
        if (data().name) {
          commands[index].command(data().name);
        }
      } else if (index === "RENAME") {
        if (data().name) {
          commands[index].command(data().name);
        }
      } else if (index === "NEW_FILE") {
        if (data().name) {
          commands[index].command();
        }
      } else if (index === "NEW_FOLDER") {
        if (data().name) {
          commands[index].command();
        }
      }
    }
    setData({});
    e.stopPropagation();
  }

  function onMouseDown(e: MouseEvent) {
    if (
      e.target &&
      e.target instanceof Element &&
      !e.target.classList.contains(styles.ContextMenuElement) &&
      !e.target.classList.contains("ContextMenuElementText")
    ) {
      setShow(false);
      setData({});
      contextMenu.style.setProperty("--contextMenuShow", "none");
    }
    e.stopPropagation();
  }

  function renderContextMenu(indexes: CommandType[]): JSX.Element[]{
    let elements: JSX.Element[] = [];
    indexes.forEach((index: CommandType) => {
      elements.push(
        <div
          id={index}
          onClick={onElementClick}
          class={styles.ContextMenuElement}
        >
          <span class="ContextMenuElementText">{commands[index].label}</span>
        </div>
      );
    });
    return elements;
  }

  function renderScheduler(): JSX.Element[] {
    let elements: JSX.Element[] = [];
    if(Object.keys(data()).length !== 0) {
      console.log(data().type);
      if(data().type !== undefined){
        if(data().type === Tree.FILE){
          elements = renderContextMenu(["RENAME", "DELETE"]);
        }else if(data().type === Tree.FOLDER){
          elements = renderContextMenu(["NEW_FILE", "NEW_FOLDER","RENAME", "DELETE"]);
        }
      }
    }
    return elements;
  }


  
  return (
    <div
      id={styles.ContextMenuContainer}
      onMouseDown={onMouseDown}
      onContextMenu={onContextMenu}
    >
      <div ref={contextMenu} id={styles.ContextMenu}>
       {renderScheduler()}
      </div>
      <ContextMenuContext.Provider value={[data, setData]}>
        {props.children}
      </ContextMenuContext.Provider>
    </div>
  );
};

export function useContextMenu() {
  return useContext(ContextMenuContext);
}
