import { createContext, useContext, Component } from "solid-js";
import { createStore } from "solid-js/store";

export interface TreeElement {
  name: string;
  type: Tree;
  selected: boolean;
  isOpen?: boolean;
  textContent?: string;
  children?: TreeElement[];
}
export enum Tree {
  FILE,
  FOLDER,
}



interface TreeProviderProps {
  store: TreeElement;
  services: any;
  children: any;
}

const TreeContext = createContext<any[]>();

export const TreeProvider: Component<TreeProviderProps> = (props) => {
  const [treeState, setTree] = createStore<TreeElement>(props.store);
  const tree = [
    treeState,
    {
      getTreePath: function(tr: TreeElement, name: string): TreeElement[] {
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

      setTreeElement: function(name: string, prop: string, value: any) {
        let path = this.getTreePath(treeState, name);
        let setPath: any = [];
        path.forEach((elem: any, i: number) => {
          if (i === 0) {
            if (i === path.length - 1) {
              setPath = [...setPath, prop, value];
            } else {
              setPath = [...setPath, "children"];
            }
          } else if (i === path.length - 1) {
            if (i === 1) {
              setPath = [
                ...setPath,
                (p: any) => p.name === elem.name,
                prop,
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
    },
  ];
  return (
    <TreeContext.Provider value={tree}>{props.children}</TreeContext.Provider>
  );
};

export function useTree() {
  return useContext(TreeContext) || [];
}
