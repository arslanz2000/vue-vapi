import clone from '@ungap/structured-clone'; 
if (!window.structuredClone) {
  window.structuredClone = clone;
}
