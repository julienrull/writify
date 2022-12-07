import styles from "./Supervisor.module.css";
import { Component, JSX } from "solid-js";
import { Editor } from "../Editor/Editor";
import { Direction, Panel } from "../Panel/Panel";
import { useEditor } from "../../application/EditorProvider";
import { useLayer } from '../../application/LayerProvider';

enum LayoutType {
  EDITOR,
  PANEL,
}

interface Layout {
  id: string;
  type: LayoutType;
  direction?: Direction;
  children?: Layout[];
}

const Supervisor: Component = () => {

  // * CONTEXTS INIT => Editor and Layer states
  const [, editorController] = useEditor();
  const [layoutState,] = useLayer();

  function renderLayout(layout: Layout): JSX.Element[] {
    let elements: JSX.Element[] = [];
    if (
      layout.type === LayoutType.PANEL &&
      layout.children &&
      layout.direction != undefined
    ) {
      layout.children.forEach((l: Layout) => {
        elements = [...elements, ...renderLayout(l)];
      });
      return [
        <Panel layout={layout}>
          {elements.map((elem) => elem)}
        </Panel>,
      ];
    }
    return [
      <Editor
        editorStructure={editorController.getEditor(layout.id)}
      />,
    ];
  }

  return (
    <div id={styles.Container}>
      {renderLayout(layoutState).map((elem) => elem)}
    </div>
  );
};

export default Supervisor;
