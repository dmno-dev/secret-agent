/**
 * Simple utility to check a URL against a list of allowed patterns
 *
 * Usually this will be something like ['api.someservice.com'] but
 * we try to provide a little more flexibility
 *
 * It's not perfect but should work well enough for now
 */

// TODO: probably can make this regex slightly more strict, so patterns that dont make sense are not valid
const splitPatternRegex = /(?:(.*):\/\/)?([^/]+)(\/.*)?/;

const patternRegexCache: Record<string, RegExp> = {};

function buildRegexFromDomainPattern(pattern: string) {
  const patternParts = pattern.match(splitPatternRegex);
  if (!patternParts) {
    throw new Error(`Unable to parse domain pattern - ${pattern}`);
  }
  let [, protocol, domain, path] = patternParts;

  if (protocol === '*' || !protocol) {
    protocol = '[a-z+]+';
  }
  domain = domain.replaceAll('*', '[^/]+');
  if (!path) path = '(/.*)?';
  else path = path.replaceAll('*', '.*');
  path += '(\\?.*)?';

  // NOTE - might need extra handling around port numbers?
  const regexString = `${protocol}://${domain}${path}`;

  return new RegExp(regexString, 'i');
}

export function validateUrlPattern(pattern: string) {
  const patternParts = pattern.match(splitPatternRegex);
  return !!patternParts;
}

export function checkUrlMatchesPattern(url: string, pattern: string) {
  if (pattern === '*') return true;
  const patternRegex = patternRegexCache[pattern] || buildRegexFromDomainPattern(pattern);
  return patternRegex.test(url);
}
export function checkUrlInPatternList(url: string, urlPatterns: Array<string>) {
  for (const p of urlPatterns) {
    if (url.includes(p)) return true;
    if (checkUrlMatchesPattern(url, p)) return true;
  }
  return false;
}
