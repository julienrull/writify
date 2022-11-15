import styles from './Supervisor.module.css';
import { Component, createSignal } from "solid-js";
import {Editor, EditorStruct} from '../editor/Editor';
import { Direction, Panel } from "../Panel/Panel";
import { FileStruct } from '../File/File';
import { changeElementPosition } from '../../helpers/ToolsArray';

const Supervisor: Component = () => {

    const [editors, setEditorsArray] = createSignal<EditorStruct[]>([
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
        return editors().filter(editor => editor.id === id)[0];
    }
    function setEditor(editors: EditorStruct[], editor: EditorStruct): EditorStruct[] {
        let newEditors = editors.map((edit) => {
            let newEditor = edit;
            if(edit.id === editor.id){
                newEditor = {...editor}
            }
            return newEditor;
        });
        return newEditors;
    }

    function closeFile(old: EditorStruct[], editorId: string, file: FileStruct): EditorStruct[]{
        let editor: EditorStruct = old[parseInt(editorId)];
        let wasActive = false;
        let oldIndex = -1;
        editor.files = editor.files.filter((fs: FileStruct, i: number) => {
            if (fs.title === file.title){
                wasActive = fs.active;
                oldIndex = i;
            } 
            return fs.title !== file.title;
        });

        if(wasActive){
            editor.files = editor.files.map((fs: FileStruct, i: number) => {
                let newFile = fs;
                if(oldIndex > editor.files.length - 1){
                    if (i === editor.files.length - 1) {
                        fs.active = true;
                        newFile = {...fs};
                    }
                }else{
                    if (i === oldIndex) {
                        fs.active = true;
                        newFile = {...fs};
                    }
                }
                return newFile;
            });
        }
        old[parseInt(editorId)] = {...editor};
        return [...old];
    }

    function addFile(old: EditorStruct[], editorId: string, file: FileStruct): EditorStruct[]{
        let editor: EditorStruct = old[parseInt(editorId)];
        editor.files = editor.files.map((fs: FileStruct) => {
            let newFile = fs;
            if(fs.active){
                fs.active = false;
                newFile = {...fs};
            }
            return newFile;
        });
        file.active = true;
        editor.files.push(file);
        old[parseInt(editorId)] = {...editor};
        return [...old];
    }

    function getFile(fileName: string, editorId: string): FileStruct{
        return editors()[parseInt(editorId)].files.filter((fs: FileStruct) => fs.title === fileName)[0];
    }


    function setFiles(editorId: string, files: FileStruct[]){
        setEditorsArray((old: EditorStruct[]) => {
            let editor: EditorStruct = old[parseInt(editorId)];

            editor.files = editor.files.map((file: FileStruct) => {
                let newFile = file;
                files.forEach((fs: FileStruct) => {
                    if(file.title === fs.title) {
                        newFile = {...file, ...fs};
                    }
                });
                return newFile;
            });

            editor.files = [
                ...editor.files
            ];

            old[parseInt(editorId)] = {...editor};

            return [...old];
        });
    }

    function onFileClose(editorId: string, file: FileStruct) {
        setEditorsArray((old: EditorStruct[]) => {
            return closeFile(old, editorId, file);
        });
    }

    function transferFile(fileName: string, sourceEditorId: string, targetEditorId: string) {
        setEditorsArray((old: EditorStruct[]) => {
            let tempFile= getFile(fileName, sourceEditorId);
            console.log(sourceEditorId, targetEditorId)
            let newUpdateEditors = closeFile(old, sourceEditorId, tempFile);
            newUpdateEditors = addFile(newUpdateEditors, targetEditorId, tempFile);
            return newUpdateEditors;
        });
    }

    function changeFilePosition(sourceFileName: string, 
                                targetFileName: string, 
                                sourceEditorId: string, 
                                targetEditorId: string) {
        setEditorsArray((old: EditorStruct[]) => {
            let newEditors = old;
            if(sourceEditorId === targetEditorId){
                let editor = getEditor(sourceEditorId);
                const sourceFile = getFile(sourceFileName, sourceEditorId);
                const targetFile = getFile(targetFileName, sourceEditorId);
                const sourceIndex = editor.files.indexOf(sourceFile);
                const targetIndex = editor.files.indexOf(targetFile);
                //console.log(sourceFileName, targetFileName);
                //console.log(sourceFile, targetFile);
                //console.log(sourceIndex, targetIndex);
                editor.files = changeElementPosition(editor.files, sourceIndex, targetIndex);
                newEditors = setEditor(old, editor);
            }else{
                let targetEditor = getEditor(targetEditorId);
                const sourceFile = getFile(sourceFileName, sourceEditorId);
                const targetFile = getFile(targetFileName, targetEditorId);
                const targetIndex = targetEditor.files.indexOf(targetFile);
                newEditors = closeFile(old, sourceEditorId, sourceFile);
                targetEditor.files = targetEditor.files.map((file: FileStruct) => {
                    let newFile = file;
                    if(newFile.active){
                        file.active = false;
                        newFile = {...file};
                    }
                    return newFile;
                });
                targetEditor.files.push(sourceFile);
                targetEditor.files = changeElementPosition(targetEditor.files, targetEditor.files.length - 1, targetIndex);
                newEditors = setEditor(newEditors, targetEditor);
            }
            return newEditors;                                   
        });
    }

    return (
        <div id={styles.Container}>
            <Panel direction={direction()}> 
                <Editor onFileChangePosition={changeFilePosition} onTansferFile={transferFile} onFileClose={onFileClose} onSetFile={setFiles} editorStructure={editors()[0]}/>
                <Editor onFileChangePosition={changeFilePosition} onTansferFile={transferFile} onFileClose={onFileClose} onSetFile={setFiles} editorStructure={editors()[1]}/>   
            </Panel>
        </div>
    );
};

export default Supervisor;