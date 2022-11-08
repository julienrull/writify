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
    onFileClick?: (file: FileStruct) => void;
    onFileClose?: (file: FileStruct) => void;
}
const File: Component<FileProps>= (props) => {

    function onclick() {
        props.onFileClick ? props.onFileClick(props.fileStruct) : undefined;
    }

    function onClose(e: MouseEvent) {
        props.onFileClose ? props.onFileClose(props.fileStruct) : undefined;
        e.stopPropagation();
    }

    return (
        <div onClick={onclick} classList={{[styles.File]: true, [styles.FileSelected]: props.fileStruct.active}}>
            <div class={styles.FileTitle}>{props.fileStruct.title}</div>
            <img onClick={onClose} class={styles.FileCloseIcon} src={crossWhite} alt="" />
        </div>
    );
}

export  {File};