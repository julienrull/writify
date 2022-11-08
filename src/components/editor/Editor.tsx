import styles from './Editor.module.css';
import { Accessor, Component, createSignal, For, onMount } from 'solid-js';
import { File, FileStruct } from '../File/File';


export interface EditorStruct {
    id: string;
    files: FileStruct[];
}

interface EditorProps {
    editorStructure: EditorStruct;
    onSetFile: (editorId: string, files: FileStruct[]) => void;
}


const Editor: Component<EditorProps> = (props) => {

    let filesContainer: HTMLDivElement = document.createElement('div');
    let activeFileContent: HTMLDivElement = document.createElement('div');

    const [files, setFilesArray] = createSignal<FileStruct[]>(props.editorStructure.files);

    onMount(()=> {
        activeFileContent.innerHTML = files().filter((fs: FileStruct) => fs.active)[0].content;
    });

    function setFiles(files: FileStruct[]) {
        console.log("click");
        props.onSetFile(props.editorStructure.id, files);
        /*
        setFilesArray((old: FileStruct[]) => {
            return old.map((fs1: FileStruct) => {
                let newFs = fs1;
                files.forEach((fs2) => {
                    if(fs1.title === fs2.title){
                        newFs = {...fs1};
                    }
                });
                return newFs;
            });
        });
        */
    }

    function getActiveFile(): FileStruct {
        return files().filter((fs: FileStruct) => fs.active)[0];
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
        let activeFile = getActiveFile();
        if(activeFile.title !== file.title){
            activeFile.content = activeFileContent.innerHTML;
            activeFile.active = false;
            file.active = true;
            activeFileContent.innerHTML = file.content;
            setFiles([activeFile, file]);
        }
    }

    function onFileClose(file: FileStruct) {
        let wasActive = false;
        let oldIndex = -1;
        setFilesArray((old: FileStruct[]) => {
            return old.filter((fs: FileStruct, i: number) => {
                if (fs.title === file.title){
                    wasActive = fs.active;
                    oldIndex = i;
                } 
                return fs.title !== file.title;
            });
        });
        if(wasActive){
            setFilesArray((old: FileStruct[]) => {
                return old.map((fs: FileStruct, i: number) => {
                    if(oldIndex > old.length - 1){
                        if (i === old.length - 1) {
                            fs.active = true;
                            activeFileContent.innerHTML = fs.content;
                        }
                    }else{
                        if (i === oldIndex) {
                            fs.active = true;
                            activeFileContent.innerHTML = fs.content;
                        }
                    }
                    return {...fs};
                });
            });
            if(files().length === 0) {
                activeFileContent.innerHTML = '';
            }
        }
    }

    function onFileDrag(e: DragEvent) {
        console.log("drag function from editor");
        /*
        if(e.dataTransfer && e.currentTarget) {
            const el = e.currentTarget as HTMLInputElement
            e.dataTransfer.effectAllowed = "move"
            //e.dataTransfer.setData("sourceEditor", activeFileContent.id);
            e.dataTransfer.setData("title", files().title);
        }
        */
    }

    return (
        <div class={styles.Container}>
            <div ref={filesContainer} onWheel={onWheel} class={styles.Files}>
                <For each={files()}>
                    {(item: FileStruct, index: Accessor<number>) => <File 
                        draggable={true} 
                        fileStruct={item} 
                        onFileDrag={onFileDrag} 
                        onFileClose={onFileClose} 
                        onFileMouseDown={switchFile}
                    />}
                </For>
            </div>
            <div ref={activeFileContent} onPaste={onPaste} class={styles.Editor} contentEditable={true}></div>
        </div>
    );
}

export {Editor};