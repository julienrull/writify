import {
  createContext,
  useContext,
  Component,
  createEffect,
  batch,
} from "solid-js";
import { createStore } from "solid-js/store";
import { FileStruct, useEditor, EditorStruct } from './EditorProvider';
import { useLayer } from "./LayerProvider";
import { useTree, TreeElement } from './TreeProvider';

type TreeElementProps =
  | "name"
  | "type"
  | "selected"
  | "isOpen"
  | "textContent"
  | "children";

export enum Tree {
  FILE,
  FOLDER,
}

export interface AppController {
  closeFile(editorId: string, fileTabName: string): void;
  switchFile(editorId: string, fileTabName: string): void;
  changeFilePosition(
    sourceFileName: string,
    targetFileName: string,
    sourceEditorId: string,
    targetEditorId: string
  ): void;
  changeEditorContent(editorId: string, content: string): void;
  transferFile(
    fileName: string,
    sourceEditorId: string,
    sourceEditorContent: string,
    targetEditorId: string,
    position: string
  ): void;
  saveFile(editorId: string): void;
  injectTreeFile(element: TreeElement): void;
  activateTreeFolder(element: TreeElement):void;
  delete(treeElementName: string): void;
}

interface AppProviderProps {
  store: any;
  services: any;
  children: any;
}

const AppContext = createContext<any[]>();

export const AppProvider: Component<AppProviderProps> = (props) => {
  const [appState, setAppState] = createStore<any>(props.store);
  const [editorsStates, editorController] = useEditor();
  const [, layoutController] = useLayer();
  const [, treeController] = useTree();

  let controller: AppController = {
    closeFile(editorId: string, fileTabName: string): void {
      // * Qu'est ce qu'implique fermer un onglet ? * //
      // * On supprime le fichier de l'éditeur
      editorController.closeFile(editorId, fileTabName);
      let editor = editorController.getEditor(editorId);
      if (editor.files.length === 0) {
        // * Si l'éditeur du fichier fermé n'a plus de fichiers ouverts
        // * Alors on supprime le layout et l'état de l'éditeur
        layoutController.deleteLayout(editor.id);
        editorController.deleteEditor(editor.id);
        let activeEditor = editorController.getActivatedEditor();
        if (activeEditor) {
          // * S'il y a un éditeur actif/ouvert après suppression
          // * Alors on met à jour l'arbre avec le fichier actif du nouvel éditeur actif
          let activeFile = editorController.getActiveFile(
            editorController.getActivatedEditor().id
          );
          treeController.setActivatedTreeElement(activeFile.title);
        } else {
          // * S'il n'y a pas un éditeur actif/ouvert après suppression
          // * Alors on désactive l'element actif dans l'arbre
          let activeTreeElement = treeController.getActivatedElement();
          if (activeTreeElement) {
            treeController.setTreeElement(
              activeTreeElement.name,
              "selected",
              false
            );
          }
        }
      } else {
        // * Si l'éditeur du fichier fermé a encore des fichiers ouverts
        // * Alors on active dans l'abre le nouveau fichier actif dans l'éditeur
        let activeFile = editorController.getActiveFile(editor.id);
        treeController.setActivatedTreeElement(activeFile.title);
      }
    },
    switchFile(editorId: string, fileTabName: string): void {
      let clickedFile = editorController.getFile(editorId, fileTabName);
      let clickedFileEditor = editorController.getEditor(editorId);
      editorController.switchFile(editorId, clickedFile);
      if (!clickedFileEditor.active) {
        editorController.setActivatedEditor(clickedFileEditor.id);
      }
      treeController.setActivatedTreeElement(clickedFile.title);
    },
    changeFilePosition(
      sourceFileName: string,
      targetFileName: string,
      sourceEditorId: string,
      targetEditorId: string
    ): void {
        editorController.transferFilePosition(sourceFileName, targetFileName, sourceEditorId, targetEditorId);
        let sourceEditor = editorController.getEditor(sourceEditorId);
        if(sourceEditor.files.length === 0) {
            layoutController.deleteLayout(sourceEditorId);
            editorController.deleteEditor(sourceEditorId);
        }
    },
    changeEditorContent(editorId: string, content: string): void {
      let activeFile = {
        ...editorController.getActiveFile(editorId),
      };
      activeFile.content = content;
      activeFile.saved = false;
      editorController.setFile(editorId, activeFile);
    },
    transferFile(
      fileName: string,
      sourceEditorId: string,
      sourceEditorContent: string,
      targetEditorId: string,
      position: string
    ): void {
      let tempFile = { ...editorController.getFile(sourceEditorId, fileName) };
      let finalTargetEditorId = targetEditorId;
      tempFile.active = true;
      if (position !== "Full") {
        finalTargetEditorId = editorController.createEditor();
        layoutController.addEditorLayout(
          targetEditorId,
          finalTargetEditorId,
          position
        );
      }
      editorController.transferFile(
        fileName,
        sourceEditorId,
        finalTargetEditorId,
        sourceEditorContent
      );
      editorController.setActivatedEditor(finalTargetEditorId);
      if (editorController.getEditor(sourceEditorId).files.length === 0) {
        layoutController.deleteLayout(sourceEditorId);
        editorController.deleteEditor(sourceEditorId);
      }
    },
    saveFile(editorId: string): void {
      let editor: EditorStruct = editorController.getEditor(editorId);
      if (editor.active) {
        let activeFile = {
          ...editorController.getActiveFile(editor.id),
        };
        if (!activeFile.saved) {
          activeFile.saved = true;
          editorController.setFile(editor.id, activeFile);
        }
        treeController.save(activeFile);
      }
    },
    injectTreeFile(element: TreeElement): void {
      treeController.setActivatedTreeElement(element.name);
      if(editorsStates.length === 0){
        let editorId = editorController.createEditor();
        layoutController.createRootEditor(
          editorId,
          "Full"
        )
      }
      editorController.inject(element);
    },
    activateTreeFolder(element: TreeElement):void {
      batch(() => {
        treeController.setActivatedTreeElement(element.name);
        treeController.setTreeElement(
          element.name,
          "isOpen",
          !element.isOpen
        );
      });
    },
    delete(treeElementName: string): void{
      // * If it's a file, close it
      editorsStates.forEach((editor: EditorStruct) => {
        editor.files.forEach((file: FileStruct) => {
          if(file.title === treeElementName){
            this.closeFile(editor.id, file.title);
          }
        });
      });
      // * Delete tree element
      // * For a file
      
    }
  };
  const app: [any, AppController] = [appState, controller];
  return (
    <AppContext.Provider value={app}>{props.children}</AppContext.Provider>
  );
};

export function useApp() {
  return useContext(AppContext) || [];
}
