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
      "command": async (fileName: string, type: Tree) => {
        await appController.delete(fileName, type);
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
      "command": async (folderName: string) => {
        appController.setFolderIsOpen(folderName, true);
        await appController.newTreeElement(folderName, Tree.FILE);
        console.log("A file has been created !");
      },
    },
    NEW_FOLDER: {
      "label": "New Folder...",
      "command": async (folderName: string) => {
        appController.setFolderIsOpen(folderName, true);
        await appController.newTreeElement(folderName, Tree.FOLDER);
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

  async function onElementClick(e: MouseEvent) {
    setShow(false);
    contextMenu.style.setProperty("--contextMenuShow", "none");
    let element = data().length ? data()[0] : data();
    if (Object.keys(element).length !== 0 && e.currentTarget && e.currentTarget instanceof HTMLDivElement) {
      const index: CommandType = e.currentTarget.id as CommandType;
      if (index === "DELETE") {
        if (element.name) {
          await commands[index].command(element.name, element.type);
        }
      } else if (index === "RENAME") {
        if (element) {
          let [, setEdit] = data();
          setEdit(true);
          commands[index].command(element.name);
        }
      } else if (index === "NEW_FILE") {
        if (element.name) {
          await commands[index].command(element.name);
        }
      } else if (index === "NEW_FOLDER") {
        if (element.name) {
          await commands[index].command(element.name);
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
    let element = data().length ? data()[0] : data();
    if(Object.keys(element).length !== 0) {
      console.log(element.type);
      if(element.type !== undefined){
        if(element.type === Tree.FILE){
          elements = renderContextMenu(["RENAME", "DELETE"]);
        }else if(element.type === Tree.FOLDER){
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
