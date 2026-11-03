import { lazy } from 'react';

const FLAG = 'fitlog_chunk_retry';

/**
 * React.lazy that reloads the page once when a file from an older deploy is gone (the host answers the old
 * file name with the home page, so the import fails). The reload fetches the new file names.
 */
export function lazyWithRetry(load) {
  return lazy(() =>
    load()
      .then((module) => {
        sessionStorage.removeItem(FLAG);
        return module;
      })
      .catch((err) => {
        if (sessionStorage.getItem(FLAG)) throw err; // already retried once: show the error screen instead of looping
        sessionStorage.setItem(FLAG, '1');
        window.location.reload();
        return new Promise(() => {}); // hold the screen while the page reloads
      })
  );
}
