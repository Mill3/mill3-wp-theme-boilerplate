/* eslint-disable no-undef */
(function() {

  tinymce.create("tinymce.plugins.dummy", {
    // url argument holds the absolute url of our plugin directory
    init: function(editor, url) {
      // add new button
      editor.addButton("dummy", {
        title: "CTA",
        image: url + "/../../src/images/mce-cta.png",
        onclick: function() {
          // Open window
          editor.windowManager.open({
            title: 'Call to Action (CTA)',
            body: [{
              type: 'textbox',
              name: 'url',
              label: 'URL'
            }, {
              type: 'textbox',
              name: 'title',
              label: 'Link text'
            }, {
              type: 'checkbox',
              name: 'blank',
              checked: false,
              text: 'Open link in a new tab'
            }],
            onsubmit: function(e) {
              // Insert content when the window form is submitted
              const shortcode = `[cta url="${e.data.url}" title="${e.data.title}" target="${e.data.blank === true ? '_blank' : '_self'}"]`;
              editor.insertContent(shortcode);
            }
          });
        }
      });
    }
  });

  tinymce.PluginManager.add("dummy", tinymce.plugins.dummy);
})();
