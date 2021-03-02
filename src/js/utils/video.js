// https://css-tricks.com/overlaying-video-with-transparency-while-wrangling-cross-browser-support/
export const supportsHEVCAlpha = () => {
  const navigator = window.navigator;
  const ua = navigator.userAgent.toLowerCase()
  const hasMediaCapabilities = !!(navigator.mediaCapabilities && navigator.mediaCapabilities.decodingInfo)
  const isSafari = ((ua.indexOf('safari') != -1) && (!(ua.indexOf('chrome')!= -1) && (ua.indexOf('version/')!= -1)))
  const isIOSChrome = navigator.userAgent.indexOf('CriOS') >= 0;

  return (isSafari || isIOSChrome) && hasMediaCapabilities;
}

export default {
  supportsHEVCAlpha
}
