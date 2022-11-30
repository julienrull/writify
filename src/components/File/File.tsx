import styles from './FileView.module.css'
import crossWhite from '../../assets/close_white.png';
import { Component, createSignal } from 'solid-js';
import { FileStruct, useEditor } from '../../application/EditorProvider';
import { useLayer } from '../../application/LayerProvider';

interface FileProps {
    fileStruct: FileStruct;
    editorId: string;
}
export const File: Component<FileProps>= (props) => {
    const [_isOver, setIsOver] = createSignal<boolean>(false);

    const [, editorController] = useEditor();
    const [, layerController] = useLayer();

    function onDragOver(e: DragEvent) {
        setIsOver(true);
        e.preventDefault();
    }

    function onDragleave(e: DragEvent) {
        setIsOver(false);
        e.preventDefault();
    }

    function onDragDrop(e: DragEvent) {
        setIsOver(false);
        if(e.dataTransfer) {
            let data = JSON.parse(e.dataTransfer.getData("text/plain"));
            let sourceFileName = data.sourceFileName;
            let targetFileName = props.fileStruct.title;
            let sourceEditorId = data.sourceEditorId;
            let targetEditorId = editorController.getEditor(props.editorId).id;
            console.log(targetEditorId);
            editorController.transferFilePosition(sourceFileName, targetFileName, sourceEditorId, targetEditorId);
        }
        e.preventDefault();
    }

    function onDragEnd(e: DragEvent) {
        setIsOver(false);
        e.preventDefault();
    }

    function onClose(e: MouseEvent) {
        editorController.closeFile(props.editorId, props.fileStruct.title);
        if (editorController.getEditor(props.editorId).files.length === 0) {
          layerController.deleteLayout(props.editorId)
          editorController.deleteEditor(props.editorId);
        }
        e.stopPropagation();
    }

    function onDragStart(e: DragEvent) {
        let newSourceFile = {...props.fileStruct};
        editorController.setFile(props.editorId, newSourceFile);
        if(e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move"
            let editor = editorController.getEditor(props.editorId);
            let data = {
                sourceFileName : props.fileStruct.title,
                sourceEditorId: editor.id
            }
            e.dataTransfer.setData("text/plain", JSON.stringify(data));
        }
    }
    function onMouseDown(e: MouseEvent) {
        if(e.target === e.currentTarget || e.target instanceof HTMLSpanElement) {
            editorController.switchFile(props.editorId, props.fileStruct);
        }
    }
    return (
        <div onDragEnd={onDragEnd} onDragOver={onDragOver} draggable={true} ondragstart={onDragStart} onMouseDown={onMouseDown} classList={{[styles.File]: true, [styles.FileSelected]: props.fileStruct.active}}>
            <div classList={{[styles.FileChangedIndicator]: !props.fileStruct.saved}}></div>
            <div onDrop={onDragDrop} ondragleave={onDragleave} classList={{[styles.FileHover]: true, [styles.FileHoverActive]: _isOver()}}></div>
            <span class={styles.FileTitle}>{props.fileStruct.title}</span>
            <img onClick={onClose} class={styles.FileCloseIcon} src={crossWhite} alt="" />
        </div>
    );
}
