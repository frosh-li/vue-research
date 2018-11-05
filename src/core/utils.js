function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

function hasOwn(obj, property) {
    return Object.prototype.hasOwnProperty.call(obj, property);
}
