class Module {
  init() {}

  // called during Barba's afterEnter hook.
  start() {}

  // called during Barba's beforeLeave hook.
  stop() {}

  // called during Barba's afterLeave hook.
  destroy() {}

  // getter - setter
  get name() {
    return null;
  }
}

export default Module;
