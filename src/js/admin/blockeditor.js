wp.domReady(() => {
  // console.log(wp.blocks.getBlockTypes());
  //
  // THIS IS DISABLING ALL DEFAULT CORE BLOCKS
  //
  wp.blocks.getBlockTypes().forEach((type) => {
    if(type.name.match('core')) wp.blocks.unregisterBlockType(type.name)
  })
});
