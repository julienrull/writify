import { Layout } from "../../../application/LayerProvider";
import { TreeElement } from '../../../application/TreeProvider';

export default class TreeService {
  private endpoint = "tree";
  public getTree(): TreeElement | null {
    const data = window.localStorage.getItem(this.endpoint);
    let res = null;
    if(data){
      res = JSON.parse(data);
    }
    return res;
  }
  public setTree(tree: TreeElement): void {
    window.localStorage.setItem(this.endpoint, JSON.stringify(tree));
  }
}
