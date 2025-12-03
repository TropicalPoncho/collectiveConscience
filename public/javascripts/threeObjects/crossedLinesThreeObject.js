import {ThreeObject}  from "./ThreeObject.js";

function randomPointOnSphere(radius) {
	return new THREE.Vector3().setFromSphericalCoords(
		radius,
		Math.acos(2 * Math.random() - 1),
		2 * Math.PI * Math.random()
	);
}

export class CrossedLinesThreeObject extends ThreeObject {

    type = 'CrossedLines';

    constructor (node, config){
        super(node);
        const radius = node.radius ?? 40;
        this.radius = radius;
        const lineCount = node.lineCount ?? 70;
        const positions = new Float32Array(lineCount * 2 * 3);

        for (let i = 0; i < lineCount; i++) {
            const start = randomPointOnSphere(radius);
            const end = randomPointOnSphere(radius);
            const offset = i * 6;

            positions[offset] = start.x;
            positions[offset + 1] = start.y;
            positions[offset + 2] = start.z;

            positions[offset + 3] = end.x;
            positions[offset + 4] = end.y;
            positions[offset + 5] = end.z;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.LineBasicMaterial({
			color: node.color ?? 0xffffff,
			transparent: true,
			opacity: node.opacity ?? 0.6,
			blending: THREE.AdditiveBlending,
			depthTest: true
		});

        const group = new THREE.Group();
        group.add(new THREE.LineSegments(geometry, material));
        this.mesh = group;
    }

}