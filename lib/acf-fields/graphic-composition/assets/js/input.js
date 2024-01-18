/**
 * Included when graphic-composition fields are rendered for editing by publishers.
 */
(function() {

  class GraphicCompositionField {
    constructor(el) {
      this.el = el;
  
      this.btn = this.el.querySelector('.graphic-composition__btnModal');
      this.settings = this.el.querySelector('.graphic-composition__settings');
      this.value = this.el.querySelector('.graphic-composition__value');
  
      this.settings = this.settings.value.trim() !== "" ? JSON.parse(this.settings.value) : null;
      this.state = this.value.value.trim() !== ""  ? JSON.parse(this.value.value) : null;

      this._openEditor = this._openEditor.bind(this);
      this._updateState = this._updateState.bind(this);

      this.init();
    }

    init() {
      // create random number of layers in state

      this.state = [];

      for(var i = 0, n = Math.ceil( Math.random() * 7 + 3 ); i<n; i++) {
        this.state.push({ title: `Layer ${i}` });
      }

      this._bindEvents();
    }
    destroy() {
      this._unbindEvents();
    }

    _bindEvents() {
      this.btn.addEventListener('click', this._openEditor);
    }
    _unbindEvents() {
      this.btn.removeEventListener('click', this._openEditor);
    }

    _openEditor() {
      window
        .OpenGraphicCompositionEditor(this.state, this.settings)
        .then(this._updateState, function() {});
    }
    _updateState(state) {
      this.state = state;
      this.value.value = JSON.stringify(state);
    }
  }

  FIELDS = [];

	function initialize_field( $field ) {
    for(var i = 0, n = $field.length; i<n; i++) {
      FIELDS.push( new GraphicCompositionField( $field[i] ) );
    }
  }

  function remove_field( $field ) {
    for(var i = 0, n = $field.length; i<n; i++) {
      // find field index in registry
      var index = FIELDS.findIndex(field => field.el === $field[i]);

      // remove field from registry if found
      if( index > -1 ) {
        FIELDS[index].destroy();
        FIELDS.splice(index, 1);
      }
    }
  }

	if( typeof acf.add_action !== 'undefined' ) {
		/**
		 * Run initialize_field when existing fields of this type load,
		 * or when new fields are appended via repeaters or similar.
		 */
		acf.add_action( 'ready_field/type=graphic_composition', initialize_field );
		acf.add_action( 'append_field/type=graphic_composition', initialize_field );
		acf.add_action( 'remove_field/type=graphic_composition', remove_field );
	}

})();
