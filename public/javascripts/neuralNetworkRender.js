import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

//import { LightningStrike } from 'three/addons/geometries/LightningStrike.js';
/* import { MeshPhysicalNodeMaterial } from 'three/nodes';
import { floorPowerOfTwo } from 'three/src/math/MathUtils';
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js';   */

const colorsArray = [
    "#8AE2C8",
    "#578CCB",
    "#9900FF",
    "#FF0074",
    "#FFBC00",
    "#111111",
    "#FFFFFF"
];

var graphData = { "nodes": [], "links": [] };

var globalDefaultSettings = {
    nodeSize: 5,
    linkDistance: 30,
    cameraDistance: 500,
    backgroundColor: 0x111111
};

const Graph = ForceGraph3D({ controlType: 'orbit' })
    (document.getElementById('neuralNetwork'))
    .nodeLabel('name')
    .nodeAutoColorBy('group')
    //.linkCurvature('curvature')
    //.linkCurveRotation('rotation')
    .linkWidth(0.3)
    .linkDirectionalParticles(3)
    .linkDirectionalParticleSpeed(d => 4 * 0.001)
    .onNodeClick(node => aimNode(node))
    .cameraPosition({x:-100,z:30},{x:100,y:-19,z:-100})
    .nodeThreeObject(node => CreateNodeThreeObject(node))
    .showNavInfo(false)
    .cameraPosition({ z: globalDefaultSettings.cameraDistance })
    .onNodeHover(node => consoleLog(node) )
    .onEngineTick(() => {
        //animate();
        //animateBackground();
        //animateNoise();
        animateParticles();
    });

//Execute for the fist neurons:
ingestGraphData(neurons);

//Camera orbit
let angle = 0;
setInterval(() => {
    Graph.cameraPosition({
        x: globalDefaultSettings.cameraDistance * Math.sin(angle),
        z: globalDefaultSettings.cameraDistance * Math.cos(angle)
    });
    angle += Math.PI / 3000;
}, 10);

function consoleLog(node){
    if(node){
        console.log(node.id);
    }
}

/*  Graph.d3Force('link')
    .distance(link => {
        (link.distance < 30 && (link.target == '6335d5e37636ed5b3529c543') ) ? 50 : 20;    
    }); */

const bloomPass = new THREE.UnrealBloomPass();
bloomPass.strength = 0.1;
bloomPass.radius = 0;
bloomPass.threshold = 0.1;
Graph.postProcessingComposer().addPass(bloomPass);

export function takeScreenshot() {
    // open in new window like this
    var w = window.open('', '');
    w.document.title = "Screenshot";
    var img = new Image();
    // Without 'preserveDrawingBuffer' set to true, we must render now
    renderer.render(scene, camera);
    img.src = renderer.domElement.toDataURL();
    w.document.body.appendChild(img);  
}

export function ingestGraphData(neurons){
    neurons.forEach((item, index, arr) => {
        graphData.nodes.push({ 
            "id": item._id, 
            "name": item.name,
            "img": item.imgPath,
            "imgActive": item.imgActive ?? false,
            "val": item.graphVal ?? globalDefaultSettings.nodeSize,
            "info": item.info ?? null
        });
        item.fromId.forEach((fromId) => {
            graphData.links.push({
                source: fromId,
                target: item._id,
                curvature: 0.8, 
                rotation: Math.PI * 3 / 3,
                distance: item.distance ?? globalDefaultSettings.linkDistance
            });
        });
    });
    Graph.graphData(graphData);
}

export function aimNodeFromId(neuronId){
    aimNode(graphData.nodes.find(item => item.id === neuronId));
}

function aimNode(node){
    console.log(`node original position: ${node.x} ${node.y} ${node.z}`);
    // Aim at node from outside it
    const distance = 60;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    const newPos = node.x || node.y || node.z
        ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
        : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    Graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
    );
    ingestNodeInfo(node);
}

