import styles from "./Sidenav.module.css";
import openArrow from '../../assets/bottom_white.png'
import closeArrow from '../../assets/right_white.png'
import files from '../../assets/files.png'
import { batch, Component, For, JSX, Show, onMount } from 'solid-js';
import { Tree, TreeElement, useTree } from '../../application/TreeProvider';
import { useApp } from '../../application/AppProvider';

interface TreeProps {
  index: number;
  element: TreeElement;
}

export const File: Component<TreeProps> = (props) => {
  const [, appController] = useApp();
  let treeElementHtml = document.createElement("div");
  onMount(() => {
    treeElementHtml.style.setProperty('--indexPadding', props.index * 20 + "px");
  });
  function onClick() {
    appController.injectTreeFile(props.element);
  }
  return (
    <div
      ref={treeElementHtml}
      onClick={onClick}
      classList={{
        [styles.TreeElement]: true,
        [styles.TitleDisable]: !props.element.selected,
        [styles.TitleEnable]: props.element.selected,
      }}
    >
      <span><img width={14} height={14} src={files} style="margin-right: 5px" /> {props.element.name}</span>
    </div>
  );
};

export const Folder: Component<TreeProps> = (props) => {
  const [, appController] = useApp();
  let treeElementHtml = document.createElement("div");
  onMount(() => {
    treeElementHtml.style.setProperty('--indexPadding', props.index * 20 + "px");
  });
  function onClick() {
    appController.activateTreeFolder(props.element);
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
        onClick={onClick}
      >
        <span>
          <Show when={props.element.isOpen} fallback={<img width={14} height={14} src={closeArrow} style="margin-right: 5px" />}>
            <img width={14} height={14} src={openArrow} style="margin-right: 5px" />
          </Show>
          {props.element.name}
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
