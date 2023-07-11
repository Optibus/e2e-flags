// WARNING: This is not a drop in replacement solution and
// it might not work for some edge cases. Test your code!
export const isObject = (a: unknown) => a instanceof Object;

// WARNING: This is not a drop in replacement solution and
// it might not work for some edge cases. Test your code!
export const set = (
  obj: Record<string, any>,
  path: string | string[],
  value: any
): void => {
  // Regex explained: https://regexr.com/58j0k
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);

  pathArray?.reduce(
    (acc: Record<string, any>, key: string, i: number): Record<string, any> => {
      if (acc[key] === undefined) acc[key] = {};
      if (i === pathArray.length - 1) acc[key] = value;
      return acc[key];
    },
    obj
  );
};