function ingestNodeInfo(node){
    if(node.info && node.name != "SOMA BETA"){
        var $neuronInfoElem = $(`.neuronInfo#${node.id}`);
        if(!$neuronInfoElem.length){
            $neuronInfoElem = $("<div></div>",{class: "neuronInfo", id: node.id }).appendTo('.neuronInfoContainer');
            $("<h3></h3>").text(node.name).appendTo($neuronInfoElem);
            $("<h4></h4>").text(node.info.sub).appendTo($neuronInfoElem);
            if(node.info.img){
                $('<img src="'+ node.info.img +'">').load(function() {
                    $(this).appendTo($neuronInfoElem);
                });
            }
            $("<p></p>").text(node.info.bio).appendTo($neuronInfoElem);
            if(node.info.links){
                node.info.links.forEach((item, index, arr) => {
                    var elem = $(`<a>${item.name}</a>`, {class:"waves-effect waves-light btn s3", type:"button", href: item.href});
                    $("<div></div>").append(elem).appendTo($neuronInfoElem);
                });
            }
        }
        $('.neuronInfoContainer > .neuronInfo').addClass("hidden");
        $neuronInfoElem.removeClass("hidden");
        $("#flyerInfo").addClass("hidden");
    }else{
        $(".neuronInfo").addClass("hidden");
        $("#flyerInfo").removeClass("hidden");
    }
}

function CreateNodeThreeObject(node){
    if(node.img && node.imgActive){
        const imgTexture = new THREE.TextureLoader().load(`/images/${node.img}`);
        var material = new THREE.SpriteMaterial({map: imgTexture, transparent: true, side: THREE.DoubleSide, alphaTest: 0.5 });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(50, 50);
        return sprite;
    }else if(node.id == "6335d5e37636ed5b3529c543"){
        return CreateParticlesObject();
    }else{
        //return CreateMarbleObject();
        //return CreateNoiseThreeObject();
        //return CreateMirrorThreeObject();
        return CreateLinesThreeObject(node);
        //return new Blob(1.75, 0.3, 0.5, 1.5, 0.12, Math.PI * 1); 
    }
}

function CreateTextThreeObject(){
    const sprite = new SpriteText(node.name);
    sprite.material.depthWrite = true; // make sprite background transparent
    sprite.color = node.color;
    sprite.textHeight = 8;
    return sprite; 
}


/* function CreateNoiseThreeObject(){
      new HDRCubeTextureLoader()
        .setPath( 'https://github.com/mrdoob/three.js/tree/master/examples/textures/cube/pisaHDR/' )
        .load( [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ],
            function ( hdrTexture ) { 

    const geometry = new THREE.SphereGeometry( 4, 64, 32 );

    //const offsetNode = timerLocal();
    //const customUV = add( mul( normalWorld, 10 ), offsetNode );

    // left top

    let material = new MeshPhysicalNodeMaterial();
    //material.colorNode = mx_noise_vec3( customUV );

    let mesh = new THREE.Mesh( geometry, material );
    return mesh;
            }); 
} 

function animateNoise(){
    requestAnimationFrame( animateNoise );

    nodeFrame.update();

    render();
} */

function CreateLinesThreeObject(node){

    let uniforms = {
        amplitude: { value: 7.0 },
        opacity: { value: 0.3 },
        color: { value: new THREE.Color( colorsArray[2] ) }
    };
    const geometry = new THREE.SphereGeometry( node.val , 32, 16 );

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

var scene = Graph.scene();
var renderer = Graph.renderer();
var camera = Graph.camera();
// custom global variables
var video, videoImage, videoImageContext, videoTexture, nodeVideoTexture;
var sphereMaterial;
var keyboard = new THREEx.KeyboardState();

initBackground();
animateBackground();

//Add Plane:
function initBackground(){
    var vertexHeight = 1000,
        planeDefinition = 200,
        planeSize = 1245,
        totalObjects = 1,
        background = "#002135",
        meshColor = "#005e97"; 

    scene.fog = new THREE.Fog(background, 1, 300000);

    if(globalDefaultSettings.backgroundColor){
        scene.background = new THREE.Color( globalDefaultSettings.backgroundColor ); 
    }
    
    const axesHelper = new THREE.AxesHelper( 10000 );
    scene.add( axesHelper );
     
    //Add video texture:
    // create the video element
    video = document.createElement( 'video' );
    video.id = 'video';
    video.type = ' video/ogg; codecs="theora, vorbis" ';
    video.src = "/videos/fluidback.mp4";
    video.loop = true;
    video.muted = true;
    video.load(); // must call after setting/changing source
    video.play();

    videoImage = document.createElement( 'canvas' );
    videoImage.width = 256;
    videoImage.height = 256;

    videoImageContext = videoImage.getContext( '2d' );
    // background color if no video present
    videoImageContext.fillStyle = '#233456';
    videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );

    videoTexture = new THREE.Texture( videoImage );
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;

    //Sizes:
    const worldWidth = 256, worldDepth = 256,
    worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
    //Geometry
    const geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
    geometry.rotateX( - Math.PI / 2 ); 
    geometry.translate(0,10000,0);
    const data = generateHeight( worldWidth, worldDepth ); 
    const vertices = geometry.attributes.position.array;
    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
        vertices[ j + 1 ] = data[ i ] * 10;
    }

    //Mesh
    var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
    let mesh = new THREE.Mesh( geometry, movieMaterial );
    scene.add( mesh );

    //Add Title:
    

}

