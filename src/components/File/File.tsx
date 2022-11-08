import styles from './File.module.css'
import crossWhite from '../../assets/close_white.png';
import { Component } from "solid-js";

export interface FileStruct {
    title: string;
    content: string;
    active: boolean;
}

interface FileProps {
    fileStruct: FileStruct;
    onFileMouseDown?: (file: FileStruct) => void;
    onFileClose?: (file: FileStruct) => void;
    onFileDrag?: (event: DragEvent) => void;
    draggable?: boolean;
}
const File: Component<FileProps>= (props) => {

    function onMouseDown(e: MouseEvent) {
        if(e.target === e.currentTarget || e.target instanceof HTMLSpanElement) {
            props.onFileMouseDown ? props.onFileMouseDown(props.fileStruct) : undefined;
        }
    }

    function onClose(e: MouseEvent) {
        e.stopPropagation();
        props.onFileClose ? props.onFileClose(props.fileStruct) : undefined;
    }

    function onDragStart(e: DragEvent) {
        props.onFileDrag ? props.onFileDrag(e) : undefined;
    }

    return (
        <div draggable={props.draggable} ondragstart={onDragStart} onMouseDown={onMouseDown} classList={{[styles.File]: true, [styles.FileSelected]: props.fileStruct.active}}>
            <span class={styles.FileTitle}>{props.fileStruct.title}</span>
            <img onClick={onClose} class={styles.FileCloseIcon} src={crossWhite} alt="" />
        </div>
    );
}

export  {File};