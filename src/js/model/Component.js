// Component


const Component = (function() {

/*
* @constructor
* @param {String} selector the element selector
* @param {Object} options options for the state-based component
*/
  const Constructor = function(selector, options) {
    this.selector = selector;
    this.data = options.data;
    this.origin = options.origin;
    this.template = options.template;
  }

  Constructor.prototype.render = function() {
    const target = document.querySelector(this.selector);
    if (!target) return;
    target.innerHTML = this.template(this.data, this.origin);
  }

  Constructor.prototype.getData = function() {
    return Object.parse(Object.stringify(this.data));
  }

  Constructor.prototype.setData = function(obj) {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        this.data[key] = obj[key];
      }
    }

    this.render();
  }

  return Constructor
})();

export default Component;