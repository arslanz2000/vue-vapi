// polyfills.js — first thing in your bundle
import clone from '@ungap/structured-clone'; 
if (!window.structuredClone) {
  window.structuredClone = clone;
}
