import styles from "./Editor.module.css";
import {
  Accessor,
  Component,
  createSignal,
  For,
  onMount,
  createEffect,
} from "solid-js";
import { File } from "../File/File";
import { FileStruct, useEditor } from "../../application/EditorProvider";
import { useLayer } from "../../application/LayerProvider";

export interface EditorStruct {
  id: string;
  files: FileStruct[];
}

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
  const [, layerController] = useLayer();

  const [filesHover, setFilesHover] = createSignal(false);

  let [overLayout, setOverLayout] = createSignal<OverLayout>({
    OverlapContainer: false,
    Left: false,
    Right: false,
    Top: false,
    Bottom: false,
    Full: false,
  });

  onMount(() => {
    let activeFile = editorController.getActiveFile(props.editorStructure.id);
    activeFileContent.innerHTML = activeFile ? activeFile.content : "";
  });

  createEffect(() => {
    let activeFile = editorController.getActiveFile(props.editorStructure.id);
    activeFileContent.innerHTML = activeFile ? activeFile.content : "";
  });

  const toggleStyle = function (e: MouseEvent) {
    e.preventDefault();
    let element: HTMLElement = e.currentTarget as HTMLElement;
    document.execCommand(element.id);
  };

  function onPaste(e: ClipboardEvent) {
    e.preventDefault();
    var text = e.clipboardData?.getData("text/plain");
    document.execCommand("insertText", false, text);
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    filesContainer != null
      ? (filesContainer.scrollLeft += e.deltaY)
      : filesContainer;
  }

  function getEditor(): EditorStruct {
    return props.editorStructure;
  }

  function onFileOver(e: DragEvent) {
    console.log("OVER !");
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
      console.log("Right");
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
    console.log("LEAVE !");
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

  function transferFile(
    fileName: string,
    sourceEditorId: string,
    targetEditorId: string,
    position: string
  ) {
    let tempFile = { ...editorController.getFile(sourceEditorId, fileName) };
    let finalTargetEditorId = targetEditorId;
    tempFile.active = true;
    console.log(position);
    if (position !== "Full") {
      finalTargetEditorId = editorController.createEditor();
      layerController.addEditorLayout(targetEditorId, finalTargetEditorId, position);
    }
    editorController.transferFile(
      fileName,
      sourceEditorId,
      finalTargetEditorId
    ); 
    if (editorController.getEditor(sourceEditorId).files.length === 0) {
      layerController.deleteLayout(sourceEditorId);
      editorController.deleteEditorState(sourceEditorId);
    }
  }

  function onFileDrop(e: DragEvent) {
    console.log("DROP !");
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
        transferFile(
          data.sourceFileName,
          editorId,
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
    console.log("END !");
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
        transferFile(
          sourceFileName,
          sourceEditorId,
          targetEditorId,
          "Full"
        );
      }
    }
    e.preventDefault();
  }

  return (
    <div onDragEnd={onFileDragEnd} class={styles.Container}>
      <div
        ref={filesContainer}
        onWheel={onWheel}
        classList={{ [styles.Files]: true }}
      >
        <For each={props.editorStructure?.files}>
          {(item: FileStruct, index: Accessor<number>) => (
            <File
              fileStruct={item}
              editorId={props.editorStructure.id}
            />
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
        onDragOver={onFileOver}
        ref={activeFileContent}
        onPaste={onPaste}
        class={styles.Editor}
        contentEditable={true}
      ></div>
    </div>
  );
};

export { Editor };
