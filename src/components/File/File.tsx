import styles from './File.module.css'
import crossWhite from '../../assets/close_white.png';
import { Component, createSignal } from 'solid-js';

export interface FileStruct {
    title: string;
    content: string;
    active: boolean;
}

interface FileProps {
    fileStruct: FileStruct;
    onFileMouseDown?: (file: FileStruct) => void;
    onFileClose?: (file: FileStruct) => void;
    onFileDragStart?: (event: DragEvent) => void;
    onFileDrop?: (event: DragEvent, targetFileName: string) => void;
    draggable?: boolean;
}
const File: Component<FileProps>= (props) => {

    const [hover, setHover] = createSignal(false);

    function onMouseDown(e: MouseEvent) {
        if(e.target === e.currentTarget || e.target instanceof HTMLSpanElement) {
            props.onFileMouseDown ? props.onFileMouseDown(props.fileStruct) : undefined;
        }
    }

    function onClose(e: MouseEvent) {
        props.onFileClose ? props.onFileClose(props.fileStruct) : undefined;
        e.stopPropagation();
    }

    function onDragStart(e: DragEvent) {
        if(e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move"
            let data = {
                sourceFileName : props.fileStruct.title
            }
            e.dataTransfer.setData("text/plain", JSON.stringify(data));
        }
        props.onFileDragStart ? props.onFileDragStart(e) : undefined;
    }

    function onDragHover(e: DragEvent) {
        console.log("Hover !");
        setHover(true);
        e.preventDefault();
    }

    function onDragleave(e: DragEvent) {
        setHover(false);
        e.preventDefault();
    }

    function onDragDrop(e: DragEvent) {
        setHover(false);
        if(e.dataTransfer) {
            props.onFileDrop ? props.onFileDrop(e, props.fileStruct.title) : undefined;
        }
        e.preventDefault();
    }

    function onDragEnd(e: DragEvent) {
        setHover(false);
        e.preventDefault();
    }

    return (
        <div onDragEnd={onDragEnd} onDragOver={onDragHover} draggable={props.draggable} ondragstart={onDragStart} onMouseDown={onMouseDown} classList={{[styles.File]: true, [styles.FileSelected]: props.fileStruct.active}}>
            <div onDrop={onDragDrop} ondragleave={onDragleave} classList={{[styles.FileHover]: true, [styles.FileHoverActive]: hover()}}></div>
            <span class={styles.FileTitle}>{props.fileStruct.title}</span>
            <img onClick={onClose} class={styles.FileCloseIcon} src={crossWhite} alt="" />
        </div>
    );
}

export  {File};

function useEffect() {
    throw new Error('Function not implemented.');
}
