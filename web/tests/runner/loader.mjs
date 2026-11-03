// Test-only module loader hook. Vite injects `import.meta.env` at build time; plain Node has none.
// This rewrites it to an empty object for files under src/ so the real modules can be tested unchanged.
export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.includes('/src/') && result.format === 'module' && result.source) {
    const source = String(result.source).replace(/import\.meta\.env/g, '({})');
    return { ...result, source };
  }
  return result;
}
