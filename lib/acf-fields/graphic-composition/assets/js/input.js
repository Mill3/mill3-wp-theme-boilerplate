/**
 * Included when graphic-composition fields are rendered for editing by publishers.
 */
(function() {

  class GraphicCompositionField {
    constructor(el) {
      this.el = el;
  
      this.btn = this.el.querySelector('.graphic-composition__btnModal');
      this.input = this.el.querySelector('.graphic-composition__input');
      this.modal = document.querySelector('#GraphicComposition');
  
      this.settings = this.input.value.trim() !== "" ? JSON.parse(this.input.value) : null;

      this._openModal = this._openModal.bind(this);

      this.init();
    }

    init() {
      this._bindEvents();
    }
    destroy() {
      this._unbindEvents();
    }

    _bindEvents() {
      this.btn.addEventListener('click', this._openModal);
    }
    _unbindEvents() {
      this.btn.removeEventListener('click', this._openModal);
    }

    _openModal() {
      console.log('open modal', this.settings);

      this.modal.showModal();
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
