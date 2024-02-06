import Property from "./Property";
import Srcset from "./Srcset";

class LayerData {
  constructor( title ) {
    this.title = title;
    this.assets = new Srcset();
    this.width = new Property();
    this.height = new Property();
    this.x = new Property();
    this.y = new Property();
  }
}

export default LayerData;
