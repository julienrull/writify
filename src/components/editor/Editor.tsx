import styles from './Editor.module.css';
import { Accessor, createSignal, For, onMount } from 'solid-js';
import {File, FileStruct} from '../File/File';





function Editor() {

    let filesContainer: HTMLDivElement = document.createElement('div');
    let activeFileContent: HTMLDivElement = document.createElement('div');

    const [files, setFiles] = createSignal<FileStruct[]>([
        {
            "title": "Rapport",
            "content": "Hello Zabio I'm a Rapport",
            "active": true
        },
        {
            "title": "Notes",
            "content": "Je suis une note",
            "active": false
        },
        {
            "title": "ZABI",
            "content": "ZABIIIIIIIII",
            "active": false
        }
    ]);

    onMount(()=> {
        activeFileContent.innerHTML = files().filter((fs: FileStruct) => fs.active)[0].content;
    });

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
        activeFileContent.innerHTML = file.content;
        setFiles((old: FileStruct[]) => {
        return old.map((fs: FileStruct) => {
                let fsCopied = {...fs};
                fsCopied.active = fsCopied.title === file.title;
                return fsCopied;
            });
        });
    }
    function onFileClose(file: FileStruct) {
        let wasActive = false;
        let oldIndex = -1;
        setFiles((old: FileStruct[]) => {
            return old.filter((fs: FileStruct, i: number) => {
                if (fs.title === file.title){
                    wasActive = fs.active;
                    oldIndex = i;
                } 
                return fs.title !== file.title;
            });
        });
        if(wasActive){
            setFiles((old: FileStruct[]) => {
                return old.map((fs: FileStruct, i: number) => {
                    if (i === oldIndex) {
                        fs.active = true;
                        activeFileContent.innerHTML = fs.content;
                    }else if(i === old.length - 1){
                        activeFileContent.innerHTML = fs.content;
                    }
                    return {...fs};
                });
            });
        }
    }


    return (
        <div class={styles.Container}>
            <div ref={filesContainer} onWheel={onWheel} class={styles.Files}>
                <For each={files()}>
                    {(item: FileStruct, index: Accessor<number>) => <File fileStruct={item} onFileClose={onFileClose} onFileClick={switchFile}/>}
                </For>
            </div>
            <div ref={activeFileContent} onPaste={onPaste} class={styles.Editor} contentEditable={true}></div>
        </div>

        
    );
}

export default Editor;