import TabList from '@components/TabList';
import { $ } from '@utils/dom';

class PbRowTabs {
  constructor(el, emitter) {
    this.el = el;
    this.emitter = emitter;
    this.tablist = $('.pb-row-tabs__tablist', this.el);

    this._onTabListChange = this._onTabListChange.bind(this);
  }

  init() {
    if( this.tablist ) this.tablist = new TabList(this.tablist);
  }
  destroy() {
    if( this.tablist ) this.tablist.destroy();

    this.el = null;
    this.emitter = null;
    this.tablist = null;

    this._onTabListChange = null;
  }

  start() { this._bindEvents(); }
  stop() { this._unbindEvents(); }

  _bindEvents() {
    if( this.tabs ) this.tabs.on('change', this._onTabListChange);
  }
  _unbindEvents() {
    if( this.tabs ) this.tabs.on('change', this._onTabListChange);
  }

  _onTabListChange() { this.emitter.emit('SiteScroll.update'); }
}

export default PbRowTabs;
