import { createContext, useContext, Component, createEffect, batch } from 'solid-js';
import { createStore } from "solid-js/store";
import { FileStruct } from "./EditorProvider";

export interface TreeElement {
  name: string;
  type: Tree;
  selected: boolean;
  isOpen?: boolean;
  textContent?: string;
  children?: TreeElement[];
}

type TreeElementProps = "name" | "type" | "selected" | "isOpen" | "textContent" | "children";

export enum Tree {
  FILE,
  FOLDER,
}

export interface TreeController {
  getActivatedElement(): TreeElement | undefined;
  setActivatedTreeElement(elementName: string): void;
  getTreePath(tr: TreeElement, name: string): TreeElement[];
  save(file: FileStruct): void;
  getTreeElementsPath(tr: TreeElement, prop: string, value: any): TreeElement[];
  setTreeElement(name: string, prop: string, value: any): void;
}

interface TreeProviderProps {
  store: TreeElement;
  services: any;
  children: any;
}

const TreeContext = createContext<any[]>();

export const TreeProvider: Component<TreeProviderProps> = (props) => {
  const [treeState, setTree] = createStore<TreeElement>(props.store);
  let controller: TreeController = {
    getActivatedElement: function (): TreeElement | undefined {
      let path = this.getTreeElementsPath(treeState, "selected", true)
      return path[path.length - 1];
    },
    setActivatedTreeElement: function (elementName: string): void {
      let activatedElement = this.getActivatedElement();
      batch(() => {
        if(activatedElement){
          this.setTreeElement(activatedElement.name, "selected", false);
        }
        this.setTreeElement(elementName, "selected", true);
      });
    },
    getTreePath: function (tr: TreeElement, name: string): TreeElement[] {
      let path: TreeElement[] = [];
      if (tr.children) {
        let tempPath: TreeElement[] = [];
        tr.children.forEach((t: TreeElement) => {
          tempPath = [...tempPath, ...this.getTreePath(t, name)];
        });
        if (tempPath.length > 0) {
          path = [...path, tr, ...tempPath];
        }
      }
      if (tr.name === name) {
        path.push(tr);
      }
      return path;
    },
    save: function (file: FileStruct) {
      this.setTreeElement(file.title, "textContent", file.content);
      props.services.treeService.setTree(treeState);
    },
    getTreeElementsPath: function (tr: TreeElement, prop: TreeElementProps, value: any): TreeElement[] {
      let path: TreeElement[] = [];
      if (tr.children) {
        let tempPath: TreeElement[] = [];
        tr.children.forEach((t: TreeElement) => {
          tempPath = [...tempPath, ...this.getTreeElementsPath(t, prop, value)];
        });
        if (tempPath.length > 0) {
          path = [...path, tr, ...tempPath];
        }
      }
      let p: any = tr[prop];
      if (p === value) {
        path.push(tr);
      }
      return path;
    },
    setTreeElement: function (name: string, prop: string, value: any) {
      let path = this.getTreePath(treeState, name);
      let setPath: any = [];
      path.forEach((elem: any, i: number) => {
        if (i === 0) {
          if (i === path.length - 1) {
            if (prop === "") {
              setPath = [...setPath, value];
            } else {
              setPath = [...setPath, prop, value];
            }
          } else {
            setPath = [...setPath, "children"];
          }
        } else if (i === path.length - 1) {
          if (i === 1) {
            if (prop === "") {
              setPath = [...setPath, (p: any) => p.name === elem.name, value];
            } else {
              setPath = [
                ...setPath,
                (p: any) => p.name === elem.name,
                prop,
                value,
              ];
            }
          } else {
            if (prop === "") {
              setPath = [
                ...setPath,
                "children",
                (p: any) => p.name === elem.name,
                value,
              ];
            } else {
              setPath = [
                ...setPath,
                "children",
                (p: any) => p.name === elem.name,
                prop,
                value,
              ];
            }
          }
        } else if (i !== path.length - 1) {
          if (i === 1) {
            setPath = [...setPath, (p: any) => p.name === elem.name];
          } else {
            setPath = [
              ...setPath,
              "children",
              (p: any) => p.name === elem.name,
            ];
          }
        }
      });
      setTree.apply(null, setPath);
    },
  };
  const tree: [TreeElement, TreeController] = [treeState, controller];
  return (
    <TreeContext.Provider value={tree}>{props.children}</TreeContext.Provider>
  );
};

export function useTree() {
  return useContext(TreeContext) || [];
}
