import loadGoogleMapsApi from "load-google-maps-api";

const API_KEY = "XXXXXX";
const DEFAULT_OPTIONS = {
  zoom: 16,
  markers: null
};

let GMAP = null;

class GoogleMap {
  constructor(el) {
    this.el = el;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...(JSON.parse(this.el.dataset.googleMap) || {})
    };

    this._initialized = false;
  }

  init() {
    this._initialized = true;

    loadGoogleMapsApi({
      key: API_KEY,
      language: "fr-CA",
      region: "CA"
    }).then(this._onGoogleMapsApiLoaded.bind(this));
  }
  destroy() {
    this.el = null;
    this.options = null;

    this._initialized = null;
  }

  addMarker(lat, lng) {
    const { map } = this;
    if (!map) return;

    const position = { lat: parseFloat(lat), lng: parseFloat(lng) };

    // Create marker instance.
    const marker = new GMAP.Marker({ position, map });

    // Append to reference for later use.
    map.markers.push(marker);
  }
  center() {
    const { map } = this;
    if (!map) return;

    // Create map boundaries from all map markers.
    const bounds = new GMAP.LatLngBounds();

    map.markers.forEach(marker => {
      bounds.extend({
        lat: marker.position.lat(),
        lng: marker.position.lng()
      });
    });

    // if there is only one marker on map, center map to this single marker
    if (map.markers.length == 1) map.setCenter(bounds.getCenter());
    else map.fitBounds(bounds);
  }

  _onGoogleMapsApiLoaded(googleMaps) {
    // save library ref
    GMAP = googleMaps;

    // if module was destroyed before promise return, skip here
    if (!this._initialized) return;

    //const options = {
    //  mapTypeId: GMAP.MapTypeId.ROADMAP,
    //};

    // create map
    this.map = new GMAP.Map(this.el, this.options);

    // add markers
    this.options?.markers.forEach(({ lat, lng }) => this.addMarker(lat, lng));

    // center map around markers
    this.center();
  }
}

export default GoogleMap;
