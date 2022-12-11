import { Component } from "solid-js";
import { Direction } from "../components/Panel/Panel";
import { EditorProvider } from "./EditorProvider";
import { LayerProvider, LayoutType } from "./LayerProvider";
import services from "../infrastructure/services/index";
import { Tree, TreeProvider } from "./TreeProvider";
import { AppProvider } from './AppProvider';

interface ProvidersProps {
  services: any;
  children: any;
}

export const Providers: Component<ProvidersProps> = (props) => {

  let treeStore = props.services.treeService.getTree();

  if (!treeStore) {
    treeStore = {
      name: "Workspace Folder",
      isOpen: true,
      type: Tree.FOLDER,
      selected: false,
      children: [
        {
          name: "Folder 1",
          isOpen: true,
          type: Tree.FOLDER,
          selected: false,
          children: [
            {
              name: "File 1",
              type: Tree.FILE,
              selected: false,
              textContent: "This is file 1",
            },
            {
              name: "File 2",
              type: Tree.FILE,
              selected: false,
              textContent: "This is file 2",
            },
            {
              name: "File 3",
              type: Tree.FILE,
              selected: false,
              textContent: "This is file 3",
            },
          ],
        },
      ],
    }
  }

  let editorStore = props.services.editorService.getEditors();
  if (!editorStore) {
    editorStore = [];
  }

  let layoutStore = props.services.layoutService.getLayout();
  if (!layoutStore) {
    layoutStore = {
      id: "root",
      type: LayoutType.PANEL,
      position: "100px",
      direction: Direction.NO_SPLIT,
      children: [],
    };
  }
  return (
      <TreeProvider  services={services} store={treeStore}>
        <EditorProvider services={services} store={editorStore}>
          <LayerProvider services={services} store={layoutStore}>
            <AppProvider services={services} store={null}>
              {props.children}
            </AppProvider>
          </LayerProvider>
        </EditorProvider>
      </TreeProvider>
  );
};