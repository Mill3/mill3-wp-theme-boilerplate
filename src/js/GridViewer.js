import { body, removeAllChilds } from '@utils/dom';
import { on } from '@utils/listener';
import ResizeOrientation, { BEFORE_SCROLL_UPDATE } from '@utils/resize';
import Viewport from '@utils/viewport';


const DEFAULT_LEVEL = 0.1;
const LEVELS = [0, DEFAULT_LEVEL, 0.5];
const STORAGE = 'grid-view--level';

const BREAKPOINTS = {
  0: {
    columns: 4,
    gutter: 12,
    margin: 12,
  },
  768: {
    columns: 8,
    gutter: 20,
    margin: 20,
  },
  1200: {
    columns: 12,
    gutter: 20,
    margin: 20,
  },
  1800: {
    columns: 12,
    gutter: 20,
    margin: 40,
  },
};


class GridViewer {
  constructor() {
    this.el = document.createElement('div');
    this.el.classList.add('grid-viewer', 'position-fixed', 't-0', 'l-0', 'w-100', 'h-100', 'pointer-events-none');
    this.el.style.color = 'red';
    this.el.style.zIndex = '99999'
    this.el.setAttribute('aria-hidden', true);

    this.grid = document.createElement('div');
    this.grid.classList.add('grid-viewer__grid', 'd-grid', 'position-absolute', 't-0', 'l-0', 'w-100', 'h-100');

    this.button = document.createElement('button');
    this.button.classList.add('grid-viewer__btn', 'position-absolute', 't-0', 'l-0', 'pointer-events-all');
    this.button.style.width = '40px';
    this.button.style.height = '40px';
    this.button.style.backgroundColor = 'rgba(0, 0, 255, 0.5)';
    this.button.setAttribute('tabindex', -1);

    this._breakpoint = null;
    this._level = localStorage.getItem(STORAGE) || DEFAULT_LEVEL;
    this._level = parseFloat(this._level);

    if( !LEVELS.includes(this._level) ) this._level = DEFAULT_LEVEL;

    this._onResize = this._onResize.bind(this);
    this._onClick = this._onClick.bind(this);
    
    this.init();
  }

  init() {
    this.grid.style.opacity = this._level;

    this.el.appendChild(this.grid);
    this.el.appendChild(this.button);

    body.appendChild(this.el);

    this._bindEvents();
    this._onResize();
  }

  _bindEvents() {
    ResizeOrientation.add(this._onResize, BEFORE_SCROLL_UPDATE);
    on(this.button, 'click', this._onClick);
  }

  _onResize() {
    const vw = Viewport.width;
    const [breakpoint, {columns, gutter, margin}] = Object.entries(BREAKPOINTS).findLast(([breakpoint]) => breakpoint <= vw);

    // if breakpoint hasn't change, stop here
    if( breakpoint === this._breakpoint ) return;
    this._breakpoint = breakpoint;

    // remove all grid cells
    removeAllChilds(this.grid);

    // update grid settings
    this.grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    this.grid.style.gridGap = `${gutter}px`;
    this.grid.style.padding = `0 ${margin}px`;

    // create grid cells
    for(let i = 0; i<columns; i++) {
      const cell = document.createElement('div');
            cell.style.backgroundColor = 'currentColor';

      this.grid.appendChild(cell);
    }
  }
  _onClick(event) {
    if( event ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    const currentIndex = LEVELS.indexOf(this._level);
    const nextIndex = currentIndex >= LEVELS.length - 1 ? 0 : currentIndex + 1;
    this._level = LEVELS[nextIndex];

    this.grid.style.opacity = this._level;
    localStorage.setItem(STORAGE, this._level);
  }
}

new GridViewer();
