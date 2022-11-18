import styles from './Supervisor.module.css';
import { batch, Component, For, JSX } from "solid-js";
import { Editor, EditorStruct } from '../editor/Editor';
import { Direction, Panel } from "../Panel/Panel";
import { FileStruct } from '../File/File';
import { changeElementPosition } from '../../helpers/ToolsArray';
import { createStore, produce } from "solid-js/store";
import { generateRandomString } from '../../helpers/ToolsRandom';


enum LayoutType {
    EDITOR,
    PANEL
}

interface Layout {
    id: string;
    type: LayoutType;
    direction?: Direction;
    children?: Layout[];
}


const Supervisor: Component = () => {

    const [editors, setEditorsArray] = createStore<EditorStruct[]>([
        {
            "id": generateRandomString(5),
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
            "id": generateRandomString(5),
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
        }
    ]);

    const [layout, setLayout] = createStore<Layout>({
        id: "root",
        type: LayoutType.PANEL,
        direction: Direction.HORIZONTAL, // horizontal,
        children: [
            {id: editors[0].id, type: LayoutType.EDITOR},
            {id: editors[1].id, type: LayoutType.EDITOR}
        ]
    });

    function deleteEditorState(editorId: string) {
        setEditorsArray(editors.filter(editor => editor.id !== editorId));
    }

    function getLayoutPath(layoutState: Layout, layoutId: string): Layout[] {
        let path: Layout[] = [];
        if(layoutState.children) {
            let tempPath: Layout[] = [];
            layoutState.children.forEach((l : Layout) => {
                tempPath = [...tempPath, ...getLayoutPath(l, layoutId)]
            });
            if(tempPath.length > 0){
                path = [...path, layoutState, ...tempPath]
            }
        }
        if(layoutState.id === layoutId){
            path.push(layoutState);
        }
        return path;
    }



    function replaceLayout(targetLayoutId: string, replacementLayout: Layout){
        let path = getLayoutPath(layout, targetLayoutId);
        let replacePath: any = [];

        if(path.length > 1) {
            let replaceFunc = (layouts: any[]) => layouts.map((subLayout: any) => {
                let newLayout = subLayout;
                if(subLayout.id === targetLayoutId){
                    newLayout = replacementLayout;
                }
                return newLayout
            });
            path.forEach((elem: any, i: number) => {
                if(i === 0) {
                    replacePath = [...replacePath, "children"];
                }else if(i === path.length - 1){
                    if(i === 1){
                        replacePath = [...replacePath, replaceFunc];
                    }else {
                        replacePath = [...replacePath, "children", replaceFunc];
                    }
                }else{
                    if(i === 1){
                        replacePath = [...replacePath, (p: any) => p.id === elem.id];
                    }else {
                        replacePath = [...replacePath, "children", (p: any) => p.id === elem.id];
                    }
                }
            });
            console.log(path);
            console.log(replacePath);
            setLayout.apply(null, replacePath);
        }else {
            batch(() => {
                setLayout("children", [replacementLayout]);
                setLayout("direction", Direction.NO_SPLIT);
            });
        }
    }

    function deleteLayout(layoutId: string) {
        let path = getLayoutPath(layout, layoutId);
        console.log(path);
        //let deletePath: any = [];
        //let layoutIdTemp = layoutId;
        let parentPanel = path[path.length - 2];

        if(parentPanel.children && parentPanel.children.length === 2){
            let brotherLayout = parentPanel.children.filter(layout => layout.id !== layoutId)[0];
            replaceLayout(parentPanel.id, brotherLayout);

        }
        /*
         else{
            layoutIdTemp = parentPanel.id;
            path.pop();
            console.log(path);
            parentPanel = path[path.length - 2];
        }
        */
        /*
        let deleteFunc = (layouts: any[]) => layouts.filter((layout: any) => layout.id !== layoutIdTemp);


        path.forEach((elem: any, i: number) => {
            if(i === 0) {
                deletePath = [...deletePath, "children"];
            }else if(i === path.length - 1){
                if(i === 1){
                    deletePath = [...deletePath, deleteFunc];
                }else {
                    deletePath = [...deletePath, "children", deleteFunc];
                }
            }else{
                if(i === 1){
                    deletePath = [...deletePath, (p: any) => p.id === elem.id];
                }else {
                    deletePath = [...deletePath, "children", (p: any) => p.id === elem.id];
                }
            }
        });
        */
        //console.log(parentPanel.type);
        //setLayout.apply(null, deletePath);
        //return parentPanel.id; 
    }

    function setPanelDirection(panelId: string, direction: Direction) {
        let path = getLayoutPath(layout, panelId);
        let setterPath: any = [];
        
        console.log("panelId ID : " + panelId);
        console.log("PANEL PATH : " + path);
        path.forEach((elem: any, i: number) => {
            if(i === 0){
                if(i === path.length - 1){
                    setterPath = [...setterPath, "direction", direction];
                }else{
                    setterPath = [...setterPath, "children"];
                }
            }else if(i === path.length - 1){
                if(i === 1){
                    setterPath = [...setterPath, (p: any) => p.id === elem.id, "direction", direction];
                }else{
                    setterPath = [...setterPath, "children", (p: any) => p.id === elem.id, "direction", direction];
                }
            }else if(i !== path.length - 1){
                if(i === 1){
                    setterPath = [...setterPath, (p: any) => p.id === elem.id];
                }else{
                    setterPath = [...setterPath, "children", (p: any) => p.id === elem.id];
                }
            }
        });
        setLayout.apply(null, setterPath);
    }

    function deleteEditor(editorId: string) {
        let parentId = deleteLayout(editorId);
        //setPanelDirection(parentId, Direction.NO_SPLIT);
        deleteEditorState(editorId);
    }

    function addEditorState(newEditorId: string) {
        setEditorsArray(produce(editors => editors.push({
            id: newEditorId,
            files: []
        })));
    }

    function addEditorLayout(targetEditorId: string, newEditorId: string, position: string) {
        let path = getLayoutPath(layout, targetEditorId);
        let addPath: any = [];
        let targetEditorPanel = path[path.length - 2];
        let produceFunction = produce((editors:any) => {editors.push({id:newEditorId, type: LayoutType.EDITOR})});
        let direction = Direction.NO_SPLIT
        if(position === 'Left' || position === 'Right'){
            direction = Direction.HORIZONTAL;
        }else{
            direction = Direction.VERTICAL;
        }

        if(targetEditorPanel.children && targetEditorPanel.children.length === 1){
            if(position === 'Left' || position === 'Top'){
                produceFunction = produce((editors:any) => {editors.unshift({id:newEditorId, type: LayoutType.EDITOR})});
                console.log("1 children LEFT OR TOP");
            }
            setPanelDirection(targetEditorPanel.id, direction);
        }else {
            produceFunction = (editors:any) => editors.map((editor: any) => {
                let layer = editor; 
                if(editor.id === targetEditorId){
                    if(position === 'Left' || position === 'Top'){
                        layer = {id:generateRandomString(5), type: LayoutType.PANEL, direction: direction, children: [
                            {id: newEditorId, type: LayoutType.EDITOR},
                            {...editor}
                        ]};
                    }else {
                        layer = {id:generateRandomString(5), type: LayoutType.PANEL, direction: direction , children: [
                            {...editor},
                            {id: newEditorId, type: LayoutType.EDITOR}
                        ]};
                    }
                }
                return layer;
            }); 
        }
        path.forEach((elem: any, i: number) => {
            if(i === 0){
                if(i === path.length - 1){
                    addPath = [...addPath, "children", produceFunction]
                }else {
                    addPath = [...addPath, "children"];
                }
            }else if(i === path.length - 1){
                if(i === 1){
                    addPath = [...addPath, produceFunction];
                }else{
                    addPath = [...addPath, "children", produceFunction];
                }
            }else{
                if(i === 1){
                    addPath = [...addPath, (p: any) => p.id === elem.id];
                }else{
                    addPath = [...addPath, "children", (p: any) => p.id === elem.id];
                }
            }
        });
        console.log(path);
        console.log(targetEditorId);
        setLayout.apply(null, addPath);
    }

    function addEditor(targetEditorId: string, position: string): string{
        let newEditorId = generateRandomString(5);
        addEditorState(newEditorId);
        addEditorLayout(targetEditorId, newEditorId, position);
        return newEditorId;
    }

    function getEditor(id: string): EditorStruct {
        return editors.filter((editor: EditorStruct) => editor.id === id)[0];
    }

    function closeFile(editorId: string, file: FileStruct){
        let fileIndex = -1;
        let editor = getEditor(editorId);
        let fileRef = getFile(file.title, editorId);
        fileIndex = editor.files.indexOf(fileRef);
        if(fileIndex >= editor.files.length - 1) {
            fileIndex = editor.files.length - 2;
        }
        batch(() => {
            setEditorsArray(editor => editor.id === editorId, "files", (files: FileStruct[]) => files.filter(fs => fs.title !== file.title));
            if(file.active){
                console.log("wasActive");
                console.log(fileIndex);
                setEditorsArray(editor => editor.id === editorId, "files", (fs: FileStruct, i: number) => i === fileIndex, "active", true);
            }
        });
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
            closeFile(editorId, file);
            if(getEditor(editorId).files.length === 0){
                deleteEditor(editorId);
            }
    }

    function transferFile(fileName: string, sourceEditorId: string, targetEditorId: string, position: string) {
        let tempFile = {...getFile(fileName, sourceEditorId)};
        let finalTargetEditorId = targetEditorId;
        tempFile.active = true;
        console.log(position);
        if(position !== 'Full'){
            finalTargetEditorId = addEditor(targetEditorId, position);
        }
        batch(() => {
            closeFile(sourceEditorId, tempFile);
            addFile(finalTargetEditorId, tempFile);
        });
        if(getEditor(sourceEditorId).files.length === 0){
            deleteEditor(sourceEditorId);
        }
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
                batch(() => {
                    setEditorsArray(editor => editor.id === targetEditorId, "files", file => file.active, "active", false);
                    setEditorsArray(editor => editor.id === targetEditorId, "files", produce(files => {files.push({...sourceFile})}));
                    setEditorsArray(editor => editor.id === targetEditorId, "files", changeElementPosition(targetEditor.files, targetEditor.files.length - 1, targetIndex));
                });
            }
        });
    }
    function renderLayout(layout: Layout): JSX.Element[]  {
        let elements: JSX.Element[] = [];
        if(layout.type === LayoutType.PANEL && layout.children && layout.direction != undefined){
            layout.children.forEach((l: Layout) => {
                elements = [...elements, ...renderLayout(l)];
            });
            return [<Panel direction={layout.direction}>{
                elements.map(elem => elem)
            }</Panel>];
        }
        return [<Editor onFileChangePosition={changeFilePosition} onTansferFile={transferFile} onFileClose={onFileClose} onSetFile={setFiles} editorStructure={getEditor(layout.id)}/>];
    }

    return (
        <div id={styles.Container}>
                {renderLayout(layout).map((elem) => elem)}
        </div>
    );
};

export default Supervisor;

