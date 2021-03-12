String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

export const PascalCase = (s) => {
  return (s||'').toLowerCase().replace(/(\b|-)\w/g, (m) => {
    return m.toUpperCase().replace(/-/,'');
  });
}
