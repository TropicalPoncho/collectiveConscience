import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';

/* import { MeshPhysicalNodeMaterial } from 'three/nodes';
import { nodeFrame } from 'three/addons/renderers/webgl/nodes/WebGLNodes.js';
import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js';   */

var graphData = { "nodes": [], "links": [] };

const Graph = ForceGraph3D()
    (document.getElementById('neuralNetwork'))
    .nodeLabel('name')
    .nodeAutoColorBy('group')
    .cameraPosition({x: -100, y: 0, z: 10})
    //.nodeThreeObjectExtend(true)
    //.linkCurvature('curvature')
    //.linkCurveRotation('rotation')
    .linkDirectionalParticles(2)
    .linkDirectionalParticleSpeed(d => 4 * 0.001)
    .onNodeClick(node => aimNode(node))
    .cameraPosition({x:-100,z:30},{x:100,y:-19,z:-100})
    .nodeThreeObject(node => CreateNodeThreeObject(node))
    .onEngineTick(() => {
        //animate();
        //animateBackground();
        //animateNoise();
    });
    //.linkThreeObject(link => CreateLinesThreeObject(link));

/* const bloomPass = new THREE.UnrealBloomPass();
bloomPass.strength = 0.2;
bloomPass.radius = 1;
bloomPass.threshold = 0.1;
Graph.postProcessingComposer().addPass(bloomPass); */

//Execute for the fist neurons:
ingestGraphData(neurons);

export function ingestGraphData(neurons){
    neurons.forEach((item, index, arr) => {
        graphData.nodes.push({ 
            "id": item._id, 
            "name": item.name ,
            "img": item.imgPath, 
            "val": item.graphVal ?? 3,
            "info": item.info ?? null 
        });
        item.fromId.forEach((fromId) => {
            graphData.links.push({
                source: fromId,
                target: item._id,
                curvature: 0.8, 
                rotation: Math.PI * 3 / 3
            });
        });
    });
    Graph.graphData(graphData);
}

function aimNode(node){
    console.log(`node original position: ${node.x} ${node.y} ${node.z}`);
    // Aim at node from outside it
    const distance = 40;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    const newPos = node.x || node.y || node.z
        ? { x: node.x * distRatio, y: (node.y * distRatio)-100, z: node.z * distRatio }
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
        $neuronInfoElem.removeClass("hidden");
        $("#flyerInfo").addClass("hidden");
    }else{
        $(".neuronInfo").addClass("hidden");
        $("#flyerInfo").removeClass("hidden");
    }
}

function CreateNodeThreeObject(node){
    if(node.img){
        const imgTexture = new THREE.TextureLoader().load(`/images/${node.img}`);
        var material = new THREE.SpriteMaterial({map: imgTexture, transparent: true, side: THREE.DoubleSide, alphaTest: 0.5 });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(20, 20);
        return sprite;
    }else{
        return CreateMarbleObject();
        //return CreateNoiseThreeObject();
        //return CreateMirrorThreeObject();
        //return CreateLinesThreeObject();
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

function CreateMirrorThreeObject(){
    /* const geometry = new THREE.SphereGeometry( 4, 32, 16 ); // radius, segmentsWidth, segmentsHeight
	var mirrorSphereCamera = new THREE.CubeCamera( 0.1, 5000, 256 );
	mirrorSphereCamera.renderTarget.minFilter = THREE.LinearMipMapLinearFilter;
	scene.add( mirrorSphereCamera );
	var mirrorSphereMaterial = new THREE.MeshPhongMaterial( { emissive: 0x8888aa, envMap: mirrorSphereCamera.renderTarget } );
	mirrorSphere = new THREE.Mesh( sphereGeom, mirrorSphereMaterial );
	mirrorSphere.position.set(0, 50, 0);
	mirrorSphereCamera.position = mirrorSphere.position;
    return mirrorSphere; */

    const geometry = new THREE.IcosahedronGeometry( 4, 32 );
    nodeVideoTexture = new THREE.Texture( videoImage );
    nodeVideoTexture.minFilter = THREE.LinearFilter;
    nodeVideoTexture.magFilter = THREE.LinearFilter;
    sphereMaterial = new THREE.MeshBasicMaterial( { envMap: nodeVideoTexture } );
    return new THREE.Mesh( geometry, sphereMaterial );
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
/* function CreateWireframeThreeObject(){
     let uniforms = {
        amplitude: { value: 7.0 },
        opacity: { value: 0.3 },
        color: { value: new THREE.Color( 0xDDDDDD ) }
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
} */

function CreateLinesThreeObject(){
    let uniforms = {
        amplitude: { value: 3.0 },
        opacity: { value: 0.3 },
        color: { value: new THREE.Color( 0xFFBC00 ) }
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

    //Add video texture:
    // create the video element
    video = document.createElement( 'video' );
    video.id = 'video';
    video.type = ' video/ogg; codecs="theora, vorbis" ';
    video.src = "/videos/fluidback.mp4";
    video.load(); // must call after setting/changing source
    var resp = video.play();
    if (resp!== undefined) {
        resp.then(_ => {
            // autoplay starts!
            video.play();
        }).catch(error => {
        //show error
        });
    }

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
    geometry.translate(0,-7000,0);
    const data = generateHeight( worldWidth, worldDepth ); 
    const vertices = geometry.attributes.position.array;
    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
        vertices[ j + 1 ] = data[ i ] * 10;
    }

    //Mesh
    var movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
    let mesh = new THREE.Mesh( geometry, movieMaterial );
    scene.add( mesh );
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

const colorsArray = [
    "#8AE2C8",
    "#578CCB",
    "#9900FF",
    "#FF0074",
    "#FFBC00",
    "#111111",
    "#FFFFFF"
];

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

function animateBackground() 
{
    requestAnimationFrame( animateBackground );
	render();		
	update();
}

function update()
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
	
}

function render() 
{	
	if ( video.readyState === video.HAVE_ENOUGH_DATA ) 
	{
		videoImageContext.drawImage( video, 0, 0 );
		if ( videoTexture ) 
			videoTexture.needsUpdate = true;

        if ( nodeVideoTexture ) 
            nodeVideoTexture.needsUpdate = true;
        
        //sphereMaterial.needsUpdate = true;
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

/* var planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, planeDefinition, planeDefinition);
var plane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({
    color: meshColor,
    wireframe: true
})); */

/* 
    plane.rotation.x -= Math.PI * .5;
    plane.position.set = new THREE.Vector3( -10, -100, 0 );
*/

//wavesBuffer(15,10); 

/* function wavesBuffer( waveSize, magnitude ){

     var pos = planeGeo.attributes.position;
    let center = new THREE.Vector3(0,0,0);
    var vec3 = new THREE.Vector3(); // for re-use

    const theTime = performance.now() * .001;
    for ( var i = 0, l = pos.count; i < l; i ++ ) {
        vec3.fromBufferAttribute(pos, i);
        vec3.sub(center);
        var z = Math.sin( vec3.length() /- waveSize + (theTime)) * magnitude;
        pos.setZ(i, z);
    }
    pos.needsUpdate = true 
    const worldWidth = 256, worldDepth = 256,
				worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;
    const data = generateHeight( worldWidth, worldDepth );
    const vertices = planeGeo.attributes.position.array;

    for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
        vertices[ j + 1 ] = data[ i ] * 10;
    } 
} */

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

