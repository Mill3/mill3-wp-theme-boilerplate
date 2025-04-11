(function ($, undefined) {

  var Field = acf.Field.extend({
    type: 'spacer',
    events: {
      'input input[type="range"]': 'onChange'
    },
    $wrap: function() {
      return this.$('.mill3-acf-spacer-wrap');
    },
    $range: function () {
      return this.$('input[type="range"]');
    },
    $label: function () {
      return this.$('input[type="text"]');
    },
    $hidden: function() {
      return this.$('input[type="hidden"]');
    },
    $choices: function() {
      if( !this.choices ) {
        this.choices = JSON.parse(this.$wrap()[0].dataset['spacerChoices']);
      }

      return this.choices;
    },
    getChoiceAtIndex: function(index) {
      return this.$choices()[index];
    },
    setValue: function (index) {
      this.busy = true;

      // transform value to formatted label
      const choice = this.getChoiceAtIndex(index);
      const value = choice.value;
      const label = choice.label;

      // Update label input (without change).
      acf.val(this.$label(), label, true);

      // Update hidden input (without change).
      acf.val(this.$hidden(), value, true);

      this.busy = false;
    },
    onChange: function (e, $el) {
      if (!this.busy) {
        this.setValue($el.val());
      }
    }
  });
  
  acf.registerFieldType(Field);
})(jQuery);
