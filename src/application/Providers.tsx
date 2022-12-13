import { Component, createSignal, onMount } from 'solid-js';
import { Direction } from "../components/Panel/Panel";
import { EditorProvider, EditorStruct } from './EditorProvider';
import { LayerProvider, LayoutType, Layout } from './LayerProvider';
import services from "../infrastructure/services/index";
import { Tree, TreeProvider, TreeElement } from './TreeProvider';
import { AppProvider } from './AppProvider';

interface ProvidersProps {
  services: any;
  children: any;
}
export const Providers: Component<ProvidersProps> = (props) => {
  const [treeStore, setTreeStore] = createSignal<TreeElement>({
    name: "Workspace Folder",
        isOpen: true,
        path: "/",
        type: Tree.FOLDER,
        selected: false,
        children: []
  });
  let [editorStore, setEditorStore] = createSignal<EditorStruct[]>([]);
  let [layoutStore, setLayoutStore] = createSignal<Layout>({
    id: "root",
    type: LayoutType.PANEL,
    position: "100px",
    direction: Direction.NO_SPLIT,
    children: [],
  });
  return (
      <TreeProvider  services={services} store={treeStore()}>
        <EditorProvider services={services} store={editorStore()}>
          <LayerProvider services={services} store={layoutStore()}>
            <AppProvider services={services} store={null}>
              {props.children}
            </AppProvider>
          </LayerProvider>
        </EditorProvider>
      </TreeProvider>
  );
};