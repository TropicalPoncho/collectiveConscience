import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const colorsArray = [
    "#8AE2C8",
    "#578CCB",
    "#9900FF",
    "#FF0074",
    "#FFBC00",
    "#111111",
    "#FFFFFF"
];

var container;
let renderer, scene, camera;
let line1, line2, line3, line4, uniforms;

const loader = new FontLoader();
var fonts = {GothamBlack: null, RobotoBlackItalic: null};
loader.load( '/fonts/Gotham-Black.json', function (font1) {
    fonts.GothamBlack = font1;
    loader.load('/fonts/Roboto-BlackItalic.json', function (font2){
        fonts.RobotoBlackItalic = font2;
        init(fonts);
        animate();
    });
} );

var settings = {
    fontSize: 50,
    height: 40,
    tZ: -70,
}

var x = window.matchMedia("(max-width: 600px)");
if(x.matches){
    settings.fontSize = 15;
    settings.height = 10;
    settings.tZ = -20;
};


function init(font) {
    container = document.getElementById( 'navScene' );

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 400;

    scene = new THREE.Scene();

/*     const axesHelper = new THREE.AxesHelper( 100 );
    scene.add( axesHelper ); */

    uniforms = {

        amplitude: { value: 5.0 },
        opacity: { value: 0.3 },
        color: { value: new THREE.Color( 0xEEEEEE ) }

    };

    const shaderMaterial = new THREE.ShaderMaterial( {

        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexshader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true

    } );

    const material = new THREE.MeshPhongMaterial( { color: colorsArray[0] } );

    const geometrySoma = new TextGeometry( 'SOMA', {
        font: font.GothamBlack,
        size: settings.fontSize,
        height: settings.height,
        curveSegments: 10,
        bevelThickness: 5,
        bevelSize: 1.5,
        bevelEnabled: true,
        bevelSegments: 10,
    } );

    const geometryBeta = new TextGeometry( 'beta', {
        font: font.RobotoBlackItalic,
        size: settings.fontSize,
        height: settings.height / 3,
        curveSegments: 15,
        bevelThickness: 5,
        bevelSize: 1.5,
        bevelEnabled: true,
        bevelSegments: 15,
    } );

    geometrySoma.center();
    geometryBeta.translate(0,settings.tZ,0);

    const geometry26 = new TextGeometry( '25', {
        font: font.RobotoBlackItalic,
        size: settings.fontSize,
        height: settings.height / 3,
        curveSegments: 15,
        bevelThickness: 5,
        bevelSize: 1.5,
        bevelEnabled: true,
        bevelSegments: 15,
    } );

    const geometryNov = new TextGeometry( 'nov', {
        font: font.RobotoBlackItalic,
        size: settings.fontSize,
        height: settings.height / 3,
        curveSegments: 15,
        bevelThickness: 5,
        bevelSize: 1.5,
        bevelEnabled: true,
        bevelSegments: 15,
    } );

    geometry26.center();
    geometry26.translate(0,-150,0);
    geometryNov.translate(0,-220,0);
   /*  const count = geometry.attributes.position.count;

    const displacement = new THREE.Float32BufferAttribute( count * 3, 3 );
    geometry.setAttribute( 'displacement', displacement );

    const customColor = new THREE.Float32BufferAttribute( count * 3, 3 );
    geometry.setAttribute( 'customColor', customColor );

    const color = new THREE.Color( 0xEEEEEE );

    for ( let i = 0, l = customColor.count; i < l; i ++ ) {
        color.setHSL( i / l, 0.5, 0.5 );
        color.toArray( customColor.array, i * customColor.itemSize );
    }
 */
    line1 = new THREE.Mesh( geometrySoma, material );
    line2 = new THREE.Mesh( geometryBeta, material );
    line3 = new THREE.Mesh( geometry26, material );
    line4 = new THREE.Mesh( geometryNov, material );
    
    //line.rotation.x = 0.2;
    scene.add( line1 );
    scene.add( line2 );
    scene.add( line3 );
    scene.add( line4 );
    
    const dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
    dirLight.position.set( 0, 0, 1 ).normalize();
    scene.add( dirLight );

    const pointLight = new THREE.PointLight( 0xffffff, 1.5 );
    pointLight.position.set( 0, 100, 90 );
    scene.add( pointLight );

    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true} );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( container.offsetWidth , container.offsetHeight );
    //renderer.outputEncoding = THREE.sRGBEncoding;

    container.appendChild( renderer.domElement );
}

function animate() {

    requestAnimationFrame( animate );

    render();
}

function render() {

    const time = Date.now() * 0.001;

    //line.rotation.y = 0.25 * time;

    uniforms.amplitude.value = Math.sin( 0.5 * time );
    uniforms.color.value.offsetHSL( 0.0005, 0, 0 );

    /* const attributes = line.geometry.attributes;
    const array = attributes.displacement.array;

    for ( let i = 0, l = array.length; i < l; i += 3 ) {

        array[ i ] += 0.3 * ( 0.5 - Math.random() );
        array[ i + 1 ] += 0.3 * ( 0.5 - Math.random() );
        array[ i + 2 ] += 0.3 * ( 0.5 - Math.random() );

    }

    attributes.displacement.needsUpdate = true; */

    renderer.render( scene, camera );
}