const heightMapURL = 'https://i.imgur.com/oYS135g.jpeg';
const params = {
    roughness: 0.1,
    iterations: 32,
    depth: 0.6,
    smoothing: 0.2,
    colorA: '#000000',
    colorB: '#00ffaa'
  };

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function CreateMarbleObject(){
    var randomColorA = colorsArray[randomIntFromInterval(0,6)];
    var randomColorB = colorsArray[randomIntFromInterval(0,6)];

    const geometry = new THREE.SphereGeometry(6, 64, 32);
    const material = new THREE.MeshStandardMaterial({ roughness: params.roughness });
    
    // Load heightmap texture
    const heightMap = new THREE.TextureLoader().load(heightMapURL);
    
    // Prevent seam introduced by THREE.LinearFilter
    heightMap.minFilter = THREE.NearestFilter
    
    // Set up local uniforms object
    var uniforms = {
      iterations: { value: params.iterations },
      depth: { value: params.depth },
      smoothing: { value: params.smoothing },
      colorA: { value: new THREE.Color(randomColorA) },
      colorB: { value: new THREE.Color(randomColorB) },
      heightMap: { value: heightMap }
    }
    
    material.onBeforeCompile = shader => {
      // Wire up local uniform references
      shader.uniforms = { ...shader.uniforms, ...uniforms }
      
      // Add to top of vertex shader
      shader.vertexShader = `
        varying vec3 v_pos;
        varying vec3 v_dir;
      ` + shader.vertexShader
      
      // Assign values to varyings inside of main()
      shader.vertexShader = shader.vertexShader.replace(/void main\(\) {/, (match) => match + `
        v_dir = position - cameraPosition; // Points from camera to vertex
        v_pos = position;
      `)
      
      // Add to top of fragment shader
      shader.fragmentShader = `
        uniform vec3 colorA;
        uniform vec3 colorB;
        uniform sampler2D heightMap;
        uniform int iterations;
        uniform float depth;
        uniform float smoothing;
        
        varying vec3 v_pos;
        varying vec3 v_dir;
      ` + shader.fragmentShader
      
      // Add above fragment shader main() so we can access common.glsl.js
      shader.fragmentShader = shader.fragmentShader.replace(/void main\(\) {/, (match) => `
        /**
          * @param rayOrigin - Point on sphere
          * @param rayDir - Normalized ray direction
          * @returns Diffuse RGB color
          */
        vec3 marchMarble(vec3 rayOrigin, vec3 rayDir) {
          float perIteration = 1. / float(iterations);
          vec3 deltaRay = rayDir * perIteration * depth;

          // Start at point of intersection and accumulate volume
          vec3 p = rayOrigin;
          float totalVolume = 0.;

          for (int i=0; i<iterations; ++i) {
            // Read heightmap from current spherical direction
            vec2 uv = equirectUv(normalize(p));
            float heightMapVal = texture(heightMap, uv).r;

            // Take a slice of the heightmap
            float height = length(p); // 1 at surface, 0 at core, assuming radius = 1
            float cutoff = 1. - float(i) * perIteration;
            float slice = smoothstep(cutoff, cutoff + smoothing, heightMapVal);

            // Accumulate the volume and advance the ray forward one step
            totalVolume += slice * perIteration;
            p += deltaRay;
          }
          return mix(colorA, colorB, totalVolume);
        }
      ` + match)
      
      shader.fragmentShader = shader.fragmentShader.replace(/vec4 diffuseColor.*;/, `
        vec3 rayDir = normalize(v_dir);
        vec3 rayOrigin = v_pos;
        
        vec3 rgb = marchMarble(rayOrigin, rayDir);
        vec4 diffuseColor = vec4(rgb, 1.);      
      `)
    }
    
    return new THREE.Mesh(geometry, material)
}

function animateBackground() {
    requestAnimationFrame( animateBackground );
	render();		
	//update();
}

/* function update()
{
	if ( keyboard.pressed("p") )
		video.play();
		
	if ( keyboard.pressed("space") )
		video.pause();

	if ( keyboard.pressed("s") ) // stop video
	{
		video.pause();
		video.currentTime = 0;
	}
	
	if ( keyboard.pressed("r") ) // rewind video
		video.currentTime = 0;

    if( keyboard.pressed("c") ){
        console.log(JSON.stringify(Graph.cameraPosition()));
    }
	
}
 */

function render() 
{	
	if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
	{
		videoImageContext.drawImage( video, 0, 0 );
		if ( videoTexture ) 
			videoTexture.needsUpdate = true;
	}

	renderer.render( scene, camera );
}


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

//Particles Object
let group;
let container, stats;
const particlesData = [];
let positions, colors;
let particles;
let pointCloud;
let particlePositions;
let linesMesh;

const maxParticleCount = 120;
let particleCount = 100;
let rX, rY, rZ;
let rHalf;

const effectController = {
    showDots: false,
    showLines: true,
    minDistance: 15,
    limitConnections: true,
    maxConnections: 20,
    particleCount: 100
};

function randomPosNeg() { return Math.round(Math.random()) * 2 - 1; }

function CreateParticlesObject(){

    rX = 50;
    rY = 50;
    rZ = 50;
    rHalf = rX / 2;

    var group = new THREE.Group();

/*     const helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxGeometry( rX, rY, rZ ) ) );
    helper.material.color.setHex( 0xFFFFFF );
    helper.material.blending = THREE.AdditiveBlending;
    helper.material.transparent = true;
    group.add( helper ); */

    const segments = maxParticleCount * maxParticleCount;

    positions = new Float32Array( segments * 3 );
    colors = new Float32Array( segments * 3 );

    const pMaterial = new THREE.PointsMaterial( {
        color: 0xFFFFFF,
        size: 0.5,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: false
    } );

    particles = new THREE.BufferGeometry();
    particlePositions = new Float32Array( maxParticleCount * 3 );

    for ( let i = 0; i < maxParticleCount; i ++ ) {

        const x = Math.random() * rX - rX / 2;
        const y = Math.random() * rY - rY / 2;
        const z = Math.random() * rZ - rZ / 2;

        particlePositions[ i * 3 ] = x;
        particlePositions[ i * 3 + 1 ] = y;
        particlePositions[ i * 3 + 2 ] = z;

        // add it to the geometry
        particlesData.push( {
            velocity: new THREE.Vector3( randomPosNeg() * 0.1, randomPosNeg() * 0.1, 0 ),
            numConnections: 0
        } );

    }

    particles.setDrawRange( 0, particleCount );
    particles.setAttribute( 'position', new THREE.BufferAttribute( particlePositions, 3 ).setUsage( THREE.DynamicDrawUsage ) );

    // create the particle system
    pointCloud = new THREE.Points( particles, pMaterial );
    group.add( pointCloud );

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setUsage( THREE.DynamicDrawUsage ) );
    geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setUsage( THREE.DynamicDrawUsage ) );

    geometry.computeBoundingSphere();

    geometry.setDrawRange( 0, 0 );

    const material = new THREE.LineBasicMaterial( {
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true
    } );

    linesMesh = new THREE.LineSegments( geometry, material );
    group.add( linesMesh );
    return group;
}


function animateParticles() {
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

        if ( effectController.limitConnections && particleData.numConnections >= effectController.maxConnections )
            continue;

        // Check collision
        for ( let j = i + 1; j < particleCount; j ++ ) {

            const particleDataB = particlesData[ j ];
            if ( effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections )
                continue;

            const dx = particlePositions[ i * 3 ] - particlePositions[ j * 3 ];
            const dy = particlePositions[ i * 3 + 1 ] - particlePositions[ j * 3 + 1 ];
            const dz = particlePositions[ i * 3 + 2 ] - particlePositions[ j * 3 + 2 ];
            const dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

            if ( dist < effectController.minDistance ) {

                particleData.numConnections ++;
                particleDataB.numConnections ++;

                const alpha = 1.0 - dist / effectController.minDistance;

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

/* var planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, planeDefinition, planeDefinition);
var plane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({
    color: meshColor,
    wireframe: true
})); */
/* 
    plane.rotation.x -= Math.PI * .5;
    plane.position.set = new THREE.Vector3( -10, -100, 0 );
*/
