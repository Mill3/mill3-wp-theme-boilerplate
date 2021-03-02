(function hello() {
  if( !window.console ) return;

  let ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf('chrome') > -1 || ua.indexOf('firefox') > -1) {
    let args = [
      '%c %c  Site by MILL3 Studio. %c %c  https://mill3.studio/  %c ',
      'background: #3426F1; border: 1px solid #3426F1; padding:5px 0; margin:3px 0 10px 0;',
      'background: #ffffff; border: 1px solid #3426F1; color: #3426F1; padding:5px 0; margin:3px 0 10px 0;',
      'background: #3426F1; border: 1px solid #3426F1; padding:5px 0; margin:3px 0 10px 0;',
      'background: #ffffff; border: 1px solid #3426F1; color: #3426F1; padding:5px 0; margin:3px 0 10px 0;',
      'background: #3426F1; border: 1px solid #3426F1; padding:5px 0; margin:3px 0 10px 0;',
    ];

    window.console.log.apply(console, args);
  }
  else window.console.log('Site by MILL3 Studio - https://mill3.studio/');
})();
