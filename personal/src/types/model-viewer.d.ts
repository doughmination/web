/**
 * Ambient declaration for model-viewer's pre-bundled dist build.
 *
 * Model3D.tsx imports `@google/model-viewer/dist/model-viewer.min.js` rather
 * than the package root on purpose — see the comment there for the three.js
 * version conflict it avoids. That deep path ships no .d.ts, and the import is
 * side-effect-only (it registers the <model-viewer> custom element and exports
 * nothing we use), so an untyped module declaration is sufficient here.
 */
declare module "@google/model-viewer/dist/model-viewer.min.js";
