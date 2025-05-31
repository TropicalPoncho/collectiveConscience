import {ThreeObject}  from './ThreeObject.js';

export class LinkThreeObject extends ThreeObject  {

    type = 'SinLink';
    start;
    end;

    constructor (node, config){
        super(node);

        this.start = node.start || null;
        this.end = node.end || null;

        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0, 0)
        ]);
        const material = new THREE.LineBasicMaterial({ color: 0xff44ff, linewidth: 20, opacity: 0.8, transparent: true });

        // create a sphere and assign the material
        this.mesh = new THREE.Line(geometry, material);

        //this.mesh.material.color.set(0x00ff00);
    }

    setPosition(start, end) {
        this.start = start;
        this.end = end;
    }

    animate(){
        super.animate();
        // Si los nodos tienen posición, actualiza la geometría
        if (!this.start || !this.end) return;

        /* this.mesh.material.color.set(0x9900FF);
        this.mesh.material.opacity = .7;
        this.mesh.material.transparent = true;
        this.mesh.material.needsUpdate = true; */

        const startVec = new THREE.Vector3(this.start.x, this.start.y, this.start.z);
        const endVec = new THREE.Vector3(this.end.x, this.end.y, this.end.z);

        // Genera los puntos de la onda
        const amplitude = 5;
        const frequency = 4;
        const segments = 40;
        const speed = 1; // velocidad de animación, ajusta a gusto

        // Obtén el tiempo actual (en segundos)
        const time = performance.now() * 0.001; // milisegundos a segundos

        const points = [];
        const direction = new THREE.Vector3().subVectors(endVec, startVec);
        direction.normalize();

        let up = new THREE.Vector3(0, 1, 0);
        if (Math.abs(direction.dot(up)) > 0.99) up = new THREE.Vector3(1, 0, 0);
        const perpendicular = new THREE.Vector3().crossVectors(direction, up).normalize();

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = new THREE.Vector3().lerpVectors(startVec, endVec, t);
            const offset = Math.sin(t * Math.PI * frequency + time * speed) * amplitude;
            point.addScaledVector(perpendicular, offset);
            points.push(point);
        }

        // Actualiza la geometría de la línea
        this.mesh.geometry.setFromPoints(points);
        this.mesh.geometry.attributes.position.needsUpdate = true;

        // Si quieres ser explícito y compatible con futuras versiones:
        if (this.mesh.geometry.attributes.position.addUpdateRange) {
            // Actualiza todo el rango (desde 0 hasta el final)
            this.mesh.geometry.attributes.position.addUpdateRange(0, this.mesh.geometry.attributes.position.count);
        }

        // Si devuelves true, evitas que la librería haga el update por defecto (¡esto es lo que quieres!)
        return true;
    }

}
