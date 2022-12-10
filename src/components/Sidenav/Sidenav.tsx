import styles from "./Sidenav.module.css";
import openArrow from '../../assets/bottom_white.png'
import closeArrow from '../../assets/right_white.png'
import files from '../../assets/files.png'
import { Component, For, JSX, Show, onMount, createSignal, createEffect } from 'solid-js';
import { Tree, TreeElement, useTree } from '../../application/TreeProvider';
import { useApp } from '../../application/AppProvider';
import { useContextMenu } from "../ContextMenu/ContextMenu";

interface TreeProps {
  index: number;
  element: TreeElement;
}

export const File: Component<TreeProps> = (props) => {
  const [, appController] = useApp();
  const [, setData] = useContextMenu();
  const [edit, setEdit] = createSignal<boolean>(false);
  let treeElementHtml = document.createElement("div");
  let editInputHtml = document.createElement("input");
  onMount(() => {
    treeElementHtml.style.setProperty('--indexPadding', props.index * 20 + "px");
  });
  createEffect(() => {
    if(edit()) {
      editInputHtml.focus();
    }
    if(props.element.name === "") {
      setEdit(true);
    }
  });
  function onRightClick(event: MouseEvent) {
    console.log("onRightClick")
    setData([props.element, setEdit]);
  }
  function onClick() {
    appController.injectTreeFile(props.element);
  }

  function onKeydown (e: KeyboardEvent) {
    console.log("keyPress");
    if(e.currentTarget && e.currentTarget instanceof HTMLInputElement) {
      if(e.key === "Escape") {
        console.log("escape");
        setEdit(false);
     }else if(e.key === "Enter"){
       console.log("enter");
       appController.renameTreeElement(props.element.name, e.currentTarget.value);
       setEdit(false);
     }
    }
  }

  function onFocusOut(e: FocusEvent) {
    if(e.currentTarget && e.currentTarget instanceof HTMLInputElement) {
      appController.renameTreeElement(props.element.name, e.currentTarget.value);
      setEdit(false);
      if(props.element.name === ""){
        appController.delete("", props.element.type);
      }
    }
  }

  return (
    <div
      ref={treeElementHtml}
      onContextMenu={onRightClick}
      onClick={onClick}
      classList={{
        [styles.TreeElement]: true,
        [styles.TitleDisable]: !props.element.selected,
        [styles.TitleEnable]: props.element.selected,
      }}
    >
      <span>
        <img width={14} height={14} src={files} style="margin-right: 5px" /> 
        <Show when={!edit()} fallback={
          <input ref={editInputHtml} name={props.element.name} value={props.element.name} onkeydown={onKeydown} onFocusOut={onFocusOut}/>
        }>
          {props.element.name}
        </Show>
        </span>
    </div>
  );
};

export const Folder: Component<TreeProps> = (props) => {
  const [edit, setEdit] = createSignal<boolean>(false);
  const [, appController] = useApp();
  const [, setData] = useContextMenu();
  let treeElementHtml = document.createElement("div");
  let editInputHtml = document.createElement("input");
  onMount(() => {
    treeElementHtml.style.setProperty('--indexPadding', props.index * 20 + "px");
  });
  createEffect(() => {
    if(edit()) {
      editInputHtml.focus();
    }
  });
  function onRightClick(event: MouseEvent) {
    console.log("onRightClick")
    setData([props.element, setEdit]);
  }
  function onClick() {
    appController.activateTreeFolder(props.element);
  }
  function onKeydown (e: KeyboardEvent) {
    console.log("keyPress");
    if(e.currentTarget && e.currentTarget instanceof HTMLInputElement) {
      if(e.key === "Escape") {
        console.log("escape");
        setEdit(false);
     }else if(e.key === "Enter"){
       console.log("enter");
       appController.renameTreeElement(props.element.name, e.currentTarget.value);
       setEdit(false);
     }
    }
  }

  function onFocusOut() {
    setEdit(false);
  }
  return (
    <div>
      <div
        ref={treeElementHtml}
        classList={{
          [styles.TreeElement]: true,
          [styles.TitleDisable]: !props.element.selected,
          [styles.TitleEnable]: props.element.selected,
        }}
        onContextMenu={onRightClick}
        onClick={onClick}
      >
        <span>
          <Show when={props.element.isOpen} fallback={<img width={14} height={14} src={closeArrow} style="margin-right: 5px" />}>
            <img width={14} height={14} src={openArrow} style="margin-right: 5px" />
          </Show>
          <Show when={!edit()} fallback={
          <input ref={editInputHtml} name={props.element.name} value={props.element.name} onkeydown={onKeydown} onFocusOut={onFocusOut}/>
        }>
          {props.element.name}
        </Show>
        </span>
      </div>
      <Show when={props.element.children && props.element.isOpen}>
        <div>
          <For each={props.element.children}>
            {(element: TreeElement) =>
              element.type === Tree.FOLDER ? (
                <Folder element={element} index={props.index + 1} />
              ) : (
                <File element={element} index={props.index + 1}/>
              )
            }
          </For>
        </div>
      </Show>
    </div>
  );
};

function renderTree(subTree: TreeElement, index: number): JSX.Element[] {
  let elements: JSX.Element[] = [];
  if (subTree.type === Tree.FOLDER && subTree.children) {
    subTree.children.forEach((tr: TreeElement) => {
      elements = [...elements, ...renderTree(tr, index)];
    });
    return [<Folder element={subTree} index={index}/>];
  }
  return [<File element={subTree} index={index}/>];
}

interface SidenavProps {
  children?: any;
}
export const Sidenav: Component<SidenavProps> = () => {
  const [tree,] = useTree();
  return (
    <nav class={styles.Nav}>
      <div class={styles.Explorer}>EXPLORER</div>
      <div>{renderTree(tree, 0)}</div>
    </nav>
  );
};
