import { initGraph , aimNodeFromId , takeScreenshot, activateZoomToFit, activateOrbit, resetOrbit, stopOrbit} from "./landing/indexNetwork.js";


jQuery(function(){
    var Graph = initGraph('contentNetwork');
    
    $(document).on('click', '#takeScreenshot', function(){
        takeScreenshot();
    });

});
