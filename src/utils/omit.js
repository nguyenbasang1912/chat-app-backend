module.exports = function omit(obj) {
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined || obj[key] === null) {
      delete obj[key];
    } else if (Array.isArray(obj[key])) {
      !obj[key].length && delete obj[key];
    } else if (obj[key] instanceof Object) {
      obj[key] = omit(obj[key]);
    }
  }

  return obj;
};
