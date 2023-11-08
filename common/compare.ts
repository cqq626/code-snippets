function getType(a: any) {
  return Object.prototype.toString.call(a);
}

export function isObject(a: any) {
  return getType(a) === '[object Object]';
}

export function isArray(a: any) {
  return getType(a) === '[object Array]';
}

export function compare(a: any, b: any): boolean {
  if (isObject(a) && isObject(b)) {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
      return false;
    }
    for (const key of keysA) {
      if (!compare(a[key], b[key])) {
        return false;
      }
    }
    return true;
  } else if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!compare(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }
  return a === b;
}
