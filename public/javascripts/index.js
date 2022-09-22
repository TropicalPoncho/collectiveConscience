const logo = document.querySelector(".logo_intro");
const zoomElement = document.querySelector(".zoom");

let zoom = 1;
var ZOOM_SPEED = 0.3;

document.addEventListener("wheel", function(e) {  
    if(zoomElement.clientWidth > 27000){
        if(e.deltaY > 0){    
            if(zoomElement.clientWidth > 1000){
                ZOOM_SPEED = 1;
            }
            zoomElement.style.transform = `scale(${zoom += ZOOM_SPEED})`;  
        }else{    
            zoomElement.style.transform = `scale(${zoom -= ZOOM_SPEED})`;  }
    }else{ //todo negro
        
    }

});

