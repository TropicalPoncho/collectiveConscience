import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

const colorsArray = [
    "#8AE2C8", //verde
    "#578CCB", //azul
    "#9900FF", //violeta
    "#FF0074", //magenta
    "#FFBC00", //amarillo
    "#111111", //"negro"
    "#FFFFFF" //blanco
];

var graphData = { "nodes": [], "links": [] };

var globalDefaultSettings = {
    nodeSize: 8,
    cameraDistance: 350,
    backgroundColor: 0x111111,
    aimDistance: 150,
    activeNodeImg: true,
    marbleColorA: colorsArray[2],
    marbleColorB: "#000000",
    myNeuronColor: colorsArray[0],
    imgSize: 50,
    particlesSize: 50,
    linkDistance: 150,
    longDistance: 500,
    somaDistance: 200,
    mountainsHeight: 400
};

//Particles Object PUT IN 
let group;
let container, stats;
const maxParticleCount = 200;
let particleCount = maxParticleCount;

var particlesObjects = [];

let rX, rY, rZ;
let r = 50;
let rHalf;

const effectController = {
    showDots: false,
    showLines: true,
    minDistance: 30,
    limitConnections: true,
    maxConnections: 100,
    particleCount: particleCount
};

var Graph;

//Init graph:
Graph = ForceGraph3D({ controlType: 'orbit'  })
    (document.getElementById('neuralNetwork'))
    .nodeLabel('name')
    .cameraPosition({ z: globalDefaultSettings.cameraDistance })
    .onNodeHover(node => {
        consoleLog(node);
    })
    //.dagMode('zout')
    .cooldownTicks(100)
    .onNodeClick(node => aimNode(node))
    .onEngineTick(() => {
        animateParticles();
    });


var indexNeurons = [{nodes , links}];

indexNeurons.nodes = [{
        "id": 0, 
        "name": "Tropical Poncho",
        "img": 'isologo_blanco.png',
        "imgSize": globalDefaultSettings.imgSize,
        "val": globalDefaultSettings.nodeSize,
        "color": color
    },{
        "id": 1, 
        "name": "Nosotres",
        "val": globalDefaultSettings.nodeSize,
        "color": color,
        "type": "marble"
    },{
        "id": 2, 
        "name": "Obras",
        "val": globalDefaultSettings.nodeSize,
        "color": color,
        "type": "marble"
    },{
        "id": 3, 
        "name": "Convocatoria",
        "val": globalDefaultSettings.nodeSize,
        "color": color,
        "type": "marble"
    },{
        "id": 4, 
        "name": "Contacto",
        "val": globalDefaultSettings.nodeSize,
        "color": color,
        "type": "marble"
    }
];

//assign an array of objects with source and target atributes, where source is always 0 and target goes from 1 to 4 to the indexNeurons.links variable
Graph.graphData(indexNeurons);
Graph.d3Force('link')
    .distance(link => '3' );
Graph.numDimensions(3);

Graph.nodeAutoColorBy('group')
    .linkWidth(1.5)
    .linkOpacity(0.4)
    .linkDirectionalParticleWidth(1)
    .linkDirectionalParticles(4)
    .linkDirectionalParticleSpeed(d => 4 * 0.001)
    .nodeThreeObject(node => CreateNodeThreeObject(node));

export function activateZoomToFit(){
    Graph.onEngineStop(() => Graph.zoomToFit(400));
} 

//For background:
var scene
var renderer
var camera

// custom global variables
var video, videoImage, videoImageContext, videoTexture;

scene = Graph.scene();
renderer = Graph.renderer();
camera = Graph.camera();

window.onresize = function () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

};

initBackground();
animateBackground();

/* const bloomPass = new THREE.UnrealBloomPass();
bloomPass.strength = 0.1;
bloomPass.radius = 0;
bloomPass.threshold = 0.1;
Graph.postProcessingComposer().addPass(bloomPass); */

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

export function aimNodeFromId(neuronId){
    var node = graphData.nodes.find(item => item.id === neuronId);
    Cookies.set("neuron", node.id)
    aimNode(node);
}

function aimNode(node){
    // Aim at node from outside it
    const distance = globalDefaultSettings.aimDistance;
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
        var $neuronInfoElem = $(`.neuronInfo#${node.id}`); //Busco la data de esta neurona
        if(!$neuronInfoElem.length){ //Si no existe lo creo
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
                    var elem = $(`<a class="btn" target="_blank" type="button" href="${item.href}"></a>`);
                    elem.append($(`<i class="ico ig"></i>"Instagram"`));
                    $("<div></div>").append(elem).appendTo($neuronInfoElem);
                });
            }
        }
        $('.neuronInfoContainer > .neuronInfo').addClass("hidden"); //Oculto el anterior
        $neuronInfoElem.removeClass("hidden"); //Muestro el actual
        $("#flyerInfoContent").addClass("hidden"); //Oculto la data original
    }else{
        $(".neuronInfo").addClass("hidden"); //Oculto todas las neuronInfo
        $("#flyerInfoContent").removeClass("hidden"); //Muestro la data original
    }
}

