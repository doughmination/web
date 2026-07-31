/* personal/src/types/model-viewer.d.ts
 * Copyright (c) 2026 Clove Nytrix Doughmination Twilight
 * Licensed under the DASL-1.0 Licence.
 * See LICENCE.md in the project root for full licence information.
 */
/** types/model-viewer.d.ts
 * Ambient declaration for model-viewer's pre-bundled dist build.
 *
 * Model3D.tsx imports `@google/model-viewer/dist/model-viewer.min.js` rather
 * than the package root on purpose — see the comment there for the three.js
 * version conflict it avoids. That deep path ships no .d.ts, and the import is
 * side-effect-only (it registers the <model-viewer> custom element and exports
 * nothing we use), so an untyped module declaration is sufficient here.
 */
declare module "@google/model-viewer/dist/model-viewer.min.js";
