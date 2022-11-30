import {
  Component,
  createContext,
  batch,
  useContext,
  createEffect,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import { changeElementPosition } from "../helpers/ToolsArray";
import { generateRandomString } from "../helpers/ToolsRandom";
import { TreeElement } from "./TreeProvider";

export interface FileStruct {
  title: string;
  content: string;
  active: boolean;
  saved: boolean;
}

export interface EditorStruct {
  id: string;
  files: FileStruct[];
}

interface EditorProviderProps {
  store: EditorStruct[];
  services: any;
  children: any;
}

const editorContext = createContext<any[]>();

export const EditorProvider: Component<EditorProviderProps> = (props) => {
  const [editors, setEditors] = createStore<EditorStruct[]>(props.store);
  createEffect(() => {
    props.services.editorService.setEditors(editors);
  });
  const editor = [
    editors,
    {
      //* EDITOR
      inject(file: TreeElement): void{
        let fileStruct: FileStruct = {
          title: file.name,
          content: file.textContent ? file.textContent : "",
          active: false,
          saved: true
        };
        let isFileOpen = false;
        editors.forEach((editor: EditorStruct) => {
          let fs  = this.getFile(editor.id, file.name);
          if(fs){
            isFileOpen = true;
            this.switchFile(editor.id, fs);
          }
        });
        if(!isFileOpen){
          this.addFile(editors[0].id, fileStruct);
          this.switchFile(editors[0].id, fileStruct);
        }
      },
      deleteEditor(editorId: string): void {
        setEditors(editors.filter((editor) => editor.id !== editorId));
      },
      createEditor(): string {
        const newEditorId = generateRandomString(5);
        setEditors(
          produce((editors) =>
            editors.push({
              id: newEditorId,
              files: [],
            })
          )
        );
        return newEditorId;
      },
      getEditor(editorId: string): EditorStruct {
        return editors.filter(
          (editor: EditorStruct) => editor.id === editorId
        )[0];
      },
      setEditor(editor: EditorStruct): void {
        setEditors((subEditor) => subEditor.id === editor.id, editor);
      },

      //* FILE
      closeFile(editorId: string, fileName: string): void {
        let fileIndex = -1;
        let editor = this.getEditor(editorId);
        let file = this.getFile(editorId, fileName);
        fileIndex = editor.files.indexOf(file);
        if (fileIndex >= editor.files.length - 1) {
          fileIndex = editor.files.length - 2;
        }
        batch(() => {
          setEditors(
            (editor: EditorStruct) => editor.id === editorId,
            "files",
            (files: FileStruct[]) =>
              files.filter((file) => file.title !== fileName)
          );
          if (file.active) {
            console.log("wasActive");
            console.log(fileIndex);
            setEditors(
              (editor) => editor.id === editorId,
              "files",
              (subFile: FileStruct, i: number) => i === fileIndex,
              "active",
              true
            );
          }
        });
      },
      addFile(editorId: string, file: FileStruct): string {
        batch(() => {
          setEditors(
            (editor) => editor.id === editorId,
            "files",
            (fs) => fs.active,
            "active",
            false
          );
          setEditors(
            (editor) => editor.id === editorId,
            "files",
            produce((files) => {
              files.push({ ...file });
            })
          );
        });
        return file.title;
      },
      getFile(editorId: string, fileName: string): FileStruct {
        return editors
          .filter((editor) => editor.id === editorId)[0]
          .files.filter((fs: FileStruct) => fs.title === fileName)[0];
      },
      setFile(editorId: string, file: FileStruct) {
        setEditors(
          (editor) => editor.id === editorId,
          "files",
          (fs: FileStruct) => fs.title === file.title,
          file
        );
      },
      setFiles(editorId: string, files: FileStruct[]) {
        batch(() => {
          files.forEach((file) => {
            this.setFile(editorId, file);
          });
        });
      },
      getActiveFile(editorId: string): FileStruct {
        return this.getEditor(editorId).files.filter(
          (fs: FileStruct) => fs.active
        )[0];
      },
      switchFile(editorId: string, file: FileStruct) {
        let activeFile = { ...this.getActiveFile(editorId) };
        let newActiveFile = { ...file };
        if (activeFile.title !== file.title) {
          activeFile.active = false;
          newActiveFile.active = true;
          this.setFiles(editorId, [activeFile, newActiveFile]);
        }
      },
      transferFile(
        fileName: string,
        sourceEditorId: string,
        targetEditorId: string
      ) {
        let tempFile = { ...this.getFile(sourceEditorId, fileName) };
        let finalTargetEditorId = targetEditorId;
        tempFile.active = true;
        batch(() => {
          this.closeFile(sourceEditorId, tempFile.title);
          this.addFile(finalTargetEditorId, tempFile);
        });
      },
      transferFilePosition(
        sourceFileName: string,
        targetFileName: string,
        sourceEditorId: string,
        targetEditorId: string
      ) {
        batch(() => {
          console.log("CHANGE ENTER");
          if (sourceEditorId === targetEditorId) {
            let editor = this.getEditor(sourceEditorId);
            const sourceFile = this.getFile(sourceEditorId, sourceFileName);
            const targetFile = this.getFile(sourceEditorId, targetFileName);
            const sourceIndex = editor.files.indexOf(sourceFile);
            const targetIndex = editor.files.indexOf(targetFile);
            setEditors(
              (editor) => editor.id === sourceEditorId,
              "files",
              changeElementPosition(editor.files, sourceIndex, targetIndex)
            );
          } else {
            console.log("CHANGE DIFF EDITORS");
            let targetEditor = this.getEditor(targetEditorId);
            const sourceFile = this.getFile(sourceEditorId, sourceFileName);
            const targetFile = this.getFile(targetEditorId, targetFileName);
            const targetIndex = targetEditor.files.indexOf(targetFile);
            this.closeFile(sourceEditorId, sourceFile.title);
            setEditors(
              (editor) => editor.id === targetEditorId,
              "files",
              (file) => file.active,
              "active",
              false
            );
            setEditors(
              (editor) => editor.id === targetEditorId,
              "files",
              produce((files) => {
                files.push({ ...sourceFile });
              })
            );
            setEditors(
              (editor) => editor.id === targetEditorId,
              "files",
              changeElementPosition(
                targetEditor.files,
                targetEditor.files.length - 1,
                targetIndex
              )
            );
          }
        });
        if (this.getEditor(sourceEditorId).files.length === 0) {
          this.deleteEditor(sourceEditorId);
        }
      },
    },
  ];

  return (
    <editorContext.Provider value={editor}>
      {props.children}
    </editorContext.Provider>
  );
};

export function useEditor() {
  return useContext(editorContext) || [];
}