function CreateNodeThreeObject(node){
    if(node.img && globalDefaultSettings.activeNodeImg && !arActive){
        const imgTexture = new THREE.TextureLoader().load(`/images/${node.img}`);
        var material = new THREE.SpriteMaterial({map: imgTexture, transparent: true, side: THREE.DoubleSide, alphaTest: 0.5 });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(node.imgSize, node.imgSize);
        return sprite;
    }else if(node.type && node.type == "PARTICLES"){
        return CreateParticlesObject(node);
    }else if(node.type && node.type == "MARBLE"){
        return CreateMarbleObject(node);
    }else{
        //return CreateMarbleObject(node);
        return CreateLinesThreeObject(node);
        //return CreateNoiseThreeObject();
        //return CreateMirrorThreeObject();
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

    var uniformColor = node.color ?? colorsArray[2];
    let uniforms = {
        amplitude: { value: 7.0 },
        opacity: { value: 0.3 },
        color: { value: new THREE.Color( uniformColor ) }
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
    
    /* const axesHelper = new THREE.AxesHelper( 1000 );
    scene.add( axesHelper );   */
     
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
    const data = generateHeight( worldWidth, worldDepth ); 
    const vertices = geometry.attributes.position.array;
    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
        vertices[ j + 1 ] = data[ i ] * 10;
    }
    
    //Mesh
    var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
    let mesh = new THREE.Mesh( geometry, movieMaterial );
    mesh.position.y = globalDefaultSettings.mountainsHeight;
    scene.add( mesh );


    /* const geometry2 = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
    geometry2.rotateX( - Math.PI / 2 ); 
    const data2 = generateHeight( worldWidth, worldDepth ); 
    const vertices2 = geometry.attributes.position.array;
    for ( let i = 0, j = 0, l = vertices2.length; i < l; i ++, j += 3 ) {
        vertices2[ j + 1 ] = data2[ i ] * 10;
    }
    
    //Mesh
    var movieMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00, side:THREE.DoubleSide, alphaTest: 1 } );
    let mesh2 = new THREE.Mesh( geometry, movieMaterial );
    mesh2.position.y = -250;
    scene.add( mesh2 ); */
    

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

function CreateMarbleObject(node){
   /*  var randomColorA = colorsArray[randomIntFromInterval(0,6)];
    var randomColorB = colorsArray[randomIntFromInterval(0,6)]; */

    var randomColorA = node.color ?? globalDefaultSettings.marbleColorA;
    var randomColorB = globalDefaultSettings.marbleColorB;

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
    requestAnimationFrame( animateParticles );
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



function randomPosNeg() { return Math.round(Math.random()) * 2 - 1; }

function CreateParticlesObject(node){

    var particleObject = {};

    rX = node.particlesSize;
    rY = rX;
    rZ = rX;
    rHalf = rX / 2;

    particleObject.maxParticleCount = node.particles?.maxParticleCount ?? maxParticleCount;
    particleObject.maxConnections = node.particles?.maxConnections ?? effectController.maxConnections;
    particleObject.minDistance = node.particles?.minDistance ?? effectController.minDistance;

    var group = new THREE.Group();

/*  const helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxGeometry( rX, rY, rZ ) ) );
    helper.material.color.setHex( 0xFFFFFF );
    helper.material.blending = THREE.AdditiveBlending;
    helper.material.transparent = true;
    group.add( helper );  
 */

    const segments = particleObject.maxParticleCount * particleObject.maxParticleCount;

    particleObject.positions = new Float32Array( segments * 3 );
    particleObject.colors = new Float32Array( segments * 3 );

    const pMaterial = new THREE.PointsMaterial( {
        color: 0xFFFFFF,
        size: 0.5,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: false
    } );

    particleObject.particles = new THREE.BufferGeometry();
    particleObject.particlePositions = new Float32Array( particleObject.maxParticleCount * 3 );

    particleObject.particlesData = [];

    for ( let i = 0; i < particleObject.maxParticleCount; i ++ ) {

        const x = Math.random() * rX - rX / 2;
        const y = Math.random() * rY - rY / 2;
        const z = Math.random() * rZ - rZ / 2;

        particleObject.particlePositions[ i * 3 ] = x;
        particleObject.particlePositions[ i * 3 + 1 ] = y;
        particleObject.particlePositions[ i * 3 + 2 ] = z;

        // add it to the geometry
        particleObject.particlesData.push( {
            velocity: new THREE.Vector3( randomPosNeg() * 0.1, randomPosNeg() * 0.1, 0 ),
            numConnections: 0
        } );

    }

    particleObject.particles.setDrawRange( 0, particleObject.particleCount );
    particleObject.particles.setAttribute( 'position', new THREE.BufferAttribute( particleObject.particlePositions, 3 ).setUsage( THREE.DynamicDrawUsage ) );

    // create the particle system
    particleObject.pointCloud = new THREE.Points( particleObject.particles, pMaterial );
    group.add( particleObject.pointCloud );

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute( 'position', new THREE.BufferAttribute( particleObject.positions, 3 ).setUsage( THREE.DynamicDrawUsage ) );
    geometry.setAttribute( 'color', new THREE.BufferAttribute( particleObject.colors, 3 ).setUsage( THREE.DynamicDrawUsage ) );

    geometry.computeBoundingSphere();

    geometry.setDrawRange( 0, 0 );

    const material = new THREE.LineBasicMaterial( {
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true
    } );

    particleObject.linesMesh = new THREE.LineSegments( geometry, material );
    group.add( particleObject.linesMesh );
    /* if(node.name == "SOMA"){
    } */
    particlesObjects.push(particleObject);
    return group;
}


function animateParticles() {

    particlesObjects.forEach((item) => { //Para animar todos los objetos

        let particlesData = item.particlesData;
        let positions = item.positions; 
        let colors = item.colors;
        let pointCloud = item.pointCloud;
        let particlePositions = item.particlePositions;
        let linesMesh = item.linesMesh;

        let particleCount = item.maxParticleCount;
        let maxConnections = item.maxConnections;
        let minDistance = item.minDistance;
        
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

    }); 
    
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
