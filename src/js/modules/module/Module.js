class Module {
  init() {}

  // called during windmill's done event.
  start() {}

  // called during windmill's exiting event.
  stop() {}

  // called during windmill's exited event.
  destroy() {}

  // getter - setter
  get name() {
    return null;
  }
}

export default Module;
