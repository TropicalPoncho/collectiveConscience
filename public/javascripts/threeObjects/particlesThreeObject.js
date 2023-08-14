import {ThreeObject, threeObjects }  from './threeObject.js';

threeObjects = class ParticlesThreeObject extends ThreeObject {

    _maxParticleCount;
    _maxConnections;
    _minDistance;
    _positions;
    _colors;

    //Particles Object PUT IN 
    group;
    container, stats;
    maxParticleCount = 200;
    particleCount = maxParticleCount;

    rX, rY, rZ;
    r = 50;
    rHalf;

    effectController = {
        showDots: false,
        showLines: true,
        minDistance: 30,
        limitConnections: true,
        maxConnections: 100,
        particleCount: particleCount
    };

    constructor(node, props){
        super(props);

        rX = node.particlesSize;
        rY = rX;
        rZ = rX;
        rHalf = rX / 2;

        _maxParticleCount = node.particles?.maxParticleCount ?? maxParticleCount;
        _maxConnections = node.particles?.maxConnections ?? effectController.maxConnections;
        _minDistance = node.particles?.minDistance ?? effectController.minDistance;

        var group = new THREE.Group();

    /*  const helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxGeometry( rX, rY, rZ ) ) );
        helper.material.color.setHex( 0xFFFFFF );
        helper.material.blending = THREE.AdditiveBlending;
        helper.material.transparent = true;
        group.add( helper );  
    */

        const segments = _maxParticleCount * _maxParticleCount;

        _positions = new Float32Array( segments * 3 );
        _colors = new Float32Array( segments * 3 );

        const pMaterial = new THREE.PointsMaterial( {
            color: 0xFFFFFF,
            size: 0.5,
            blending: THREE.AdditiveBlending,
            transparent: true,
            sizeAttenuation: false
        } );

        _particles = new THREE.BufferGeometry();
        _particlePositions = new Float32Array( _maxParticleCount * 3 );

        _particlesData = [];

        for ( let i = 0; i < _maxParticleCount; i ++ ) {

            const x = Math.random() * rX - rX / 2;
            const y = Math.random() * rY - rY / 2;
            const z = Math.random() * rZ - rZ / 2;

            _particlePositions[ i * 3 ] = x;
            _particlePositions[ i * 3 + 1 ] = y;
            _particlePositions[ i * 3 + 2 ] = z;

            // add it to the geometry
            _particlesData.push( {
                velocity: new THREE.Vector3( randomPosNeg() * 0.1, randomPosNeg() * 0.1, 0 ),
                numConnections: 0
            } );

        }

        _particles.setDrawRange( 0, _particleCount );
        _particles.setAttribute( 'position', new THREE.BufferAttribute( _particlePositions, 3 ).setUsage( THREE.DynamicDrawUsage ) );

        // create the particle system
        _pointCloud = new THREE.Points( _particles, pMaterial );
        group.add( _pointCloud );

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute( 'position', new THREE.BufferAttribute( _positions, 3 ).setUsage( THREE.DynamicDrawUsage ) );
        geometry.setAttribute( 'color', new THREE.BufferAttribute( _colors, 3 ).setUsage( THREE.DynamicDrawUsage ) );

        geometry.computeBoundingSphere();

        geometry.setDrawRange( 0, 0 );

        const material = new THREE.LineBasicMaterial( {
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            transparent: true
        } );

        _linesMesh = new THREE.LineSegments( geometry, material );
        group.add( _linesMesh );

        return group;
    }

    animate() {

        let particlesData = this.particlesData;
        let positions = this.positions; 
        let colors = this.colors;
        let pointCloud = this.pointCloud;
        let particlePositions = this.particlePositions;
        let linesMesh = this.linesMesh;

        let particleCount = this.maxParticleCount;
        let maxConnections = this.maxConnections;
        let minDistance = this.minDistance;
        
        let vertexpos = 0;
        let colorpos = 0;
        let numConnected = 0;

        for ( let i = 0; i < particleCount; i ++ )
            particlesData[ i ].numConnections = 0;

        for ( let i = 0; i < particleCount; i ++ ) {

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

            if ( effectController.limitConnections && particleData.numConnections >= maxConnections )
                continue;

            // Check collision
            for ( let j = i + 1; j < particleCount; j ++ ) {

                const particleDataB = particlesData[ j ];
                if ( effectController.limitConnections && particleDataB.numConnections >= maxConnections )
                    continue;

                const dx = particlePositions[ i * 3 ] - particlePositions[ j * 3 ];
                const dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ];
                const dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ];
                const dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

                if ( dist < minDistance ) {

                    particleData.numConnections ++;
                    particleDataB.numConnections ++;

                    const alpha = 1.0 - dist / minDistance;

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


        linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
        linesMesh.geometry.attributes.position.needsUpdate = true;
        linesMesh.geometry.attributes.color.needsUpdate = true;
        
        pointCloud.geometry.attributes.position.needsUpdate = true;
    
        //requestAnimationFrame( animateParticles );
        render();
    }
}