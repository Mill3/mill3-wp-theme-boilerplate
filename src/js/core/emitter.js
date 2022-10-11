import EventEmitter2 from "eventemitter2";

const MILL3_EMITTER = new EventEmitter2({ wildcard: true });

// attach to window global thios Emitter
window._emitter = MILL3_EMITTER;

export default MILL3_EMITTER;
