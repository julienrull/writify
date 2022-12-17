import { Tree, TreeElement } from "../../../application/TreeProvider";

export default class TreeService {
  private endpoint = "tree";

  public async deleteFolderOrFile(
    treeElement: TreeElement
  ): Promise<void> {
    // @ts-ignore: Unreachable code error
    await window.versions.deleteFolderOrFile(
      treeElement.name,
      treeElement.type === Tree.FOLDER ? "FOLDER" : "FILE",
      treeElement.path
    );
  }

  public async renameFolderOrFile(
    oldName: string,
    newName: string,
    path: string
  ): Promise<void> {
    // @ts-ignore: Unreachable code error

    await window.versions.renameFolderOrFile(
      oldName,
      newName,
      path
    );

  }

  public async saveFolderFiles(treeElements: TreeElement[]): Promise<void> {
    if (this.isElectron()) {
      treeElements.forEach(async (treeElement: TreeElement) => {
        // @ts-ignore: Unreachable code error
        await window.versions.saveFolderFiles(
          treeElement.name,
          treeElement.textContent,
          treeElement.path,
          treeElement.type === Tree.FOLDER ? "FOLDER" : "FILE"
        );
      });
    }
  }

  private electronTreeToAppTree(electronTree: any, path: string): TreeElement {
    let tree: TreeElement = {
      name: electronTree.name,
      path: path,
      type: Tree.FILE,
      selected: false,
      isOpen: false,
      children: [],
    };
    if(electronTree.type === "FOLDER"){
      tree.type = Tree.FOLDER
      electronTree.children.forEach((elem: any) => {
        if(tree.children) {
          tree.children = [...tree.children, this.electronTreeToAppTree(elem, path + "/" + electronTree.name)];
        }
      });
    }else {
      tree.textContent = electronTree.content;
    }
    return tree;
  }

  public async loadWorkspaceTree(path: string): Promise<TreeElement | null> {
    // @ts-ignore: Unreachable code error
    const treeData = await window.versions.loadFolderFiles(path);

    console.log(treeData);

    let treeElement: TreeElement = this.electronTreeToAppTree(treeData, "/");
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
    if (this.isElectron()) {
      console.log("YES");
      res = this.loadWorkspaceTree('C:\\Users\\julie\\Desktop\\writifyWorkspace');
    } else {
      console.log("NO");
      const data = window.localStorage.getItem(this.endpoint);
      if (data) {
        res = JSON.parse(data);
      }
    }
    return res;
  }
  public setTree(tree: TreeElement): void {
    console.log("tree Storage save");
    window.localStorage.setItem(this.endpoint, JSON.stringify(tree));
  }
}
