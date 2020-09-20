import setAttr from './helpers/setAttr.js';
import getCoercedAttr from './helpers/getCoercedAttr.js';
import resetProp from './helpers/resetProp.js';
import hasStyleExceptHeightChanged from './helpers/hasStyleExceptHeightChanged.js';
import pxToNumber from './helpers/pxToNumber.js';

const TextAreaAutoSizeFactory = BaseClass => class extends BaseClass {
  constructor () {
    super();
    this.textElement = this;
    this._handleChange = this._handleChange.bind(this);
    this._handleUserResize = this._handleUserResize.bind(this);
  }

  get autoheight () {
    return getCoercedAttr(this, 'autoheight', Boolean);
  }

  set autoheight (value) {
    setAttr(this, 'autoheight', value);
  }

  get value () {
    return super.value;
  }

  set value (value) {
    super.value = value;
    this._handleChange();
  }

  static get observedAttributes () {
    return [
      ...super.observedAttributes || [],
      ...['autoheight', 'rows', 'cols', 'class', 'style']
    ];
  }

  attributeChangedCallback (...args) {
    super.attributeChangedCallback && super.attributeChangedCallback(...args);
    const [attrName, prevValue, nextValue] = args;

    if (prevValue !== nextValue) {
      if (attrName === 'autoheight') {
        if (prevValue == null) {
          this._handleAutoHeightStart();
        } else if (nextValue == null) {
          this._handleAutoHeightEnd();
        }
      }

      if (!attrName === 'style' ||
        hasStyleExceptHeightChanged(prevValue, nextValue)) {
        setTimeout(this._handleChange);
      }
    }
  }

  connectedCallback () {
    super.connectedCallback && super.connectedCallback();
    resetProp(this, 'autoheight');
  }

  _handleAutoHeightStart () {
    this._resizeObserver = new ResizeObserver(this._handleChange);
    this._resizeObserver.observe(this.textElement);
    this.textElement.addEventListener('input', this._handleChange);
    this.textElement.addEventListener('pointerup', this._handleUserResize);
    this.textElement.addEventListener('pointerdown', this._handleUserResize);
  }

  _handleAutoHeightEnd () {
    this._resizeObserver.unobserve(this.textElement);
    this.textElement.removeEventListener('input', this._handleChange);
    this.textElement.removeEventListener('pointerup', this._handleUserResize);
    this.textElement.removeEventListener('pointerdown', this._handleUserResize);
  }

  _handleChange () {
    if (this.autoheight) {
      const { offsetHeight, clientHeight } = this.textElement;
      const offset = offsetHeight - clientHeight;

      let inner = 0;
      const boxSizing = this._getStyleProp('box-sizing');

      if (boxSizing !== 'border-box') {
        const paddingTop = this._getStyleProp('padding-top');
        const paddingBottom = this._getStyleProp('padding-bottom');
        const borderTop = this._getStyleProp('border-top-width');
        const borderBottom = this._getStyleProp('border-bottom-width');
        inner = paddingTop + paddingBottom + borderTop + borderBottom;
      }

      const { height: prevHeight } = this.textElement.style;

      this.textElement.style.minHeight = 'auto';
      this.textElement.style.height = 'auto';

      const { scrollHeight } = this.textElement;
      const numericNextMinHeight = scrollHeight + offset - inner;
      const nextMinHeight = `${numericNextMinHeight}px`;
      const numericPrevHeight = pxToNumber(prevHeight);

      let nextHeight = prevHeight;

      if (numericPrevHeight != null) {
        nextHeight = this._userHasJustResized
          ? `${Math.max(numericNextMinHeight, numericPrevHeight)}px`
          : `${numericPrevHeight}px`;
      }

      this.textElement.style.minHeight = nextMinHeight;
      this.textElement.style.height = nextHeight;
    }
  }

  _handleUserResize ({ type }) {
    if (type === 'pointerdown') {
      this._preResizeHeight = this.offsetHeight;
      this._preResizeWidth = this.offsetWidth;
      return;
    }

    if (type === 'pointerup' && (this._preResizeHeight !== this.offsetHeight ||
      this._preResizeWidth !== this.offsetWidth)) {
      this._userHasJustResized = true;
      this._handleChange();
      this._userHasJustResized = false;
    }
  }

  _getStyleProp (str) {
    const elementStyles = window.getComputedStyle(this);
    const prop = elementStyles.getPropertyValue(str);

    return prop.endsWith('px')
      ? pxToNumber(prop)
      : prop;
  }
};

export default TextAreaAutoSizeFactory;
