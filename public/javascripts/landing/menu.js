import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
export default class Menu {
    
    scene;
    renderer;
    camera;

    constructor(Mundo){

        this.scene = Mundo.scene;
        this.renderer = Mundo.renderer;
        this.camera = Mundo.camera;

        const loader = new FontLoader();
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
        } );

        
    }
}