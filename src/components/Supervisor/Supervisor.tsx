import styles from './Supervisor.module.css';
import { batch, Component, createSignal } from "solid-js";
import { Editor, EditorStruct } from '../editor/Editor';
import { Direction, Panel } from "../Panel/Panel";
import { FileStruct } from '../File/File';
import { changeElementPosition } from '../../helpers/ToolsArray';
import { createStore, produce } from "solid-js/store";

const Supervisor: Component = () => {

    const [editors, setEditorsArray] = createStore<EditorStruct[]>([
        {
        "id": "0",
        "files": [
            {
                "title": "File 1",
                "content": "This is Files 1",
                "active": true
            },
            {
                "title": "File 2",
                "content": "This is Files 2",
                "active": false
            },
            {
                "title": "File 3",
                "content": "This is Files 3",
                "active": false
            }
        ]
    }, 
    {
        "id": "1",
        "files": [
            {
                "title": "File 4",
                "content": "This is Files 4",
                "active": true
            },
            {
                "title": "File 5",
                "content": "This is Files 5",
                "active": false
            },
            {
                "title": "File 6",
                "content": "This is Files 6",
                "active": false
            }
        ]
    }]);

    let [direction, setDirection] = createSignal<Direction>(Direction.HORIZONTAL);

    function getEditor(id: string): EditorStruct {
        return editors.filter((editor: EditorStruct) => editor.id === id)[0];
    }

    function closeFile(editorId: string, file: FileStruct){
        let fileIndex = -1;
        let editor = getEditor(editorId);
        fileIndex = editor.files.indexOf(file);
        if(fileIndex >= editor.files.length - 1) {
            fileIndex = editor.files.length - 2;
        }
        setEditorsArray(editor => editor.id === editorId, "files", (files: FileStruct[]) => files.filter(fs => fs.title !== file.title));
        setEditorsArray(editor => editor.id === editorId, "files", (fs: FileStruct, i: number) => i === fileIndex, "active", true);
        
    }

    function addFile(targetEditorId: string, file: FileStruct){
        setEditorsArray(editor => editor.id === targetEditorId, "files", fs => fs.active, "active", false);
        setEditorsArray(editor => editor.id === targetEditorId, "files", produce(files => {files.push({...file})}));
    }

    function getFile(fileName: string, editorId: string): FileStruct{
        return editors.filter(editor => editor.id === editorId)[0].files.filter((fs: FileStruct) => fs.title === fileName)[0];
    }


    function setFiles(editorId: string, files: FileStruct[]){
        batch(() => {
            files.forEach(file => {
                setEditorsArray(editor => editor.id === editorId, "files", (fs: FileStruct) => fs.title === file.title, file);
            });
        });
    }

    function onFileClose(editorId: string, file: FileStruct) {
        batch(() => {
            closeFile(editorId, file);
        });
    }

    function transferFile(fileName: string, sourceEditorId: string, targetEditorId: string) {
        let tempFile = getFile(fileName, sourceEditorId);
        tempFile.active = true;
        batch(() => {
            closeFile(sourceEditorId, tempFile);
            addFile(targetEditorId, tempFile);
        });
    }

    function changeFilePosition(sourceFileName: string, 
                                targetFileName: string, 
                                sourceEditorId: string, 
                                targetEditorId: string) {
        batch(() => {
            if(sourceEditorId === targetEditorId){
                let editor = getEditor(sourceEditorId);
                const sourceFile = getFile(sourceFileName, sourceEditorId);
                const targetFile = getFile(targetFileName, sourceEditorId);
                const sourceIndex = editor.files.indexOf(sourceFile);
                const targetIndex = editor.files.indexOf(targetFile);
                setEditorsArray(editor => editor.id === sourceEditorId, "files", changeElementPosition(editor.files, sourceIndex, targetIndex));
            }else {
                let targetEditor= getEditor(targetEditorId);
                const sourceFile = getFile(sourceFileName, sourceEditorId);
                const targetFile = getFile(targetFileName, targetEditorId);
                const targetIndex = targetEditor.files.indexOf(targetFile);
                closeFile(sourceEditorId, sourceFile);
                setEditorsArray(editor => editor.id === targetEditorId, "files", file => file.active, "active", false);
                setEditorsArray(editor => editor.id === targetEditorId, "files", produce(files => {files.push({...sourceFile})}));
                setEditorsArray(editor => editor.id === targetEditorId, "files", changeElementPosition(targetEditor.files, targetEditor.files.length - 1, targetIndex));
                
            }
        });
    }

    return (
        <div id={styles.Container}>
            <Panel direction={direction()}> 
                <Editor onFileChangePosition={changeFilePosition} onTansferFile={transferFile} onFileClose={onFileClose} onSetFile={setFiles} editorStructure={editors[0]}/>
                <Editor onFileChangePosition={changeFilePosition} onTansferFile={transferFile} onFileClose={onFileClose} onSetFile={setFiles} editorStructure={editors[1]}/>   
            </Panel>
        </div>
    );
};

export default Supervisor;

