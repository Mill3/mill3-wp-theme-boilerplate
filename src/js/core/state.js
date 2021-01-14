class State {
  constructor() {
    this.siteSearchOpen = false;
    this.siteNavOpen = false;
    this.scrollMin = false;
    this.scrollDirection = null;
  }

  dispatch(type, value = null) {
    switch (type) {
      case "SITE_SEARCH":
        this.siteSearchOpen = value;
        break;
      case "SITE_NAV":
        this.siteNavOpen = value;
        break;
      case "SCROLL_MIN":
        this.scrollMin = value;
        break;
      case "SCROLL_DIRECTION":
        this.scrollDirection = value;
        break;
      case "RESET":
        this.siteSearchOpen = false;
        this.siteNavOpen = false;
        this.scrollMin = false;
        this.scrollDirection = null;
        break;
      default:
        break;
    }
  }
}

export const STATE = new State();
export default State;
