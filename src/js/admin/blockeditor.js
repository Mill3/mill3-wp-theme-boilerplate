/* eslint-disable no-undef */
wp.domReady(() => {
  //
  // THIS IS DISABLING ALL DEFAULT CORE BLOCKS & SOME PLUGINS
  //
  wp.blocks.getBlockTypes().forEach((type) => {
    // console.log('type:', type)
    if (type.name.match("core")) wp.blocks.unregisterBlockType(type.name);
    if (type.name.match("rank-math")) wp.blocks.unregisterBlockType(type.name);
    if (type.name.match("gravityforms")) wp.blocks.unregisterBlockType(type.name);
    if (type.name.match("polylang")) wp.blocks.unregisterBlockType(type.name);
  });

  wp.data.dispatch("core/editor").updateEditorSettings({
    autosaveInterval: 999999
  });

});
