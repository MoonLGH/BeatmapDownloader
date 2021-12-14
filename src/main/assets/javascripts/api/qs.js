module.exports = {
  stringify,
};

function stringifyValue(val) {
  switch (typeof val) {
    case "boolean":
      return val ? "true" : "false";
    default:
      return val.toString();
  }
}

function stringifyObject(base = "", obj = {}) {
  const values = [];
  for (const key in obj) {
    if (obj[key] === null || obj[key] === undefined) continue;
    values.push(`${base}[${key}]=${encodeURI(stringifyValue(obj[key]))}`);
  }
  return values;
}

function stringify(obj = {}) {
  const values = [];
  for (const key in obj) {
    if (obj[key] === null || obj[key] === undefined) continue;
    switch (typeof obj[key]) {
      case "object":
        values.push(...stringifyObject(obj[key]));
        break;
      default:
        values.push(`${key}=${encodeURI(stringifyValue(obj[key]))}`);
    }
  }
  return values.join("&");
}
