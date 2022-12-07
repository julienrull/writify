import styles from "./Sidenav.module.css";
import { batch, Component, For, JSX, Show } from "solid-js";
import { Tree, TreeElement, useTree } from '../../application/TreeProvider';
import { useApp } from '../../application/AppProvider';

interface TreeProps {
  element: TreeElement;
}

export const File: Component<TreeProps> = (props) => {
  const [, appController] = useApp();
  function onClick() {
    appController.injectTreeFile(props.element);
  }
  return (
    <li
      onClick={onClick}
      classList={{
        [styles.TitleDisable]: !props.element.selected,
        [styles.TitleEnable]: props.element.selected,
      }}
    >
      {props.element.name}
    </li>
  );
};

export const Folder: Component<TreeProps> = (props) => {
  const [, appController] = useApp();
  function onClick() {
    appController.activateTreeFolder(props.element);
  }
  return (
    <li>
      <div
        classList={{
          [styles.TitleDisable]: !props.element.selected,
          [styles.TitleEnable]: props.element.selected,
        }}
        onClick={onClick}
      >
        {props.element.name}
      </div>
      <Show when={props.element.children && props.element.isOpen}>
        <ul>
          <For each={props.element.children}>
            {(element: TreeElement) =>
              element.type === Tree.FOLDER ? (
                <Folder element={element} />
              ) : (
                <File element={element} />
              )
            }
          </For>
        </ul>
      </Show>
    </li>
  );
};

function renderTree(subTree: TreeElement): JSX.Element[] {
  let elements: JSX.Element[] = [];
  if (subTree.type === Tree.FOLDER && subTree.children) {
    subTree.children.forEach((tr: TreeElement) => {
      elements = [...elements, ...renderTree(tr)];
    });
    return [<Folder element={subTree} />];
  }
  return [<File element={subTree} />];
}

interface SidenavProps {
  children?: any;
}
export const Sidenav: Component<SidenavProps> = () => {
  const [tree,] = useTree();
  return (
    <nav class={styles.Nav}>
      <div class={styles.Explorer}>EXPLORER</div>
      <ul>{renderTree(tree)}</ul>
    </nav>
  );
};
