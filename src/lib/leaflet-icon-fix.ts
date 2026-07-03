import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/** Bundlers break Leaflet's default marker asset URLs; point them at the bundled images. */
type IconDefaultWithPrivateUrl = typeof L.Icon.Default.prototype & {
  _getIconUrl?: unknown;
};

const iconDefaultProto = L.Icon.Default.prototype as IconDefaultWithPrivateUrl;
delete iconDefaultProto._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
