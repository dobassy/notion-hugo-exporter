import kebabCase from "lodash.kebabcase";

export const urlize = (string: string): string => {
  const kebabStrings = string.split("/").map((str) => kebabCase(str));
  const kebab = kebabStrings.join("/");
  const startWithSlash = new RegExp(/^\/[^ ].+/);
  return kebab.match(startWithSlash) ? kebab : `/${kebab}`;
};
