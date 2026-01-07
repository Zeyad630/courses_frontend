/// <reference types="vite/client" />

declare module 'three' {
  const THREE: any;
  export = THREE;
}

declare namespace JSX {
  interface IntrinsicElements {
    instancedMesh: any;
    capsuleGeometry: any;
    sphereGeometry: any;
    boxGeometry: any;
    tetrahedronGeometry: any;
    meshBasicMaterial: any;
  }
}
