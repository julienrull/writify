import styles from "./Editor.module.css";
import {
  Accessor,
  Component,
  createSignal,
  For,
  onMount,
  createEffect,
  Show,
} from "solid-js";
import { File } from "../File/File";
import {
  EditorStruct,
  FileStruct,
  useEditor,
} from "../../application/EditorProvider";
import { useLayer } from "../../application/LayerProvider";
import { useTree } from "../../application/TreeProvider";
import { AppController, useApp } from '../../application/AppProvider';

interface OverLayout {
  OverlapContainer: boolean;
  Left: boolean;
  Right: boolean;
  Top: boolean;
  Bottom: boolean;
  Full: boolean;
}

export interface EditorProps {
  editorStructure: EditorStruct;
}

const Editor: Component<EditorProps> = (props) => {
  let filesContainer: HTMLDivElement = document.createElement("div");
  let activeFileContent: HTMLDivElement = document.createElement("div");
  let overlapElement: HTMLDivElement = document.createElement("div");

  const [, editorController] = useEditor();
  const [, appController] = useApp();

  const [filesHover, setFilesHover] = createSignal(false);

  let [overLayout, setOverLayout] = createSignal<OverLayout>({
    OverlapContainer: false,
    Left: false,
    Right: false,
    Top: false,
    Bottom: false,
    Full: false,
  });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      appController.saveFile(props.editorStructure.id);
    }
  });

  onMount(() => {
    let activeFile = editorController.getActiveFile(props.editorStructure.id);
    activeFileContent.innerHTML = activeFile ? activeFile.content : "";
  });

  createEffect((prev: FileStruct) => {
    if (props.editorStructure) {
      let activeFile = editorController.getActiveFile(props.editorStructure.id);
      if (prev && activeFile && prev.title !== activeFile.title) {
        activeFileContent.innerHTML = activeFile.content;
      } else if (!prev && activeFile) {
        activeFileContent.innerHTML = activeFile.content;
      }
      return activeFile;
    }
  });

  function onPaste(e: ClipboardEvent) {
    e.preventDefault();
    var text = e.clipboardData?.getData("text/plain");
    document.execCommand("insertText", false, text);
    appController.changeEditorContent(props.editorStructure.id, text);
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    filesContainer != null
      ? (filesContainer.scrollLeft += e.deltaY)
      : filesContainer;
  }

  function onFileOver(e: DragEvent) {
    let overlapRect = overlapElement.getBoundingClientRect();
    let positionX = e.pageX - overlapRect.left;
    let positionY = e.pageY - overlapRect.top;
    let division = 5;
    let state = {
      OverlapContainer: true,
      Left: false,
      Right: false,
      Top: false,
      Bottom: false,
      Full: false,
    };
    if (
      positionX >= overlapRect.width / division &&
      positionX <= (overlapRect.width / division) * (division - 1) &&
      positionY >= overlapRect.height / division &&
      positionY <= (overlapRect.height / division) * (division - 1)
    ) {
      state.Full = true;
    } else if (
      positionX >= overlapRect.width / division &&
      positionX <= (overlapRect.width / division) * (division - 1) &&
      positionY <= overlapRect.height / division
    ) {
      state.Top = true;
    } else if (
      positionX >= overlapRect.width / division &&
      positionX <= (overlapRect.width / division) * (division - 1) &&
      positionY >= (overlapRect.height / division) * (division - 1)
    ) {
      state.Bottom = true;
    } else if (positionX <= overlapRect.width / 2) {
      state.Left = true;
    } else {
      state.Right = true;
    }
    setOverLayout((old: OverLayout) => {
      return {
        ...old,
        ...state,
      };
    });

    e.preventDefault();
  }

  function onDragLeave(e: DragEvent) {
    if (overLayout().OverlapContainer) {
      setOverLayout((old: OverLayout) => {
        return {
          ...old,
          ...{
            OverlapContainer: false,
            Left: false,
            Right: false,
            Top: false,
            Bottom: false,
            Full: false,
          },
        };
      });
    }
    e.preventDefault();
  }

  function onFileDrop(e: DragEvent) {
    let position = "Full";
    if (overLayout().Left) {
      position = "Left";
    } else if (overLayout().Right) {
      position = "Right";
    } else if (overLayout().Top) {
      position = "Top";
    } else if (overLayout().Bottom) {
      position = "Bottom";
    }
    if (e.dataTransfer) {
      let data = JSON.parse(e.dataTransfer.getData("text/plain"));
      let editorId = data.sourceEditorId;
      if (
        editorId !== props.editorStructure.id ||
        (editorId === props.editorStructure.id && position !== "Full")
      ) {
        appController.transferFile(
          data.sourceFileName,
          editorId,
          activeFileContent.innerHTML,
          props.editorStructure.id,
          position
        );
      }
    }
    setOverLayout((old: OverLayout) => {
      return {
        ...old,
        ...{
          OverlapContainer: false,
          Left: false,
          Right: false,
          Top: false,
          Bottom: false,
          Full: false,
        },
      };
    });
    e.stopPropagation();
    e.preventDefault();
  }

  function onFileDragEnd(e: DragEvent) {
    setOverLayout((old: OverLayout) => {
      return {
        ...old,
        ...{
          OverlapContainer: false,
          Left: false,
          Right: false,
          Top: false,
          Bottom: false,
          Full: false,
        },
      };
    });
    setFilesHover(false);
    e.preventDefault();
  }

  function onFilesDragHover(e: DragEvent) {
    setFilesHover(true);
    e.preventDefault();
  }

  function onFilesDragleave(e: DragEvent) {
    setFilesHover(false);
    e.preventDefault();
  }

  function onFilesDragDrop(e: DragEvent) {
    setFilesHover(false);
    if (e.dataTransfer) {
      let data = JSON.parse(e.dataTransfer.getData("text/plain"));
      let sourceFileName = data.sourceFileName;
      let sourceEditorId = data.sourceEditorId;
      let targetEditorId = props.editorStructure.id;
      if (sourceEditorId !== props.editorStructure.id) {
        appController.transferFile(sourceFileName, sourceEditorId, activeFileContent.innerHTML, targetEditorId, "Full");
      }
    }
    e.preventDefault();
  }

  function onContentChange() {
    appController.changeEditorContent(props.editorStructure.id, activeFileContent.innerHTML);
  }

  function onFocus() {
    if (!props.editorStructure.active) {
      editorController.setActivatedEditor(props.editorStructure.id);
    }
  }


  return (
    <div onDragEnd={onFileDragEnd} class={styles.Container}>
      <div
        ref={overlapElement}
        onDragOver={onFileOver}
        onDrop={onFileDrop}
        ondragleave={onDragLeave}
        classList={{
          [styles.OverlapContainer]: overLayout().OverlapContainer,
          [styles.Full]: overLayout().Full,
          [styles.Bottom]: overLayout().Bottom,
          [styles.Top]: overLayout().Top,
          [styles.Left]: overLayout().Left,
          [styles.Right]: overLayout().Right,
        }}
      ></div>
        <div
          ref={filesContainer}
          onWheel={onWheel}
          classList={{ [styles.Files]: true }}
        >
          <For each={props.editorStructure?.files}>
            {(item: FileStruct, index: Accessor<number>) => (
              <File fileStruct={item} editorStruct={props.editorStructure} />
            )}
          </For>
          <div
            onDragOver={onFilesDragHover}
            onDrop={onFilesDragDrop}
            ondragleave={onFilesDragleave}
            classList={{
              [styles.FilesHover]: true,
              [styles.FilesHoverAvtive]: filesHover(),
            }}
          ></div>
        </div>
        <div
          onDragOver={onFileOver}
          ref={activeFileContent}
          onPaste={onPaste}
          class={styles.Editor}
          contentEditable={true}
          onInput={onContentChange}
          onFocus={onFocus}
        ></div>
    </div>
  );
};

export { Editor };
