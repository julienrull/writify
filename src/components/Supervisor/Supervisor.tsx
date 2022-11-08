import styles from './Supervisor.module.css';
import { Component, createSignal } from "solid-js";
import {Editor, EditorStruct} from '../editor/Editor';
import { Direction, Panel } from "../Panel/Panel";
import { FileStruct } from '../File/File';

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

    function setFiles(editorId: string, files: FileStruct[]){
        setEditorsArray((editors: EditorStruct[]) => {
            return [...editors.map((editor: EditorStruct) => {
                if(editor.id === editorId){
                    editor.files = editor.files.map((editorFile: FileStruct) => {
                        let newFile = editorFile;
                        files.forEach((file: FileStruct) => {
                            if(editorFile.title === file.title){
                                newFile = {...file};
                            }
                        });
                        return newFile;
                    });
                }
                return {...editor};
            })];
        });
    }
    return (
        <div id={styles.Container}>
            <Panel direction={direction()}> 
                <Editor onSetFile={setFiles} editorStructure={editors()[0]}/>
                <Editor onSetFile={setFiles} editorStructure={editors()[1]}/>   
            </Panel>
        </div>
    );
};

export default Supervisor;