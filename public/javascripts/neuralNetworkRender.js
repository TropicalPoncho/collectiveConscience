import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

var graphData = { "nodes": [], "links": [] };

neurons.forEach((item, index, arr) => {
    graphData.nodes.push({ "id": item._id, "name": item.name ,"img": item.imgPath, "val": item.graphVal ?? 3});
    item.fromId.forEach((fromId) => {
//        for(var i = 0; i < 3; i++){
            graphData.links.push({
                source: fromId,
                target: item._id,
                curvature: 0.8, 
                rotation: Math.PI * 3 / 3
            });
//        }
    });
});

const Graph = ForceGraph3D()
    (document.getElementById('neuralNetwork'))
    .graphData(graphData)
    .nodeLabel('name')
    .nodeAutoColorBy('group')
 //   .linkWidth(0.5)
    .cameraPosition({x: -100, y: 0, z: 10})
    //.nodeThreeObjectExtend(true)
    .onNodeClick(node => {
        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

        const newPos = node.x || node.y || node.z
            ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
            : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

        Graph.cameraPosition(
            newPos, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );
    })
    Graph.cameraPosition({x:-100,z:30},{x:100,y:-19,z:-100})
    .nodeThreeObject(node => {
        if(node.img){
            const imgTexture = new THREE.TextureLoader().load(`/images/${node.img}`);
            const material = new THREE.SpriteMaterial({ map: imgTexture, transparent: true });
            const sprite = new THREE.Sprite(material);
            sprite.scale.set(20, 20);
            return sprite;
        }else{
            /* const sprite = new SpriteText(node.name);
            sprite.material.depthWrite = true; // make sprite background transparent
            sprite.color = node.color;
            sprite.textHeight = 8;
            return sprite; */

            let uniforms = {
                amplitude: { value: 7.0 },
                opacity: { value: 0.3 },
                color: { value: new THREE.Color( 0xFF0074 ) }
            };
            const geometry = new THREE.SphereGeometry( 4, 32, 16 );
        
            const shaderMaterial = new THREE.ShaderMaterial( {
                uniforms: uniforms,
                vertexShader: document.getElementById( 'vertexshader' ).textContent,
                fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            } );
            const count = geometry.attributes.position.count;
        
            const displacement = new THREE.Float32BufferAttribute( count * 3, 3 );
            geometry.setAttribute( 'displacement', displacement );
        
            const customColor = new THREE.Float32BufferAttribute( count * 3, 3 );
            geometry.setAttribute( 'customColor', customColor );
        
            const color = new THREE.Color( 0xffffff );
        
            for ( let i = 0, l = customColor.count; i < l; i ++ ) {
                color.setHSL( i / l, 0.5, 0.5 );
                color.toArray( customColor.array, i * customColor.itemSize );
            }
            return new THREE.Line( geometry, shaderMaterial );
        }
    })
    
    .linkThreeObject(({id}) => {
        const curve = new THREE.SplineCurve( [
            new THREE.Vector2( -10, 0 ),
            new THREE.Vector2( -5, 5 ),
            new THREE.Vector2( 0, 0 ),
            new THREE.Vector2( 5, -5 ),
            new THREE.Vector2( 10, 0 )
        ] );
        
        const points = curve.getPoints( 50 );
        const geometry = new THREE.BufferGeometry().setFromPoints( points );
        
        const material = new THREE.LineBasicMaterial( { color: 0x9900FF } );
        
        // Create the final object to add to the scene
        return new THREE.Line( geometry, material );
    });

const linkForce = Graph
    .d3Force('link')
    .distance(40);

/* const bloomPass = new THREE.UnrealBloomPass();
bloomPass.strength = 0.2;
bloomPass.radius = 1;
bloomPass.threshold = 0.1;
Graph.postProcessingComposer().addPass(bloomPass); */

/* setInterval(() => {
    const { nodes, links } = Graph.graphData();
    const id = nodes.length;
    Graph.graphData({
        nodes: [...nodes, { id }],
        links: [...links, { source: id, target: Math.round(Math.random() * (id-1)) }]
    });
}, 1000); */

