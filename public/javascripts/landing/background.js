import Utils from '../Utils.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
export default class Background {

    scene;
    renderer;
    camera;

    // custom global variables
    video;
    videoImage; 
    videoImageContext; 
    videoTexture;

    backgroundColor = 0x111111;
    mountainsHeight = -600;

    globalUniforms = {
        bloom: {value: 0},
        time: {value: 0},
        aspect: {value: innerWidth / innerHeight}
    };
 
    constructor(Mundo){

        //Sizes:
        const worldWidth = 1024, worldDepth = 1024,
        worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;

        this.scene = Mundo.scene;
        this.renderer = Mundo.renderer;
        this.camera = Mundo.camera;

        var vertexHeight = 1000,
            planeDefinition = 200,
            planeSize = 1245,
            totalObjects = 1,
            meshColor = "#005e97"; 

        //this.scene.fog = new THREE.Fog(this.backgroundColor, 1, 300000);

        if(this.backgroundColor){
            this.scene.background = new THREE.Color( this.backgroundColor ); 
        }
        
        /* const axesHelper = new THREE.AxesHelper( 1000 );
        this.scene.add( axesHelper );   */
        
        //Add video texture:
        // create the video element
        /* this.video = document.createElement( 'video' );
        this.video.id = 'video';
        this.video.type = ' video/ogg; codecs="theora, vorbis" ';
        this.video.src = "/videos/fluidback.mp4";
        this.video.loop = true;
        this.video.muted = true;
        this.video.load(); // must call after setting/changing source
        var playPromise = this.video.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Automatic playback started!
                // Show playing UI.
            })
            .catch(error => {
                // Auto-play was prevented
                // Show paused UI.
            });
        }

        this.videoImage = document.createElement( 'canvas' );
        this.videoImage.width = 256;
        this.videoImage.height = 256;

        this.videoImageContext = this.videoImage.getContext( '2d' );
        // background color if no video present
        this.videoImageContext.fillStyle = '#233456';
        this.videoImageContext.fillRect( 0, 0, this.videoImage.width, this.videoImage.height );

        this.videoTexture = new THREE.Texture( this.videoImage );
        this.videoTexture.minFilter = THREE.LinearFilter;
        this.videoTexture.magFilter = THREE.LinearFilter;

        

        //Geometry
        const geometry = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
        geometry.rotateX( - Math.PI / 2 ); 
        const data = Utils.generateHeight( worldWidth, worldDepth ); 
        const vertices = geometry.attributes.position.array;
        for ( let i = 0, j = 0, l = vertices.length; i < l; i ++, j += 3 ) {
            vertices[ j + 1 ] = data[ i ] * 10;
        }
        
        //Mesh
        var movieMaterial = new THREE.MeshBasicMaterial( { map: this.videoTexture, overdraw: true, side:THREE.DoubleSide } );
        let mesh = new THREE.Mesh( geometry, movieMaterial );
        mesh.position.y = this.mountainsHeight;
        this.scene.add( mesh );  */

        //Add Plane:
        /* var planeGeo = new THREE.PlaneGeometry(planeSize, planeSize, planeDefinition, planeDefinition);
        var plane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({
            color: meshColor,
            wireframe: true
        })); */
        /* 
            plane.rotation.x -= Math.PI * .5;
            plane.position.set = new THREE.Vector3( -10, -100, 0 );
        */

        //Other Geometry
        const piso = new THREE.PlaneGeometry( 5000, 5000, worldWidth - 1, worldDepth - 1 );
        piso.rotateX( - Math.PI / 2 ); 
        const data2 = Utils.generateHeight( worldWidth , worldDepth ); 
        const vertices2 = piso.attributes.position.array;
        for ( let i = 0, j = 0, l = vertices2.length; i < l; i ++, j += 3 ) {
            vertices2[ j + 1 ] = data2[ i ] * 4; //Intensidad
        }

        let localUniforms = {
            color1: {value: new THREE.Color(0x000000)}, 
            color2: {value: new THREE.Color(0xEEEEEE)},
        }
        let m = new THREE.MeshStandardMaterial({
            roughness: 0.125,
            metalness: 0.875,
            onBeforeCompile: shader => {
                shader.uniforms.time = this.globalUniforms.time;
                shader.uniforms.color1 = localUniforms.color1;
                shader.uniforms.color2 = localUniforms.color2;
                shader.vertexShader = `
                varying vec3 rPos;
                ${shader.vertexShader}
                `.replace(
                `#include <beginnormal_vertex>`,
                `#include <beginnormal_vertex>
                    vec3 p0 = position;
                `
                )
                .replace(
                `#include <begin_vertex>`,
                `#include <begin_vertex>
                    rPos = p0;
                `
                );
                //console.log(shader.vertexShader);
                shader.fragmentShader = `
                varying vec3 rPos;
                ${shader.fragmentShader}
                `
                .replace(
                `#include <dithering_fragment>`,
                `#include <dithering_fragment>
                    
                    float coord = length(rPos.xyz);

                    // Compute anti-aliased world-space grid lines
                    float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
                
                    // Just visualize the grid lines directly
                    float color = 1.0 - min(line, 1.0);
                
                    // Apply gamma correction
                    color = pow(color, 1.0 / 2.2);
                    gl_FragColor = vec4(vec3(color), 1.0);
                    
                `
                );
                //console.log(shader.fragmentShader);
            }
        });
        var pisoMesh = new THREE.Mesh(piso, m);
        const wireframe = new THREE.WireframeGeometry( piso );
        
        const line = new THREE.LineSegments( wireframe );
        line.material.depthTest = true;
        line.material.opacity = 0.25;
        line.material.transparent = true;
        
        line.position.y = this.mountainsHeight;
        this.scene.add( line );
        //this.scene.add( pisoMesh );
/*         var piso2 = piso;
        piso2.rotateX( - Math.PI / 2.5 ); 
        const wireframe2 = new THREE.WireframeGeometry( piso );
        const line2 = new THREE.LineSegments( wireframe2 );
        line2.position.y = this.mountainsHeight * 2;
        this.scene.add( line2 ); */
        /* const loader = new FontLoader();
        var scene = this.scene;
        var height = this.mountainsHeight;
        loader.load( '/fonts/Briller_Regular.json', function ( font ) {

            const geometry = new TextGeometry( 'TROPICAL PONCHO', {
                font: font,
                size: 150,
                height: 20,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 10,
                bevelSize: 8,
                bevelOffset: 0,
                bevelSegments: 5
            } );
            var material = new THREE.MeshBasicMaterial( { overdraw: true, side:THREE.DoubleSide } );
            let meshText = new THREE.Mesh( geometry, material );
            //meshText.position.y = height * -2.5;
            meshText.position.z = -8000;
            meshText.position.x = -2000;
            meshText.position.y = 2000;
            scene.add( meshText );
        } ); */

        /* const axesHelper = new THREE.AxesHelper( 15000 );
        this.scene.add( axesHelper ); */
        //this.scene.remove(scene.getObjectByName('Light'));
    }

    animate(){
        /* if ( this.video.readyState === this.video.HAVE_ENOUGH_DATA ) 
        {
            this.videoImageContext.drawImage( this.video, 0, 0 );
            if ( this.videoTexture ) 
            this.videoTexture.needsUpdate = true;
        } */
    }
    
}

function createCubeMap(){
    let images = [];

    let c = document.createElement("canvas");
    c.width = 4;
    c.height = c.width;
    let ctx = c.getContext("2d");
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, c.width, c.height);

      for (let j = 0; j < (c.width * c.height) / 2; j++) {
        ctx.fillStyle = Math.random() < 0.5 ? "#a8a9ad" : "#646464";
        ctx.fillRect(
          Math.floor(Math.random() * c.width),
          Math.floor(Math.random() * c.height),
          2,
          1
        );
      }

      images.push(c.toDataURL());
    }
    return new THREE.CubeTextureLoader().load(images);
}