import { EditorStruct } from "../../../application/EditorProvider";


export default class EditorService {
  private endpoint = "editors";
  public getEditors(): EditorStruct[] {
    const data = window.localStorage.getItem(this.endpoint);
    let res = null;
    if (data) {
      res = JSON.parse(data);
    }
    return res;
  }

  public setEditors(editors: EditorStruct[]): void {
    window.localStorage.setItem(this.endpoint, JSON.stringify(editors));
  }
}
