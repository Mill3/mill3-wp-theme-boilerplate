/**
 * Included when media fields are rendered for editing by publishers.
 */
(function( $ ) {

  const MediaField = acf.Field.extend({
    type: 'media',
    events: {
      'click .file[data-file="file"] a[data-name="add"]': 'onAddFile',
      'click .file[data-file="file"] a[data-name="edit"]': 'onEditFile',
      'click .file[data-file="file"] a[data-name="remove"]': 'onRemoveFile',

      'click .file[data-file="poster"] a[data-name="add"]': 'onAddPoster',
      'click .file[data-file="poster"] a[data-name="edit"]': 'onEditPoster',
      'click .file[data-file="poster"] a[data-name="remove"]': 'onRemovePoster',

      'click .file[data-file="mobile"] a[data-name="add"]': 'onAddMobile',
      'click .file[data-file="mobile"] a[data-name="edit"]': 'onEditMobile',
      'click .file[data-file="mobile"] a[data-name="remove"]': 'onRemoveMobile',

      'change .rive-playback' : 'onRivePlaybackChange',
    },
    $control: function() { return this.$('.acf-media-uploader'); },
    $file: function() { return this.$('.file[data-file="file"]'); },
    $poster: function() { return this.$('.file[data-file="poster"]'); },
    $mobile: function() { return this.$('.file[data-file="mobile"]'); },
    $rivePlayback: function() { return this.$('.rive-playback'); },

    getValue: function() {
      let value = this.$input().val();

      if( !value ) return false;

      value = JSON.parse(value);
      if( !isObject(value) ) return false;

      return value;
    },
    validateValue: function() {
      let value = this.getValue();

      if( !isObject(value) ) value = { file: false, poster: false, mobile: false, rive_playback: 0 };

      return value;
    },
    validateEmptiness: function(value) {
      if( value.file === false && value.poster === false && value.mobile === false ) return false;
      return value;
    },
    updateFile: function($file, model) {
      if( model ) {
        const o = acf.parseArgs(model.attributes, {
          url: "",
          alt: "",
          title: "",
          filename: "",
          filesizeHumanReadable: "",
          icon: "/wp-includes/images/media/default.png"
        });

        $file.find("img").attr({ src: o.icon, alt: o.alt, title: o.title });
        $file.find('[data-name="title"]').text(o.title);
        $file.find('[data-name="filename"]').text(o.filename).attr("href", o.url);
        $file.find('[data-name="filesize"]').text(o.filesizeHumanReadable);

        $file.addClass("has-value");
      } 
      else $file.removeClass("has-value");
    },

    renderFile: function(model) {
      let value = this.validateValue();
          value.file = model ? model.id : false;
          value = this.validateEmptiness(value);

      this.updateFile(this.$file(), model);

      if( model && model.attributes.type == 'video' ) this.$control().addClass('--is-video');
      else this.$control().removeClass('--is-video');

      if( model && model.attributes.mime == 'application/riv' ) this.$control().addClass('--is-rive');
      else this.$control().removeClass('--is-rive');

      acf.val(this.$input(), JSON.stringify(value));
    },
    renderPoster: function(model) {
      let value = this.validateValue();
          value.poster = model ? model.id : false;
          value = this.validateEmptiness(value);

      this.updateFile(this.$poster(), model);
      acf.val(this.$input(), JSON.stringify(value));
    },
    renderMobile: function(model) {
      let value = this.validateValue();
          value.mobile = model ? model.id : false;
          value = this.validateEmptiness(value);

      this.updateFile(this.$mobile(), model);
      acf.val(this.$input(), JSON.stringify(value));
    },

    onAddFile: function() {
      acf.newMediaPopup({
        mode: 'select',
        title: acf.__('Select Media'),
        field: this.get('key'),
        library: this.get('library'),
        allowedTypes: this.get('mime_types'),
        select: jQuery.proxy(function(model) { this.renderFile(model); }, this),
      });
    },
    onEditFile: function() {
      let value = this.getValue();
      if( !value || !value.file ) return;

      acf.newMediaPopup({
        mode: 'edit',
        title: acf.__('Edit Media'),
        button: acf.__('Update Media'),
        field: this.get('key'),
        attachment: value.file,
        select: jQuery.proxy(function(model) { this.renderFile(model); }, this),
      });
    },
    onRemoveFile: function() {
      this.renderFile();
    },

    onAddPoster: function() {
      acf.newMediaPopup({
        mode: 'select',
        title: acf.__('Select Poster'),
        library: this.get('library'),
        type: 'image',
        select: jQuery.proxy(function(model) { this.renderPoster(model); }, this),
      });
    },
    onEditPoster: function() {
      let value = this.getValue();
      if( !value || !value.poster ) return;

      acf.newMediaPopup({
        mode: 'edit',
        title: acf.__('Edit Poster'),
        button: acf.__('Update Poster'),
        attachment: value.poster,
        select: jQuery.proxy(function(model) { this.renderPoster(model); }, this),
      });
    },
    onRemovePoster: function() {
      this.renderPoster();
    },

    onAddMobile: function() {
      const type = this.$control().hasClass('--is-rive') ? 'application/riv' : 'video';

      acf.newMediaPopup({
        mode: 'select',
        title: acf.__('Select mobile Media'),
        library: this.get('library'),
        type: type,
        select: jQuery.proxy(function(model) { this.renderMobile(model); }, this),
      });
    },
    onEditMobile: function() {
      let value = this.getValue();
      if( !value || !value.poster ) return;

      acf.newMediaPopup({
        mode: 'edit',
        title: acf.__('Edit mobile Media'),
        button: acf.__('Update mobile Media'),
        attachment: value.mobile,
        select: jQuery.proxy(function(model) { this.renderMobile(model); }, this),
      });
    },
    onRemoveMobile: function() {
      this.renderMobile();
    },

    onRivePlaybackChange: function() {
      let value = this.validateValue();
          value.rive_playback = parseInt( this.$rivePlayback().find('select').val() );
          value = this.validateEmptiness(value);

      acf.val(this.$input(), JSON.stringify(value));
    }
  });

  // utility functions
  const isObject = function(v) { return v.constructor.name == "Object"; }

  // register new field
  acf.registerFieldType(MediaField);
})( jQuery );
