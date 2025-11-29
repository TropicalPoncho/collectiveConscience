import Background from "./graph/background.js";
import Mundo from "./graph/mundo.js";

const globalDefaultSettings = {
    nodeSize: 4,
    imgSize: 50,
};

const colorsArray = [
    "#8AE2C8", //verde
    "#578CCB", //azul
    "#9900FF", //violeta
    "#FF0074", //magenta
    "#FFBC00", //amarillo
    "#111111", //"negro"
    "#FFFFFF" //blanco
];


/* function getAndInsertNeurons(page, fromNeuronId){
    $.get( "/neurons", {fromNeuronId: fromNeuronId, page: page}, function( neurons ) {
        if(neurons.length != 0){
            mundo.insertNodes({nodes: neurons , links: createLinks(nextNeurons[thisNeuronId])}, nextId, showNeuronData);
            page++;
            GetNeurons(page);
        }else{ //Cuando termina de cargar
            //setTimeout(() => { manageNewNeurons(); }, 5000);
        }
    });
} */

jQuery(function(){
    var mundo = new Mundo('contentNetwork', 0, showNeuronData, arActive);
    mundo.addElement(new Background(mundo));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             

    //Maneja la acción de los btn tipo "next"
    $(document).on('click', '.next', async function(){
        var thisNeuronId = $(this).attr('thisNeuronId'); //id NeuronaClickeada
        var synapseType = $(this).attr('synapseType'); //Tipos de neurona
        var nextDimensionId = $(this).attr('nextDimensionId'); //Siguiente dimensión (puede ser igual a la actual)
        var loadType = $(this).attr('loadType');

        if($(this).attr('url')){ //Si tiene url es link externo
            window.location.replace("https://tropicalponcho.art");
        }

        if(loadType == "goInto"){
            $(".floatingInfo").fadeOut(600); //Oculto la data
        }
        
        await mundo.loadNext(synapseType, false, loadType, thisNeuronId, manageMenues);
        
    });

    var bnActive = false;
    $(document).on('click', '.floatingMenu .bn, .lateralFloatingMenu .bn', async function(event){
        var neuronToGo = $(this).attr('neuronId'); //id de neurona clickeada
        
        if($(this).parent().attr('dimensionid') == 0){
            $('.lateralFloatingMenu').fadeOut(500);
        }
/*         if(mundo.dimension == 0){ //Si la dimensión es 0, el menu directamente hay que ocultarlo
            $('[dimensionid="'+mundo.dimension+'"]').fadeOut(500);
        }
         */
        //Modifico btns en focus
        $(this).siblings().removeClass('bnfocus');
        $(this).addClass('bnfocus');

        await mundo.goToNeuron(neuronToGo); //en este caso no debería devolver neuronas nuevas
        manageMenues();
    });
    
    $(document).on("click", '.volver', function( event ) {
        $('[dimensionid="'+mundo.dimension+'"] .bn').removeClass('bnfocus');
        goBack();
    });

    $(document).on("click", '#check', function( event ) {
        if($(this).prop('checked')){
            $(".floatingMenu .bn").show();
            mundo.cameraController.backToBasicsView();
        }else{
            if(bnActive){
                goBack();
            }
        }
    });

    $(document).on("click", '.enviar', function( event ) {
        //Llamo para crear la neurona
        event.preventDefault();
        var data = {
            nickName: $('form #nickname').val(),
            email: $('form #email').val(),
            comentario: $('form #comentario').val()
        }
        $.post( "/neurons", data, function( response ) {
            var newNeuron = response;
            $('.formulario').fadeOut(300,function(){
                $('.gracias').fadeIn(300);
            });
            //Cookies.set("neuron", newNeuron._id); //Agrego la cookie
            //myNeuron = newNeuron._id;
        });
        return false;
    });

    function manageMenues(newNeurons = []){        
        // Actualizamos el menú lateral con las nuevas neuronas
        if(newNeurons && newNeurons.length > 0){
            updateLateralMenu(newNeurons);
        }
    }

    function goBack(){
        $(".floatingMenu .bn").show();
        mundo.cameraController.backToBasicsView();
        $(".floatingInfo").fadeOut(600);
        bnActive = false;
        $('#check').prop('checked', true);
        if(mundo.dimension == 0){
            $(".floatingMenu").removeClass('top');
            $(".floatingTitle").fadeIn(2500);
        }
    }


    //Helper functions
    /* $(document).on('click', '#takeScreenshot', function(){
        takeScreenshot(mundo);
    }); */

    /**
     * Actualiza el menú lateral con botones para las nuevas neuronas
     * @param {Array} neurons - Lista de neuronas cargadas
     */
    function updateLateralMenu(neurons) {
        const $menu = $('.lateralFloatingMenu');
        $menu.empty(); // Limpia el menú actual
        $menu.fadeIn(600);
        // Asignar la dimensión actual al contenedor para que el selector funcione
        $menu.attr('dimensionId', mundo.dimension);

        neurons.forEach(neuron => {
            // Crea el botón con las mismas clases y atributos que espera el event listener existente
            const $btn = $('<button>', {
                class: 'bn',
                id: 'neuron-' + neuron.id, // ID único para el DOM
                neuronId: neuron.id,       // Atributo usado por el click handler
                text: neuron.name || neuron.nickName || 'Sin Nombre'
            });
            $menu.append($btn);
        });
        
    }

    function showNeuronData(node){
        if(window.innerWidth < 800){
            $(".floatingMenu .bn").fadeOut(200, function(){
                $('[neuronid="'+node.id+'"]').fadeIn(200);
            });
            $('#check').prop('checked', true);
            bnActive = true;
        }
        
        $('[dimensionid="'+mundo.dimension+'"] .bn').removeClass('bnfocus');
        $('.bn[neuronid="'+node.id+'"]').addClass('bnfocus');

        var nodeHtml = node.html; //somasData.filter(textNode => textNode.id == node.id)[0];
        if(nodeHtml?.subtitle)
            $(".subtitle").text(nodeHtml.subtitle);
        else
            $(".subtitle").text('');
    
        if(nodeHtml?.info){
            if(Array.isArray(nodeHtml.info)){
                $(".info").text('');
                nodeHtml.info.forEach(p => {
                    $(".info").append($('<p></p>').text(p));
                });
            }else{
                $(".info").text(nodeHtml.info);
            }
        }
        if(nodeHtml?.next){
            // Agregar todos los atributos de next como atributos en .next
            Object.entries(nodeHtml.next).forEach(([key, value]) => {
                $(".next").attr(key, value);
            });
            $(".next").attr("thisNeuronId", node.id);
            if(nodeHtml.next.name){
                $(".next").text(nodeHtml.next.name);
            }else{
                $(".next").text('SEGUIR');
            }
            if(nodeHtml.next.url){
                $(".next").attr("url",nodeHtml.next.url);
            }else{
                $(".next").attr("url","");
            }
            $(".next").show();
        }else{
            $(".next").hide();
        }
        if(node.side == "izq"){
            $(".floatingInfo").addClass("izq");
            $(".floatingInfo").removeClass("der");
        }else{
            $(".floatingInfo").removeClass("izq");
            $(".floatingInfo").addClass("der");
        }
        $(".floatingTitle").fadeOut(600, function(){
            $(".floatingMenu").addClass('top');
        });//Oculto el titulo
        $(".floatingInfo").fadeIn(600); //Muestro la data
    }

});

function takeScreenshot(mundo){
    // open in new window like this
    var w = window.open('', '');
    w.document.title = "Screenshot";
    var img = new Image();
    // Without 'preserveDrawingBuffer' set to true, we must render now
    mundo.render();
    img.src = mundo.renderer.domElement.toDataURL('image/png');
    w.document.body.appendChild(img);  

    /* const imgData = canvas.toBlob( ( blob ) => { 
        const imgEl = document.createElement( 'img' ); 
        imgEl.src = URL.createObjectURL( blob ); 
        document.body.appendChild( imgEl ); 
    }); */
}

