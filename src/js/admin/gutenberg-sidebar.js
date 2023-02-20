jQuery(window).ready(function(){
  setTimeout(function(){
    var stored = localStorage.getItem('mill3_gutenberg_resizable_sidebar');
    if(stored) jQuery('.interface-interface-skeleton__sidebar').width(stored);
    jQuery('.interface-interface-skeleton__sidebar').resizable({
      handles: 'w',
      resize: function() {
        jQuery(this).css({'left': 0});
        localStorage.setItem('mill3_gutenberg_resizable_sidebar', jQuery(this).width());
      }
    });
  }, 500)
})
