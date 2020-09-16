export default function (attrName, value) {
  if (value == null || value === false) {
    this.removeAttribute(attrName);
  } else {
    const parsedValue = value === true ? '' : value;
    this.setAttribute(attrName, parsedValue);
  }
}