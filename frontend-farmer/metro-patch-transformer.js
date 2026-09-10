const expoTransformer = require('@expo/metro-config/build/babel-transformer');

function stripAs(s) {
  // 1. Strip `export default Identifier as ...;`
  s = s.replace(/export\s+default\s+([a-zA-Z0-9_$]+)\s+as\s+[\s\S]*?;/g, 'export default $1;');

  // 2. Protect import and export-from statements
  const imports = [];
  s = s.replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, (m) => {
    imports.push(m);
    return `/*__IMPORT_${imports.length - 1}__*/`;
  });
  const exports = [];
  s = s.replace(/export\s*\{[\s\S]*?\}\s*from\s+['"][^'"]+['"];?/g, (m) => {
    exports.push(m);
    return `/*__EXPORT_${exports.length - 1}__*/`;
  });

  // 3. Strip `as component(...)` casts
  s = s.replace(/\s+as\s+component\([\s\S]*?\)/g, '');

  // 4. Strip TypeScript type assertions
  const re = /(?<=[)\w\]}])\s+as\s+(?!(?:from|well|a|part|such|soon|usual)\b)(\$[\w]+|[A-Z][\w]*(<[^>]+>)?|const|any|unknown|boolean|string|number|void|\{[\s\S]*?\}|typeof\s+[\s\S]*?)(?=[;,)\n])/g;
  let prev;
  let iterations = 0;
  do {
    prev = s;
    s = s.replace(re, '');
    iterations++;
  } while (s !== prev && iterations < 5);

  // Restore imports and exports
  s = s.replace(/\/\*__IMPORT_(\d+)__\*\//g, (_, i) => imports[i]);
  s = s.replace(/\/\*__EXPORT_(\d+)__\*\//g, (_, i) => exports[i]);

  return s;
}

module.exports.transform = function (props) {
  let { src, filename } = props;
  if (filename && filename.includes('react-native') && src) {
    // 1. Strip TypeScript 'readonly' keyword in Flow type definitions
    src = src.replace(/\breadonly\s+([a-zA-Z0-9_$'"]+\??\s*[:(])/g, '$1');
    src = src.replace(/\breadonly\s+/g, '');

    // 2. Strip TypeScript 'as ...' type assertions
    src = stripAs(src);

    // 3. Convert TypeScript bounds in Flow files ('extends keyof' -> ': any')
    src = src.replace(/\bextends\s+keyof\s+[A-Za-z0-9_$]+/g, ': any');

    // 4. Fix TypeScript 'keyof' in type aliases
    src = src.replace(/(export\s+)?type\s+([A-Za-z0-9_$]+)\s*=\s*keyof\s*\{[\s\S]*?\};/g, '$1type $2 = any;');
    src = src.replace(/(export\s+)?type\s+([A-Za-z0-9_$]+)\s*=\s*keyof\s+([A-Za-z0-9_$]+);/g, '$1type $2 = any;');
    src = src.replace(/\bkeyof\s+([A-Za-z0-9_$]+)/g, 'any');

    // 5. Fix Flow 0.230+ component declaration syntax for older Babel Flow parser
    src = src.replace(/\bcomponent\s+([A-Za-z0-9_$]+)\s*\(/g, 'function $1(');
    src = src.replace(/:\s*component\([\s\S]*?\)\s*=/g, ' =');
    src = src.replace(/=\s*component\([\s\S]*?\);/g, '= any;');
    src = src.replace(/:\s*\??component\([\s\S]*?\)(?=[,);=>\n])/g, ': any');
    src = src.replace(/\)\s+renders\s+[^{]+(?=\{)/g, ') ');

    // 6. Fix nested generics on EventEmitter interface and class
    src = src.replace(/export interface IEventEmitter<[\s\S]*?> {/, 'export interface IEventEmitter<TEventToArgsMap = any> {');
    src = src.replace(/export default class EventEmitter<[\s\S]*?>\s+implements\s+IEventEmitter<[A-Za-z0-9_$]+>/, 'export default class EventEmitter<TEventToArgsMap = any>');

    // 7. Fix TypeScript named tuple elements in Flow files [param: Type] -> [Type]
    src = src.replace(/\[\s*[a-zA-Z0-9_$]+\s*:\s*/g, '[');
  }
  return expoTransformer.transform({ ...props, src });
};
