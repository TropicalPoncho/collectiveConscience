import Utils from '../Utils.js'
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
    mountainsHeight = 400;
 
    constructor(Graph){

        this.scene = Graph.scene();
        this.renderer = Graph.renderer();
        this.camera = Graph.camera();

        var vertexHeight = 1000,
            planeDefinition = 200,
            planeSize = 1245,
            totalObjects = 1,
            background = "#111111",
            meshColor = "#005e97"; 

        this.scene.fog = new THREE.Fog(background, 1, 300000);

        if(this.backgroundColor){
            this.scene.background = new THREE.Color( this.backgroundColor ); 
        }
        
        /* const axesHelper = new THREE.AxesHelper( 1000 );
        this.scene.add( axesHelper );   */
        
        //Add video texture:
        // create the video element
        this.video = document.createElement( 'video' );
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

        //Sizes:
        const worldWidth = 256, worldDepth = 256,
        worldHalfWidth = worldWidth / 2, worldHalfDepth = worldDepth / 2;

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
        this.scene.add( mesh );

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
        const piso = new THREE.PlaneGeometry( 7500, 7500, worldWidth - 1, worldDepth - 1 );
        piso.rotateX( - Math.PI / 2 ); 
        const data2 = Utils.generateHeight( worldWidth, worldDepth ); 
        const vertices2 = piso.attributes.position.array;
        for ( let i = 0, j = 0, l = vertices2.length; i < l; i ++, j += 3 ) {
            vertices2[ j + 1 ] = data2[ i ] * 10;
        }

        const wireframe = new THREE.WireframeGeometry( piso );

        const line = new THREE.LineSegments( wireframe );
        line.material.depthTest = true;
        line.material.opacity = 0.25;
        line.material.transparent = true;

        /* var pisoMaterial = new THREE.MeshBasicMaterial( {side: THREE.DoubleSide} );
        let pisoMesh = new THREE.Mesh( geometry, pisoMaterial ); */

        line.position.y = this.mountainsHeight * -3;
        this.scene.add( line );

    }

    animate(){
        if ( this.video.readyState === this.video.HAVE_ENOUGH_DATA ) 
        {
            this.videoImageContext.drawImage( this.video, 0, 0 );
            if ( this.videoTexture ) 
            this.videoTexture.needsUpdate = true;
        }
    }
    
}