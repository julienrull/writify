import { Layout } from "../../../application/LayerProvider";

export default class LayoutService {
  private endpoint = "layout";
  public getLayout(): Layout | null {
    const data = window.localStorage.getItem(this.endpoint);
    let res = null;
    if(data){
      res = JSON.parse(data);
    }
    return res;
  }
  public setLayout(layout: Layout): void {
    window.localStorage.setItem(this.endpoint, JSON.stringify(layout));
  }
}