function CreateLinesThreeObject(){
    let uniforms = {
        amplitude: { value: 3.0 },
        opacity: { value: 0.3 },
        color: { value: new THREE.Color( 0xffffff ) }
    };
    const geometry = new THREE.SphereGeometry( 4, 32, 16 );

    const shaderMaterial = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true
    } );
    const count = geometry.attributes.position.count;

    const displacement = new THREE.Float32BufferAttribute( count * 3, 3 );
    geometry.setAttribute( 'displacement', displacement );

    const customColor = new THREE.Float32BufferAttribute( count * 3, 3 );
    geometry.setAttribute( 'customColor', customColor );

    const color = new THREE.Color( 0xffffff );

    for ( let i = 0, l = customColor.count; i < l; i ++ ) {
        color.setHSL( i / l, 0.5, 0.5 );
        color.toArray( customColor.array, i * customColor.itemSize );
    }
    return new THREE.Line( geometry, shaderMaterial );

}

 var vertexHeight = 1000,
    planeDefinition = 200,
    planeSize = 1245,
    totalObjects = 1,
    background = "#002135",
    meshColor = "#005e97"; 

/* var camera = Graph.camera(); //new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 400000)
 camera.position.z = 10000;
camera.position.y = 10000;  */

var scene = Graph.scene();
scene.fog = new THREE.Fog(background, 1, 300000);

/* var planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, planeDefinition, planeDefinition);
var plane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({
    color: meshColor,
    wireframe: true
})); */

const worldWidth = 256, worldDepth = 256,
worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
const geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
geometry.rotateX( - Math.PI / 2 ); 
geometry.translate(0,-7000,0);
const data = generateHeight( worldWidth, worldDepth );
const vertices = geometry.attributes.position.array;

for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {

    vertices[ j + 1 ] = data[ i ] * 10;

}
let mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: meshColor } ) );
scene.add( mesh );

/* plane.rotation.x -= Math.PI * .5;
plane.position.set = new THREE.Vector3( -10, -100, 0 );

scene.add(plane); */


wavesBuffer(15,10); 

/* function updatePlane() {
    const positionAttribute = planeGeo.geometry.getAttribute( 'position' );
    const vertex = new THREE.Vector3();
    for ( let vertexIndex = 0; vertexIndex < positionAttribute.count; vertexIndex ++ ) {
        vertex.fromBufferAttribute( positionAttribute, vertexIndex );
        // do something with vertex
    }

    var vertices = planeGeo.attributes.normal.array[2];
    for (var i = 0; i < vertices.length ; i++) {
        vertices[i].z += Math.random() * vertexHeight - vertexHeight;
        vertices[i]._myZ = vertices[i].z
    }
    
};
 */

 function wavesBuffer( waveSize, magnitude ){

    /* var pos = planeGeo.attributes.position;
    let center = new THREE.Vector3(0,0,0);
    var vec3 = new THREE.Vector3(); // for re-use

    const theTime = performance.now() * .001;
    for ( var i = 0, l = pos.count; i < l; i ++ ) {
        vec3.fromBufferAttribute(pos, i);
        vec3.sub(center);
        var z = Math.sin( vec3.length() /- waveSize + (theTime)) * magnitude;
        pos.setZ(i, z);
    }
    pos.needsUpdate = true */
    /* const worldWidth = 256, worldDepth = 256,
				worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
    const data = generateHeight( worldWidth, worldDepth );
    const vertices = planeGeo.attributes.position.array;

    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
        vertices[ j + 1 ] = data[ i ] * 10;
    } */
} 

/* render();

var count = 0
function render() {
    requestAnimationFrame(render);
    // camera.position.z -= 150;
    var x = camera.position.x;
    var z = camera.position.z;
    camera.position.x = x * Math.cos(0.001) + z * Math.sin(0.001) - 10;
    camera.position.z = z * Math.cos(0.001) - x * Math.sin(0.001) - 10;
    camera.lookAt(new THREE.Vector3(0, 8000, 0))

     for (var i = 0; i < planeGeo.vertices.length; i++) {
        var z = +planeGeo.vertices[i].z;
        planeGeo.vertices[i].z = Math.sin(( i + count * 0.00002)) * (planeGeo.vertices[i]._myZ - (planeGeo.vertices[i]._myZ* 0.6))
        plane.geometry.verticesNeedUpdate = true;

        count += 0.1
    } 

    renderer.render(scene, camera);
} */

function generateHeight( width, height ) {

    const size = width * height, data = new Uint8Array( size ),
        perlin = new ImprovedNoise(), z = Math.random() * 100;

    let quality = 1;

    for ( let j = 0; j < 4; j ++ ) {

        for ( let i = 0; i < size; i ++ ) {

            const x = i % width, y = ~ ~ ( i / width );
            data[ i ] += Math.abs( perlin.noise( x / quality, y / quality, z ) * quality * 1.75 );

        }

        quality *= 5;

    }

    return data;

}