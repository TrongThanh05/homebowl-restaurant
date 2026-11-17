// src/utils/router.js
// Minimal router implementation without Express

function pathToRegex(path) {
  const paramNames = [];
  const regexStr = path
    .replace(/\//g, '\\/')
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, (_, name) => {
      paramNames.push(name);
      return '([^\\/]+)';
    });
  return { regex: new RegExp(`^${regexStr}$`), paramNames };
}

function createRouter() {
  const routes = [];

  function addRoute(method, path, handlers) {
    const { regex, paramNames } = pathToRegex(path);
    routes.push({ method: method.toUpperCase(), path, regex, paramNames, handlers });
  }

  function get(path, ...handlers) { addRoute('GET', path, handlers); }
  function post(path, ...handlers) { addRoute('POST', path, handlers); }
  function put(path, ...handlers) { addRoute('PUT', path, handlers); }
  function patch(path, ...handlers) { addRoute('PATCH', path, handlers); }
  function del(path, ...handlers) { addRoute('DELETE', path, handlers); }

  function use(prefixOrRouter, maybeRouter) {
    let prefix = '';
    let subRouter = prefixOrRouter;
    if (typeof prefixOrRouter === 'string') {
      prefix = prefixOrRouter;
      subRouter = maybeRouter;
    }
    if (subRouter && Array.isArray(subRouter.routes)) {
      for (const r of subRouter.routes) {
        const fullPath = (prefix + r.path).replace(/\/+/g, '/');
        addRoute(r.method, fullPath, r.handlers);
      }
    }
  }

  async function handle(req, res) {
    const rawPath = (req.url || '/').split('?')[0];
    const urlPath = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
    const method = (req.method || 'GET').toUpperCase();

    if (!req.query) {
      try {
        req.query = Object.fromEntries(new URL(req.url, 'http://localhost').searchParams);
      } catch {
        req.query = {};
      }
    }

    for (const route of routes) {
      if (route.method !== method) continue;
      const match = urlPath.match(route.regex);
      if (!match) continue;

      req.params = {};
      route.paramNames.forEach((name, i) => {
        req.params[name] = decodeURIComponent(match[i + 1]);
      });

      let idx = 0;
      const next = async (err) => {
        if (err) throw err;
        if (idx < route.handlers.length) {
          const handler = route.handlers[idx++];
          await handler(req, res, next);
        }
      };
      await next();
      return true; // matched
    }
    return false; // not matched
  }

  return { get, post, put, patch, delete: del, use, handle, routes };
}

export { createRouter };
