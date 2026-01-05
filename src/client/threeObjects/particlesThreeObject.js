import { resolveTHREE } from './threeGlobal.js';
const THREE = resolveTHREE();
import {ThreeObject}  from "./ThreeObject.js";

function randomPosNeg() { return Math.round(Math.random()) * 2 - 1; }

export class ParticlesThreeObject extends ThreeObject {

    static type = 'Particles';

    r = 40;
    showDots = false;
    showLines = true;
    minDistance = 15;
    limitConnections = true;
    maxConnections = 20;
    maxParticleCount = 50;

    _particlesData
    particlePositions
    positions;
    colors;
    _pointCloud;
    _linesMesh;

    rHalf = 0;

    constructor(node, props){
        super(node);
        
        const rX = this.r ?? node.particlesSize;
        const rY = rX;
        const rZ = rX;
        this.rHalf = rX / 2;;

        const group = new THREE.Group();

/*         if(props.helper !== undefined){
            const helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxGeometry( rX, rY, rZ ) ) );
            helper.material.color.setHex( 0xFFFFFF );
            helper.material.blending = THREE.AdditiveBlending;
            helper.material.transparent = true;
            group.add( helper );  
        } */

        const segments = this.maxParticleCount * this.maxParticleCount;

        this.positions = new Float32Array( segments * 3 );
        this.colors = new Float32Array( segments * 3 );

        const pMaterial = new THREE.PointsMaterial( {
            color: 0xFFFFFF,
            size: 0.5,
            blending: THREE.AdditiveBlending,
            transparent: true,
            sizeAttenuation: false
        } );

        var particles = new THREE.BufferGeometry();
        this.particlePositions = new Float32Array( this.maxParticleCount * 3 );

        this._particlesData = [];

        for ( let i = 0; i < this.maxParticleCount; i ++ ) {

            const x = Math.random() * rX - rX / 2;
            const y = Math.random() * rY - rY / 2;
            const z = Math.random() * rZ - rZ / 2;

            this.particlePositions[ i * 3 ] = x;
            this.particlePositions[ i * 3 + 1 ] = y;
            this.particlePositions[ i * 3 + 2 ] = z;

            // add it to the geometry
            this._particlesData.push( {
                velocity: new THREE.Vector3( randomPosNeg() * 0.1, randomPosNeg() * 0.1, 0 ),
                numConnections: 0
            } );

        }

        particles.setDrawRange( 0, this.maxParticleCount );
        particles.setAttribute( 'position', new THREE.BufferAttribute( this.particlePositions, 3 ).setUsage( THREE.DynamicDrawUsage ) );

        // create the particle system
        this._pointCloud = new THREE.Points( particles, pMaterial );
        group.add( this._pointCloud );

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute( 'position', new THREE.BufferAttribute( this.positions, 3 ).setUsage( THREE.DynamicDrawUsage ) );
        geometry.setAttribute( 'color', new THREE.BufferAttribute( this.colors, 3 ).setUsage( THREE.DynamicDrawUsage ) );
        geometry.computeBoundingSphere();

        geometry.setDrawRange( 0, 0 );

        const material = new THREE.LineBasicMaterial( {
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true
        } );

        this._linesMesh = new THREE.LineSegments( geometry, material );
        group.add( this._linesMesh );

        this.mesh = group;
    }

    get particlesData() {
        return this._particlesData;
    }

    get pointCloud() {
        return this._pointCloud;
    }

    get linesMesh() {
        return this._linesMesh;
    }

    animate() {
        const rHalf = this.rHalf;
        let particlesData = this.particlesData;
        let positions = this.positions; 
        let colors = this.colors;
        let pointCloud = this.pointCloud;
        let particlePositions = this.particlePositions; 
        let limitConnections = this.limitConnections;

        let vertexpos = 0;
        let colorpos = 0;
        let numConnected = 0;

        for ( let i = 0; i < this.maxParticleCount; i ++ )
            particlesData[ i ].numConnections = 0;

        for ( let i = 0; i < this.maxParticleCount; i ++ ) {

            // get the particle
            const particleData = particlesData[ i ];

            particlePositions[ i * 3 ] += particleData.velocity.x;
            particlePositions[ i * 3 + 1 ] += particleData.velocity.y;
            particlePositions[ i * 3 + 2 ] += particleData.velocity.z;

            if ( particlePositions[ i * 3 + 1 ] < - rHalf || particlePositions[ i * 3 + 1 ] > rHalf )
                particleData.velocity.y = - particleData.velocity.y;

            if ( particlePositions[ i * 3 ] < - rHalf || particlePositions[ i * 3 ] > rHalf )
                particleData.velocity.x = - particleData.velocity.x;

            if ( particlePositions[ i * 3 + 2 ] < - rHalf || particlePositions[ i * 3 + 2 ] > rHalf )
                particleData.velocity.z = - particleData.velocity.z;

            if ( limitConnections && particleData.numConnections >= this.maxConnections )
                continue;

            // Check collision
            for ( let j = i + 1; j < this.maxParticleCount; j ++ ) {

                const particleDataB = particlesData[ j ];
                if ( limitConnections && particleDataB.numConnections >= this.maxConnections )
                    continue;

                const dx = particlePositions[ i * 3 ] - particlePositions[ j * 3 ];
                const dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ];
                const dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ];
                const dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

                if ( dist < this.minDistance ) {

                    particleData.numConnections ++;
                    particleDataB.numConnections ++;

                    const alpha = 1.0 - dist / this.minDistance;

                    positions[ vertexpos ++ ] = particlePositions[ i * 3 ];
                    positions[ vertexpos ++ ] = particlePositions[ i * 3 + 1 ];
                    positions[ vertexpos ++ ] = particlePositions[ i * 3 + 2 ];

                    positions[ vertexpos ++ ] = particlePositions[ j * 3 ];
                    positions[ vertexpos ++ ] = particlePositions[ j * 3 + 1 ];
                    positions[ vertexpos ++ ] = particlePositions[ j * 3 + 2 ];

                    colors[ colorpos ++ ] = alpha;
                    colors[ colorpos ++ ] = alpha;
                    colors[ colorpos ++ ] = alpha;

                    colors[ colorpos ++ ] = alpha;
                    colors[ colorpos ++ ] = alpha;
                    colors[ colorpos ++ ] = alpha;

                    numConnected ++;

                }

            }

        }


        this._linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
        this._linesMesh.geometry.attributes.position.needsUpdate = true;
        this._linesMesh.geometry.attributes.color.needsUpdate = true;
        
        pointCloud.geometry.attributes.position.needsUpdate = true;
    
    }
}
