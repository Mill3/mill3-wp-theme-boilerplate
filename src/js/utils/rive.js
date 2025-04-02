import { $, head } from "@utils/dom";

// Rive status
export const RIVE_STATUS = {
  NONE: "none",
  INIT: "init",
  LOADED: "loaded",
};

/**
 * Extract rive.wasm resource URL from <link rel="preload" as="fetch" href="rive.wasm" crossorigin="anonymous"> injected in <head>
 *
 * @returns string - The (rive.wasm resource URL)
 */
export const getRiveWASMLink = () => {
  const script = $('link[name="rive-wasm"]', head);
  return script ? script.href : null;
};
