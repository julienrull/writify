import styles from './Editor.module.css';
import { Accessor, Component, createSignal, For, onMount, createEffect } from 'solid-js';
import { File, FileStruct } from '../File/File';


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

interface EditorProps {
    editorStructure: EditorStruct;
    onSetFile: (editorId: string, files: FileStruct[]) => void;
    onFileClose: (editorId: string, files: FileStruct) => void;
    onTansferFile: (fileName: string, sourceEditorId: string, targetEditorId: string) => void;
    onFileChangePosition: (sourceFileName: string, targetFileName: string, sourceEditorId: string, targetEditorId: string) => void;
}


const Editor: Component<EditorProps> = (props) => {

    let filesContainer: HTMLDivElement = document.createElement('div');
    let activeFileContent: HTMLDivElement = document.createElement('div');
    let overlapElement: HTMLDivElement = document.createElement('div');

    const [filesHover, setFilesHover] = createSignal(false);

    let [overLayout, setOverLayout] = createSignal<OverLayout>({
        "OverlapContainer": false,
        "Left": false,
        "Right": false,
        "Top": false,
        "Bottom": false,
        "Full": false
    });

    onMount(()=> {
        let activeFile = getActiveFile(); 
        activeFileContent.innerHTML = activeFile ? activeFile.content : '';
    });

    createEffect(() => {
        let activeFile = getActiveFile(); 
        activeFileContent.innerHTML = activeFile ? activeFile.content : '';
    });

    function setFiles(filesStructs: FileStruct[]) {
        props.onSetFile(props.editorStructure.id, filesStructs);
    }

    function getActiveFile(): FileStruct {
        return props.editorStructure.files.filter((fs: FileStruct) => fs.active)[0];
    }

    const toggleStyle = function(e: MouseEvent) {
        e.preventDefault();
        let element : HTMLElement = e.currentTarget as HTMLElement;
        document.execCommand(element.id);
    }

    function onPaste(e: ClipboardEvent){
        e.preventDefault()
        var text = e.clipboardData?.getData('text/plain')
        document.execCommand('insertText', false, text)
    }

    function onWheel(e: WheelEvent){
        e.preventDefault();
        filesContainer != null ? filesContainer.scrollLeft += e.deltaY : filesContainer;
    }

    function switchFile(file: FileStruct){
        let activeFile = {...getActiveFile()};
        if(activeFile.title !== file.title){
            activeFile.content = activeFileContent.innerHTML;
            activeFile.active = false;
            file.active = true;
            activeFileContent.innerHTML = file.content;
            setFiles([activeFile, file]);
        }
    }

    function onFileClose(file: FileStruct) {
        props.onFileClose(props.editorStructure.id, file);
    }

    function onFileDragStart(e: DragEvent) {
        console.log("DRAG !");
        if(e.dataTransfer) {
            let data = JSON.parse(e.dataTransfer.getData("text/plain"));
            data = {...data, targetEditorId: props.editorStructure.id}
            e.dataTransfer.setData("text/plain", JSON.stringify(data));
        }
    }

    function onFileOver(e: DragEvent) {
        console.log("OVER !");
        let overlapRect = overlapElement.getBoundingClientRect();
        let positionX = e.pageX - overlapRect.left;
        let positionY = e.pageY - overlapRect.top;
        let division = 5;
        let state = {
            "OverlapContainer": true,
            "Left": false,
            "Right": false,
            "Top": false,
            "Bottom": false,
            "Full": false
        };
        if(positionX >= overlapRect.width / division &&  positionX <= (overlapRect.width / division) * (division - 1) && positionY >= overlapRect.height / division &&  positionY <= (overlapRect.height / division) * (division - 1)){
            state.Full = true;
        }else if(positionX >= overlapRect.width / division &&  positionX <= (overlapRect.width / division) * (division - 1) && positionY <= overlapRect.height / division) {
            state.Top = true;
        }else if(positionX >= overlapRect.width / division &&  positionX <= (overlapRect.width / division) * (division - 1) && positionY >= (overlapRect.height / division) * (division - 1)) {
            state.Bottom = true;
        }else if(positionX <= overlapRect.width / 2) {
            state.Left = true;
        }else {
            state.Right = true;
            console.log("Right");
        }
        setOverLayout((old: OverLayout) => {
            return {
                ...old,
                ...state
            }
        });
        
        e.preventDefault();
    }

    function onDragLeave(e: DragEvent){
        console.log("LEAVE !");
        if(overLayout().OverlapContainer){
            setOverLayout((old: OverLayout) => {
                return {
                    ...old,
                    ...{
                        "OverlapContainer": false,
                        "Left": false,
                        "Right": false,
                        "Top": false,
                        "Bottom": false,
                        "Full": false
                    }
                }
            });
        }
        e.preventDefault();
    }

    function onFileDrop(e: DragEvent) {
        console.log("DROP !");
        if (overLayout().Full) {
            if(e.dataTransfer){
                let data = JSON.parse(e.dataTransfer.getData("text/plain"));
                let editorId = data.targetEditorId;
                if(editorId !== props.editorStructure.id){
                    props.onTansferFile(data.sourceFileName, editorId, props.editorStructure.id);
                }
            }
        }
        setOverLayout((old: OverLayout) => {
            return {
                ...old,
                ...{
                    "OverlapContainer": false,
                    "Left": false,
                    "Right": false,
                    "Top": false,
                    "Bottom": false,
                    "Full": false
                }
            }
        });
        e.stopPropagation();
        e.preventDefault();
    }

    function onFileDragEnd(e: DragEvent){
        console.log("END !");
        setOverLayout((old: OverLayout) => {
            return {
                ...old,
                ...{
                    "OverlapContainer": false,
                    "Left": false,
                    "Right": false,
                    "Top": false,
                    "Bottom": false,
                    "Full": false
                }
            }
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
        if(e.dataTransfer){
            let data = JSON.parse(e.dataTransfer.getData("text/plain"))
            let sourceFileName = data.sourceFileName;
            let sourceEditorId = data.targetEditorId;
            let targetEditorId = props.editorStructure.id;
            if(sourceEditorId !== props.editorStructure.id){
                props.onTansferFile(sourceFileName, sourceEditorId, targetEditorId);
            }
        }
        e.preventDefault();
    }

    function onFilePositionChange(e: DragEvent, targetFileName: string) {
        if(e.dataTransfer){
            let data = JSON.parse(e.dataTransfer.getData("text/plain"));
            let sourceFileName = data.sourceFileName;
            let sourceEditorId = data.targetEditorId;
            let targetEditorId = props.editorStructure.id;
            props.onFileChangePosition ? props.onFileChangePosition(sourceFileName, targetFileName, sourceEditorId, targetEditorId) : undefined;
        }
    }

    return (
        <div onDragEnd={onFileDragEnd} class={styles.Container}>
            <div ref={filesContainer} onWheel={onWheel} classList={{[styles.Files]: true}}>
                <For each={props.editorStructure.files}>
                    {(item: FileStruct, index: Accessor<number>) => <File 
                        draggable={true} 
                        fileStruct={item} 
                        onFileDragStart={onFileDragStart} 
                        onFileClose={onFileClose} 
                        onFileMouseDown={switchFile}
                        onFileDrop = {onFilePositionChange}
                    />}
                </For>
                <div onDragOver={onFilesDragHover} onDrop={onFilesDragDrop} ondragleave={onFilesDragleave} classList={{[styles.FilesHover]: true, [styles.FilesHoverAvtive]: filesHover()}}></div>
            </div>
            <div ref={overlapElement} onDragOver={onFileOver} onDrop={onFileDrop} ondragleave={onDragLeave} classList={{[styles.OverlapContainer]: overLayout().OverlapContainer, [styles.Full]: overLayout().Full, [styles.Bottom]: overLayout().Bottom, [styles.Top]: overLayout().Top, [styles.Left]: overLayout().Left, [styles.Right]: overLayout().Right}}>
            </div>
            <div onDragOver={onFileOver} ref={activeFileContent} onPaste={onPaste} class={styles.Editor} contentEditable={true}></div>
        </div>
    );
}

export {Editor};