import { body, removeAllChilds } from '@utils/dom';
import { on } from '@utils/listener';
import ResizeOrientation, { MAX_PRIORITY } from '@utils/resize';
import Viewport from '@utils/viewport';


const BREAKPOINTS = {
  0: {
    columns: 4,
    gutter: 10,
    margin: 20,
  },
  768: {
    columns: 8,
    gutter: 12,
    margin: 30,
  },
  1024: {
    columns: 12,
    gutter: 20,
    margin: 60,
  },
  1800: {
    columns: 12,
    gutter: 20,
    margin: 100,
  }
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

    this._breakpoint = null;
    this._opacity = 0;

    this._onResize = this._onResize.bind(this);
    this._onClick = this._onClick.bind(this);


    this.el.appendChild(this.grid);
    this.el.appendChild(this.button);
    body.appendChild(this.el);

    this._bindEvents();
    this._onResize();
    this._onClick();
  }

  _bindEvents() {
    ResizeOrientation.add(this._onResize, MAX_PRIORITY);
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

    switch(this._opacity) {
      case 0: this._opacity = 0.1;
      break;

      case 0.1: this._opacity = 0.5;
      break;

      case 0.5: this._opacity = 0;
      break;
    }

    this.grid.style.opacity = this._opacity;
  }
}

new GridViewer();
