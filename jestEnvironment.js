const customElements = {
  define () {},
  get () {}
};

class CustomEvent {}

function getComputedStyle () {
  return {
    getPropertyValue () {
      return '';
    }
  };
}

class HTMLTextAreaElement {}

class ResizeObserver {
  observe () {}
  unobserve () {}
}

const NodeEnvironment = require('jest-environment-node');

class jestEnvironment extends NodeEnvironment {
  async setup () {
    await super.setup();

    this.global.customElements = customElements;
    this.global.CustomEvent = CustomEvent;
    this.global.getComputedStyle = getComputedStyle;
    this.global.HTMLTextAreaElement = HTMLTextAreaElement;
    this.global.ResizeObserver = ResizeObserver;

    this.global.window = {
      customElements,
      CustomEvent,
      getComputedStyle,
      HTMLTextAreaElement,
      ResizeObserver
    };
  }

  async teardown () {
    await super.teardown();

    this.global.customElements = undefined;
    this.global.CustomEvent = undefined;
    this.global.getComputedStyle = undefined;
    this.global.HTMLTextAreaElement = undefined;
    this.global.ResizeObserver = undefined;

    this.global.window = undefined;
  }
}

module.exports = jestEnvironment;