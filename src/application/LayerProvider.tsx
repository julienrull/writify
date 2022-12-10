import {
  createContext,
  useContext,
  Component,
  batch,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import { Direction } from "../components/Panel/Panel";
import { generateRandomString } from "../helpers/ToolsRandom";
import { createEffect } from 'solid-js';

export enum LayoutType {
  EDITOR,
  PANEL,
}

export interface Layout {
  id: string;
  type: LayoutType;
  position?: string;
  direction?: Direction;
  children?: Layout[];
}

interface LayerProviderProps {
  store: Layout;
  services: any;
  children: any;
}

const LayerContext = createContext<any[]>();

export const LayerProvider: Component<LayerProviderProps> = (props) => {
  const [layouts, setLayout] = createStore<Layout>(props.store);
  createEffect(() => {
    props.services.layoutService.setLayout(layouts);
  });
  const layer = [
    layouts,
    {
      getLayoutPath(layout: Layout, layoutId: string): Layout[] {
        let path: Layout[] = [];
        if (layout.children) {
          let tempPath: Layout[] = [];
          layout.children.forEach((l: Layout) => {
            tempPath = [...tempPath, ...this.getLayoutPath(l, layoutId)];
          });
          if (tempPath.length > 0) {
            path = [...path, layout, ...tempPath];
          }
        }
        if (layout.id === layoutId) {
          path.push(layout);
        }
        return path;
      },
      replaceLayout(targetLayoutId: string, replacementLayout: Layout) {
        let path = this.getLayoutPath(layouts, targetLayoutId);
        let replacePath: any = [];
        console.log(path);
        if (path.length > 1) {
          let replaceFunc = (layouts: any[]) =>
            layouts.map((subLayout: any) => {
              let newLayout = subLayout;
              if (subLayout.id === targetLayoutId) {
                newLayout = replacementLayout;
              }
              return newLayout;
            });
          path.forEach((elem: any, i: number) => {
            if (i === 0) {
              replacePath = [...replacePath, "children"];
            } else if (i === path.length - 1) {
              if (i === 1) {
                replacePath = [...replacePath, replaceFunc];
              } else {
                replacePath = [...replacePath, "children", replaceFunc];
              }
            } else {
              if (i === 1) {
                replacePath = [...replacePath, (p: any) => p.id === elem.id];
              } else {
                replacePath = [
                  ...replacePath,
                  "children",
                  (p: any) => p.id === elem.id,
                ];
              }
            }
          });
          setLayout.apply(null, replacePath);
        } else {
          batch(() => {
            setLayout("children", [replacementLayout]);
            setLayout("direction", Direction.NO_SPLIT);
          });
        }
      },
      deleteLayout(layoutId: string) {
        let path = this.getLayoutPath(layouts, layoutId);
        let parentPanel = path[path.length - 2];
        console.log(parentPanel);
        if (parentPanel.children && parentPanel.children.length === 2) {
          console.log("JE PASSE !!!");
          let brotherLayout = parentPanel.children.filter(
            (layout) => layout.id !== layoutId
          )[0];
          this.replaceLayout(parentPanel.id, brotherLayout);
        }else {
          // Cas où il faut supprimer l'éditeur racine
          setLayout("children", []);
        }
      },
      setLayout(panelId: string, prop: string, value: any) {
        let path = this.getLayoutPath(layouts, panelId);
        let setterPath: any = [];
        path.forEach((elem: any, i: number) => {
          if (i === 0) {
            if (i === path.length - 1) {
              setterPath = [...setterPath, prop, value];
            } else {
              setterPath = [...setterPath, "children"];
            }
          } else if (i === path.length - 1) {
            if (i === 1) {
              setterPath = [
                ...setterPath,
                (p: any) => p.id === elem.id,
                prop,
                value,
              ];
            } else {
              setterPath = [
                ...setterPath,
                "children",
                (p: any) => p.id === elem.id,
                prop,
                value,
              ];
            }
          } else if (i !== path.length - 1) {
            if (i === 1) {
              setterPath = [...setterPath, (p: any) => p.id === elem.id];
            } else {
              setterPath = [
                ...setterPath,
                "children",
                (p: any) => p.id === elem.id,
              ];
            }
          }
        });
        setLayout.apply(null, setterPath);
      },
      setPanelDirection(panelId: string, direction: Direction) {
        let path = this.getLayoutPath(layouts, panelId);
        let setterPath: any = [];
        path.forEach((elem: any, i: number) => {
          if (i === 0) {
            if (i === path.length - 1) {
              setterPath = [...setterPath, "direction", direction];
            } else {
              setterPath = [...setterPath, "children"];
            }
          } else if (i === path.length - 1) {
            if (i === 1) {
              setterPath = [
                ...setterPath,
                (p: any) => p.id === elem.id,
                "direction",
                direction,
              ];
            } else {
              setterPath = [
                ...setterPath,
                "children",
                (p: any) => p.id === elem.id,
                "direction",
                direction,
              ];
            }
          } else if (i !== path.length - 1) {
            if (i === 1) {
              setterPath = [...setterPath, (p: any) => p.id === elem.id];
            } else {
              setterPath = [
                ...setterPath,
                "children",
                (p: any) => p.id === elem.id,
              ];
            }
          }
        });
        setLayout.apply(null, setterPath);
      },
      addEditorLayout(
        targetEditorId: string,
        newEditorId: string,
        position: string
      ) {
        let path = this.getLayoutPath(layouts, targetEditorId);
        let addPath: any = [];
        let targetEditorPanel = path[path.length - 2];
        console.log(targetEditorPanel)
        let produceFunction = produce((editors: any) => {
          editors.push({ id: newEditorId, type: LayoutType.EDITOR });
        });
        let direction = Direction.NO_SPLIT;
        if (position === "Left" || position === "Right") {
          direction = Direction.HORIZONTAL;
        } else {
          direction = Direction.VERTICAL;
        }

        if (
          targetEditorPanel.children &&
          targetEditorPanel.children.length === 1
        ) {
          if (position === "Left" || position === "Top") {
            produceFunction = produce((editors: any) => {
              editors.unshift({ id: newEditorId, type: LayoutType.EDITOR });
            });
          }
          this.setPanelDirection(targetEditorPanel.id, direction);
        } else {
          produceFunction = (editors: any) =>
            editors.map((editor: any) => {
              let layer = editor;
              if (editor.id === targetEditorId) {
                if (position === "Left" || position === "Top") {
                  layer = {
                    id: generateRandomString(5),
                    type: LayoutType.PANEL,
                    direction: direction,
                    children: [
                      { id: newEditorId, type: LayoutType.EDITOR },
                      { ...editor },
                    ],
                  };
                } else {
                  layer = {
                    id: generateRandomString(5),
                    type: LayoutType.PANEL,
                    direction: direction,
                    children: [
                      { ...editor },
                      { id: newEditorId, type: LayoutType.EDITOR },
                    ],
                  };
                }
              }
              return layer;
            });
        }
        path.forEach((elem: any, i: number) => {
          if (i === 0) {
            if (i === path.length - 1) {
              addPath = [...addPath, "children", produceFunction];
            } else {
              addPath = [...addPath, "children"];
            }
          } else if (i === path.length - 1) {
            if (i === 1) {
              addPath = [...addPath, produceFunction];
            } else {
              addPath = [...addPath, "children", produceFunction];
            }
          } else {
            if (i === 1) {
              addPath = [...addPath, (p: any) => p.id === elem.id];
            } else {
              addPath = [...addPath, "children", (p: any) => p.id === elem.id];
            }
          }  
        });
        setLayout.apply(null, addPath);
      },
      createRootEditor(
        newEditorId: string,
        position: string
      ) {
        setLayout("children", [
          { id: newEditorId, type: LayoutType.EDITOR }
        ]);
      },
    },
  ];

  return (
    <LayerContext.Provider value={layer}>
      {props.children}
    </LayerContext.Provider>
  );
};

export function useLayer() {
  return useContext(LayerContext) || [];
}
