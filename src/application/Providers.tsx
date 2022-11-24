import { Component } from "solid-js";
import { Direction } from "../components/Panel/Panel";
import { EditorProvider } from "./EditorProvider";
import { LayerProvider, LayoutType } from "./LayerProvider";
import services from "../infrastructure/services/index";

interface ProvidersProps {
  services: any;
  children: any;
}

export const Providers: Component<ProvidersProps> = (props) => {
  let editorStore = props.services.editorService.getEditors();
  if (!editorStore) {
    editorStore = [
      {
        id: "test1",
        files: [
          {
            title: "File 1",
            content: "This is File 1",
            active: true,
          },
          {
            title: "File 2",
            content: "This is File 2",
            active: false,
          },
          {
            title: "File 3",
            content: "This is File 3",
            active: false,
          },
        ],
      },
    ];
  }

  let layoutStore = props.services.layoutService.getLayout();
  if (!layoutStore) {
    layoutStore = {
      id: "root",
      type: LayoutType.PANEL,
      position: "100px",
      direction: Direction.NO_SPLIT,
      children: [{ id: "test1", type: LayoutType.EDITOR }],
    };
  }

  return (
    <>
      <EditorProvider services={services} store={editorStore}>
        <LayerProvider services={services} store={layoutStore}>
          {props.children}
        </LayerProvider>
      </EditorProvider>
    </>
  );
};
