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

    $(document).on('click', '.next', async function(){ // Hacemos la función async
        //var nextId = $(this).attr('id');
        var thisNeuronId = $(this).attr('thisNeuronId');
        var synapseType = $(this).attr('synapseType');
        var loadType = $(this).attr('loadType');

        if($(this).attr('url')){
            window.location.replace("https://tropicalponcho.art");
        }
        if(loadType == "goInto"){
            $(".floatingInfo").fadeOut(600); //Muestro la data
        }
        
        // Esperamos a que mundo cargue y nos devuelva las neuronas
        const newNeurons = await mundo.loadNext(synapseType, false, loadType, thisNeuronId);
        
        // Actualizamos el menú lateral con las nuevas neuronas
        if(newNeurons && newNeurons.length > 0){
            updateLateralMenu(newNeurons);
        }

        /**
         * TODO: Acá se podría hacer más dinámico para que cargue en caso de q no encuentre ya cargada.
         * Debería buscar por nivel/distancia? -> lo de distancia sirve para sinapsis -> aunque puede haber x distancia y q sean muchas.
         * -> en ese caso debería haber un limite de visualización y que se vayan quitando los q se alejan para atrás en "nivel"
         * -> más que nivel sería una magnitud de "distancia cosmica ahr", pero que se debería calcular en base a otra cosa porq si es solo en cuanto a
         * distancia de intermediarios, igual puede tenerse mucho en este nivel. entonces hay que limitar primero por distancia y luego (si excede el limite) 
         * por nivel de afinidad y ese valor debería calcularse mediante KE? -> aleatorio u orden (orden de la relación)! 
         * 
         */
    });

    var bnActive = false;
    $(document).on('click', '.floatingMenu .bn, .lateralFloatingMenu .bn', async function(event){
        var neuronOnFocus = $(this).attr('neuronId');
        
        $('[dimensionid="'+mundo.dimension+'"] .bn').removeClass('bnfocus');
        $(this).addClass('bnfocus');
        
        await mundo.goToNeuron(neuronOnFocus);
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
        
        // Opcional: Limpiar o restaurar el menú lateral al volver
        $('.lateralFloatingMenu').fadeOut(2500);
        $('.lateralFloatingMenu').empty(); 
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
        
        $menu.fadeIn(1000);
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
        //console.log("nodeside:" + node.side);
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

