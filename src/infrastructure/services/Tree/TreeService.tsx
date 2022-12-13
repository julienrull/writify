import { text } from "stream/consumers";
import { Layout } from "../../../application/LayerProvider";
import { Tree, TreeElement } from '../../../application/TreeProvider';
// * Electron

export default class TreeService {
  private endpoint = "tree";


  private async writeFolderFiles(treeElements: TreeElement[]): Promise<void> {
    treeElements.forEach((treeElement: TreeElement) => {
      // @ts-ignore: Unreachable code error
      //await window.versions.writeFolderFiles(treeElement.name, treeElement.textContent);
    });
  }
  private async readFolderFiles(): Promise<TreeElement | null> {
    // @ts-ignore: Unreachable code error
    const data = await window.versions.loadFolderFiles();
    let treeElement: TreeElement = {
      name: "WorkspaceName",
      path: "/WorkspaceName",
      type: Tree.FOLDER,
      selected: false,
      isOpen: true,
      children: [],
    }; 
    treeElement.children?.push(
      {
        name: data.name,
        path: treeElement.path + "/" + treeElement.name,
        type: Tree.FILE,
        selected: false,
        textContent: data.content,
      }
    );
    return treeElement;
  }

  private isElectron() {
    // Renderer process
    // @ts-ignore: Unreachable code error
    if (window.versions && window.versions.electron) {
        return true;
    }

    return false;
}

  public async getTree(): Promise<TreeElement | null> {
    console.log("IS ELECTRON RUNNING ?");
    let res = null;
    if(this.isElectron()){
      console.log("YES");
      res = this.readFolderFiles();
    }else {
      console.log("NO");
      const data = window.localStorage.getItem(this.endpoint);
      if(data){
        res = JSON.parse(data);
      }
    }
    return res;
  }
  public setTree(tree: TreeElement): void {
    console.log("tree Storage save")
    window.localStorage.setItem(this.endpoint, JSON.stringify(tree));
  }
}
