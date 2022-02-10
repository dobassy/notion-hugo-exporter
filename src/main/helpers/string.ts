import kebabCase from "lodash.kebabcase";

export const urlize = (string: string): string => {
  // returns the same value as the input when it's a perfect
  // string consisting only of alphanumericals and slashes
  if (string.match(/^[a-z\d\-\/]+$/)) {
    return string;
  }
  const kebabStrings = string.split("/").map((str) => kebabCase(str));
  const kebab = kebabStrings.join("/");
  const startWithSlash = new RegExp(/^\/[^ ].+/);
  return kebab.match(startWithSlash) ? kebab : `/${kebab}`;
};
