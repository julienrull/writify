import styles from "./Sidenav.module.css";
import { batch, Component, For, JSX, Show } from "solid-js";
import { Tree, TreeController, TreeElement, useTree } from '../../application/TreeProvider';
import { useEditor } from '../../application/EditorProvider';
import { useLayer } from '../../application/LayerProvider';

interface TreeProps {
  element: TreeElement;
}

export const File: Component<TreeProps> = (props) => {
  const [, treeController] = useTree();
  const [editors, editorController] = useEditor();
  const [, layoutController] = useLayer();
  function onClick() {
    treeController.setActivatedTreeElement(props.element.name);
    if(editors.length === 0){
      let editorId = editorController.createEditor();
      layoutController.createRootEditor(
        editorId,
        "Full"
      )
    }
    editorController.inject(props.element);
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
  const [, treeController] = useTree();
  function onClick() {
    batch(() => {
      treeController.setActivatedTreeElement(props.element.name);
      treeController.setTreeElement(
        props.element.name,
        "isOpen",
        !props.element.isOpen
      );
    });
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
  const [tree, treeController] = useTree();
  return (
    <nav class={styles.Nav}>
      <div class={styles.Explorer}>EXPLORER</div>
      <ul>{renderTree(tree)}</ul>
    </nav>
  );
};
