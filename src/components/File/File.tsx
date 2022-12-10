import styles from "./FileView.module.css";
import crossWhite from "../../assets/close_white.png";
import { Component, createSignal } from "solid-js";
import { FileStruct, EditorStruct } from "../../application/EditorProvider";
import { useApp } from "../../application/AppProvider";
import { useContextMenu } from '../ContextMenu/ContextMenu';

interface FileProps {
  fileStruct: FileStruct;
  editorStruct: EditorStruct;
}
export const File: Component<FileProps> = (props) => {
  const [_isOver, setIsOver] = createSignal<boolean>(false);
  const [, appController] = useApp();
  const [data, setData] = useContextMenu();
  function onDragOver(e: DragEvent) {
    setIsOver(true);
    console.log("File Over");
    e.preventDefault();
  }

  function onRightClick(event: MouseEvent) {
    console.log("onRightClick")
    setData(props.fileStruct);
  }

  function onDragleave(e: DragEvent) {
    setIsOver(false);
    console.log("File Leave");
    e.preventDefault();
  }

  function onDragDrop(e: DragEvent) {
    setIsOver(false);
    if (e.dataTransfer) {
      let data = JSON.parse(e.dataTransfer.getData("text/plain"));
      let sourceFileName = data.sourceFileName;
      let targetFileName = props.fileStruct.title;
      let sourceEditorId = data.sourceEditorId;
      let targetEditorId = props.editorStruct.id;
      appController.changeFilePosition(
        sourceFileName,
        targetFileName,
        sourceEditorId,
        targetEditorId
      );
    }
    e.preventDefault();
  }

  function onDragEnd(e: DragEvent) {
    setIsOver(false);
    e.preventDefault();
  }

  function onClose(e: MouseEvent) {
    appController.closeFile(props.editorStruct.id, props.fileStruct.title);
    e.stopPropagation();
  }

  function onDragStart(e: DragEvent) {
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      let data = {
        sourceFileName: props.fileStruct.title,
        sourceEditorId: props.editorStruct.id,
      };
      e.dataTransfer.setData("text/plain", JSON.stringify(data));
    }
  }
  function onMouseDown(e: MouseEvent) {
    if (e.target === e.currentTarget || e.target instanceof HTMLSpanElement) {
      appController.switchFile(props.editorStruct.id, props.fileStruct.title);
    }
  }
  return (
    <div
      onContextMenu={onRightClick}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      draggable={true}
      ondragstart={onDragStart}
      onMouseDown={onMouseDown}
      classList={{
        [styles.File]: true,
        [styles.FileSelected]:
          props.fileStruct.active && props.editorStruct.active,
        [styles.FileTitleActivated]: props.fileStruct.active,
        [styles.FileTitleDesactivated]: !props.fileStruct.active,
      }}
    >
      <div
        classList={{ [styles.FileChangedIndicator]: !props.fileStruct.saved }}
      ></div>
      <div
        onDrop={onDragDrop}
        ondragleave={onDragleave}
        classList={{
          [styles.FileHover]: true,
          [styles.FileHoverActive]: _isOver(),
        }}
      ></div>
      <span classList={{ [styles.FileTitle]: true }}>
        {props.fileStruct.title}
      </span>
      <img
        onClick={onClose}
        class={styles.FileCloseIcon}
        src={crossWhite}
        alt=""
      />
    </div>
  );
};
