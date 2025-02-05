// @ts-ignore
function saPatchedFetch(...args: Array<any>) {
  const [urlOrFetchOpts, fetchOptsArg] = args;
  const fetchOpts = (typeof urlOrFetchOpts === 'object' ? urlOrFetchOpts : fetchOptsArg) || {};
  const fetchUrl = (typeof urlOrFetchOpts === 'object' ? (urlOrFetchOpts as Request).url : urlOrFetchOpts).toString();

  const objToCheckAsString = JSON.stringify(fetchOpts);
  console.log('patched fetch -',fetchUrl, objToCheckAsString);

  // @ts-ignore
  return saPatchedFetch._unpatchedFetch.apply(this, args);
}

export function enableFetchInterceptor() {
  console.log('enabling fetch interceptor');

  const fetchAlreadyPatched = (globalThis.fetch as any)._patchedBySecretAgent;

  if (fetchAlreadyPatched) {
    console.log('fetch already patched');
  } else {
    const unpatchedFetch = globalThis.fetch;
    (saPatchedFetch as any)._unpatchedFetch = unpatchedFetch;
    (saPatchedFetch as any)._patchedBySecretAgent = true;
    // Object.defineProperty(saPatchedFetch, '_patchedBySecretAgent', { value: true });
    globalThis.fetch = saPatchedFetch;
  }
}
export function disableFetchInterceptor() {
  if ((globalThis.fetch as any)._unpatchedFetch) {
    globalThis.fetch = (globalThis.fetch as any)._unpatchedFetch;
  }
}