import styles from './File.module.css'
import crossWhite from '../../assets/close_white.png';
import { Component, createEffect, createSignal } from 'solid-js';

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

    const [hover, setHover] = createSignal(false);

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
        if(e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move"
            e.dataTransfer.setData("title", props.fileStruct.title);
        }
        props.onFileDrag ? props.onFileDrag(e) : undefined;
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
