// https://github.com/anonyco/Force-DOM-reflow-JS
// forces a complete reflow of a single element
let forceRepaint;

try {
  forceRepaint = Function.prototype.call.bind(
    // wrap it all up into an auto
    Object.getOwnPropertyDescriptor(
      // obtain the internal funciton that performs the reflow
      HTMLElement.prototype,
      "offsetHeight"
    ).get
  );
} catch (e) {
  forceRepaint = a => {
    void a.offsetHeight;
  };
}

export default forceRepaint;
