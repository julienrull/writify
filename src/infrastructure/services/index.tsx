import EditorService from "./Editors/EditorService";
import LayoutService from "./Layouts/LayoutService";
import TreeService from "./Tree/TreeService";
const env = "development";

const services = {
  treeService: new TreeService(),
  editorService: new EditorService(),
  layoutService: new LayoutService(),
};

export default services;
