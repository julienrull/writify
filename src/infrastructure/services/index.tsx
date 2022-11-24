import EditorService from "./Editors/EditorService";
import LayoutService from "./Layouts/LayoutService";
const env = "development";

const services = {
  editorService: new EditorService(),
  layoutService: new LayoutService(),
};

export default services;
