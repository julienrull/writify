import styles from './FileView.module.css'
import crossWhite from '../../assets/close_white.png';
import { Component, createSignal } from 'solid-js';
import { FileStruct, useEditor, EditorStruct } from '../../application/EditorProvider';
import { useLayer } from '../../application/LayerProvider';
import { useTree } from '../../application/TreeProvider';

interface FileProps {
    fileStruct: FileStruct;
    editorStruct: EditorStruct;
}
export const File: Component<FileProps>= (props) => {
    const [_isOver, setIsOver] = createSignal<boolean>(false);

    const [, editorController] = useEditor();
    const [, layerController] = useLayer();
    const [, treeController] = useTree();
/*
    document.documentElement.addEventListener('mouseleave', (event) => {
           console.log("I'm out");
           setIsOver(false);
    });
*/
    function onDragOver(e: DragEvent) {
        setIsOver(true);
        console.log("File Over");
        e.preventDefault();
    }

    function onDragleave(e: DragEvent) {
        setIsOver(false);
        console.log("File Leave");
        e.preventDefault();
    }

    function onDragDrop(e: DragEvent) {
        setIsOver(false);
        if(e.dataTransfer) {
            let data = JSON.parse(e.dataTransfer.getData("text/plain"));
            let sourceFileName = data.sourceFileName;
            let targetFileName = props.fileStruct.title;
            let sourceEditorId = data.sourceEditorId;
            let targetEditorId = editorController.getEditor(props.editorStruct.id).id;
            console.log(targetEditorId);
            editorController.transferFilePosition(sourceFileName, targetFileName, sourceEditorId, targetEditorId);
            let sourceEditor = editorController.getEditor(sourceEditorId);
            if(sourceEditor.files.length === 0) {
                console.log("Delete layout");
                layerController.deleteLayout(sourceEditorId);
                editorController.deleteEditor(sourceEditorId);
            }
        }
        e.preventDefault();
    }

    function onDragEnd(e: DragEvent) {
        setIsOver(false);
        e.preventDefault();
    }

    function onClose(e: MouseEvent) {
        editorController.closeFile(props.editorStruct.id, props.fileStruct.title);
        if (props.editorStruct.files.length === 0) {
            console.log("delete file == 0");
          layerController.deleteLayout(props.editorStruct.id)
          editorController.deleteEditor(props.editorStruct.id);
          let activeEditor = editorController.getActivatedEditor();
          if(activeEditor) {
            let activeFile = editorController.getActiveFile(editorController.getActivatedEditor().id);
            treeController.setActivatedTreeElement(activeFile.title);
          }else {
            let activeTreeElement = treeController.getActivatedElement();
            if(activeTreeElement){
                treeController.setTreeElement(activeTreeElement.name, "selected", false);
            }
          }
        }else{
            console.log("delete file != 0");
            let activeFile = editorController.getActiveFile(props.editorStruct.id);
            treeController.setActivatedTreeElement(activeFile.title);
        }
        e.stopPropagation();
    }

    function onDragStart(e: DragEvent) {
        console.log("File Start");
        let newSourceFile = {...props.fileStruct};
        editorController.setFile(props.editorStruct.id, newSourceFile);
        if(e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move"
            let editor = editorController.getEditor(props.editorStruct.id);
            let data = {
                sourceFileName : props.fileStruct.title,
                sourceEditorId: editor.id
            }
            e.dataTransfer.setData("text/plain", JSON.stringify(data));
        }
    }
    function onMouseDown(e: MouseEvent) {
        if(e.target === e.currentTarget || e.target instanceof HTMLSpanElement) {
            editorController.switchFile(props.editorStruct.id, props.fileStruct);
            if(!props.editorStruct.active){
                editorController.setActivatedEditor(props.editorStruct.id);
            }
            treeController.setActivatedTreeElement(props.fileStruct.title);
        }
    }
    return (
        <div onDragEnd={onDragEnd} onDragOver={onDragOver} draggable={true} ondragstart={onDragStart} onMouseDown={onMouseDown} classList={{[styles.File]: true, [styles.FileSelected]: props.fileStruct.active && props.editorStruct.active, [styles.FileTitleActivated]: props.fileStruct.active, [styles.FileTitleDesactivated]: !props.fileStruct.active}}>
            <div classList={{[styles.FileChangedIndicator]: !props.fileStruct.saved}}></div>
            <div onDrop={onDragDrop} ondragleave={onDragleave} classList={{[styles.FileHover]: true, [styles.FileHoverActive]: _isOver()}}></div>
            <span classList={{[styles.FileTitle]: true}}>{props.fileStruct.title}</span>
            <img onClick={onClose} class={styles.FileCloseIcon} src={crossWhite} alt="" />
        </div>
    );
}
