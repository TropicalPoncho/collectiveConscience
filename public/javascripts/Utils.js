import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
export default class Utils {
    static generateHeight( width, height ) {

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
    static randomPosNeg() { return Math.round(Math.random()) * 2 - 1; }

    static randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
}
