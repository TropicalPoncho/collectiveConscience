import Background from "./landing/background.js";
import Mundo from "./landing/mundo.js";
//import somasData from "./landing/somasData.json";

fetch('./landing/mundo.js')
    .then((response) => response.json())
    .then((json) => somasData = json);

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

var indexNeurons = [ {
    "id": 0,
    "name": "Nosotres",
    "img": 'isologo_blanco.png',
    "color": colorsArray[6],
    "imgSize": globalDefaultSettings.imgSize,
    "val": globalDefaultSettings.nodeSize,
    "type": "Image"
}, {
    "id": 1, 
    "name": "Obras",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0,distance: 100}],
    "type": "Twist",
    "style": {
        uNoiseStrength: { type: "f", value: 12 },
        uNoiseDensity: { type: "f", value: 9.0 },
        uIntensity: { type: "f", value: .2 },
        uFrequency: { type: "f", value: 1 },
        uAmplitude: { type: "f", value: .4 },
        uBrightness: { value: new THREE.Vector3(0.5, 0.5, 0.8) },
        uContrast: { value: new THREE.Vector3(0.7, 0.2, 0.5) },
        uOscilation: { value: new THREE.Vector3(.8, 1.0, 1.0) },
        uPhase: { value: new THREE.Vector3(0.00, 0.33, 0.67) }
    }
} ,{
    "id": 2, 
    "name": "Audiovisuales",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100}],
    "type": "Marble",
    "style": {
        uNoiseStrength: { type: "f", value: 8 },
        uNoiseDensity: { type: "f", value: 1.0 },
        uIntensity: { type: "f", value: 1 },
        uFrequency: { type: "f", value: .5 },
        uAmplitude: { type: "f", value: .2 },
        uBrightness: { value: new THREE.Vector3(0.2, 0.9, 0.3) },
        uContrast: { value: new THREE.Vector3(0.5, 0.7, 0.5	) },
        uOscilation: { value: new THREE.Vector3(2.0, 1.0, 0) },
        uPhase: { value: new THREE.Vector3(0.50, 0.20, 0.25) }
    }
},{
    "id": 3, 
    "name": "Editorial",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100},{id:2, distance: 100}],
    "type": "Twist",
    "style":{
        color1: {value: new THREE.Color(0x335566)},
        color2: {value: new THREE.Color(0x9900FF)}
    }
},{
    "id": 4, 
    "name": "Tecnología",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100},{id:2, distance: 100},{id:3, distance: 100}],
    "type": "Lights",
    "style":{
        colorR: { type: "f", value: .5},
        colorG: { type: "f", value: .6},
        colorB: { type: "f", value: .2},
        colorChange: { type: "f", value: 7}
    }
},{
    "id": 5, 
    "name": "Laboratorios",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100},{id:2, distance: 100},{id:3, distance: 100},{id:4, distance: 100}],
    "type": "Lights",
    "style":{
        weight: { type: "f", value: 10 },
        colorR: { type: "f", value: .4},
        colorG: { type: "f", value: .2},
        colorB: { type: "f", value: .7},
        colorChange: { type: "f", value: .3},
    }
},{
    "id": 6, 
    "name": "Amigues",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100},{id:1, distance: 100},{id:2, distance: 100},{id:3, distance: 100},{id:4, distance: 100},{id:5, distance: 100}],
    "type": "Lights",
    "style":{
        weight: { type: "f", value: 13}
    }
} ,{
    "id": 7, 
    "name": "Contacto",
    "val": globalDefaultSettings.nodeSize,
    "color": colorsArray[6],
    "links": [{id:0, distance: 100}, {id:1, distance: 100}, {id:2, distance: 100}, {id:3, distance: 100}, {id:4, distance: 100}, {id:5, distance: 100}, {id:6, distance: 100}],
    "type": "Twist",
    "style":{
        uNoiseStrength: { type: "f", value: 3},
        uNoiseDensity: { type: "f", value: 14.0 },
        uIntensity: { type: "f", value: 4 },
        uFrequency: { type: "f", value: 2 },
        uAmplitude: { type: "f", value: 6 },
        uBrightness: { value: new THREE.Vector3(0.6, 0.7, 0.5) },
        uContrast: { value: new THREE.Vector3(0.5, 0.5, 0.5	) },
        uOscilation: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        uPhase: { value: new THREE.Vector3(0.70, 0.20, 0.20) }
    }
}];

var obras = [
    { //Obras -------------------------------------------
        "id": 10,
        "name": "Kutral",
        "imgSize": globalDefaultSettings.imgSize,
        "val": globalDefaultSettings.nodeSize - 2,
        "links": [{id:1, distance: 60}],
        "type": "Fire"
    },{
        "id": 11, 
        "name": "Tempistica I",
        "val": globalDefaultSettings.nodeSize - 2,
        "color": colorsArray[1],
        "links": [{id:10, distance: 60}],
        "type": "Twist"
    },{
        "id": 12, 
        "name": "Tempistica II",
        "val": globalDefaultSettings.nodeSize - 2,
        "color": colorsArray[2],
        "links": [{id:11, distance: 60}],
        "type": "Twist"
    },{
        "id": 13, 
        "name": "Tropical Posporno",
        "val": globalDefaultSettings.nodeSize - 2,
        "color": colorsArray[3],
        "links": [{id:1, distance: 70}],
        "type": "Lights",
        "style":{
            colorR: { type: "f", value: .9},
            colorG: { type: "f", value: .0},
            colorB: { type: "f", value: .0},
            colorChange: { type: "f", value: 7}
        }
        /* "img":"posporno.png",
        "imgSize": 30, */
    },{
        "id": 14, 
        "name": "SOMA beta",
        "val": globalDefaultSettings.nodeSize - 2,
        "color": colorsArray[4],
        "links": [{id:11, distance: 60}],
        "type": "Marble"
    },{
        "id": 15, 
        "name": "SOMA",
        "val": globalDefaultSettings.nodeSize - 2,
        "color": colorsArray[4],
        "links": [{id:14, distance: 60}],
        "type": "Lights"
    },{
        "id": 16, 
        "name": "NUDO",
        "val": globalDefaultSettings.nodeSize - 2,
        "color": colorsArray[4],
        "links": [{id:1, distance: 80}],
        "type": "Image",
        "img":"NUDO.png",
        "imgSize": 30,
    },{
        "id": 17, 
        "name": "C.E.P.A.",
        "val": globalDefaultSettings.nodeSize - 2,
        "color": colorsArray[4],
        "links": [{id:1, distance: 90}],
        "type": "Image",
        "img":"CEPA.png",
        "imgSize": 50
    },{
        "id": 18, 
        "name": "Concierto Público #4 ft Tropical Poncho",
        "val": globalDefaultSettings.nodeSize - 2,
        "color": colorsArray[4],
        "links": [{id:1, distance: 100}],
        "type": "Marble"
    },{
        "id": 19,
        "name": "Tropical Posporno: Distopia",
        "val": globalDefaultSettings.nodeSize - 2,
        "color": colorsArray[4],
        "links": [{id:13, distance: 60}],
        "type": "Image",
        "img":"distopia.png",
        "imgSize": 60
    },{
        "id": 20,
        "name": "ESPORA",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[2],
        "links": [{id:10, distance: 90}],
        "type": "Text"
    }
];

//var espora = (typeof espora !== 'undefined');
var esporaNeurons = [
    {
        "id": 20,
        "name": "ESPORA",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[2],
        "type": "Image",
        "img": "espora.png",
        "imgSize": 80,
        "order": 0
    },
    {
        "id": 0,
        "name": "Nosotres",
        "color": colorsArray[6],
        "imgSize": globalDefaultSettings.imgSize,
        "val": globalDefaultSettings.nodeSize,
        "links": [{id:20, distance: 100}],
        "img": 'isologo_blanco.png',
        "type": "Image",
        "order": 0
    },
    {
        "id": 202,
        "name": "WIP",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[2],
        "links": [{id:0, distance: 100},{id:20, distance: 100}],
        "type": "Image",
        "img":"WIP.png",
        "imgSize": 70,
        "order": 0
    },
    {
        "id": 2021,
        "name": "CONVERSATORIO",
        "val": globalDefaultSettings.nodeSize+5,
        "color": colorsArray[6],
        "links": [{id:20, distance: 80}],
        "type": "SimpleText",
        "order": 1
    },
    {
        "id": 2022,
        "name": "OBRA",
        "val": globalDefaultSettings.nodeSize+5,
        "color": colorsArray[6],
        "links": [{id:20, distance: 80}],
        "type": "SimpleText",
        "order": 1
    },
    {
        "id": 2023,
        "name": "LABORATORIO",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[6],
        "links": [{id:20, distance: 80}],
        "type": "SimpleText",
        "order": 1
    },
    {
        "id": 2024,
        "name": "ESCULTURA 3D",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[4],
        "links": [{id:2022, distance: 80}],
        "type": "SimpleText",
        "order": 2
    },
    {
        "id": 2025,
        "name": "VJ",
        "val": globalDefaultSettings.nodeSize + 3,
        "color": colorsArray[4],
        "links": [{id:2022, distance: 80}],
        "type": "SimpleText",
        "order": 2
    },
    {
        "id": 2026,
        "name": "LIVE SET",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[4],
        "links": [{id:2022, distance: 80}],
        "type": "SimpleText",
        "order": 2
    },
    {
        "id": 2027,
        "name": "MUESTRA INTERACTIVA",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[4],
        "links": [{id:2022, distance: 80}],
        "type": "SimpleText",
        "order": 2
    },
    {
        "id": 2028,
        "name": "LIVE CODING",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[4],
        "links": [{id:2022, distance: 80}],
        "type": "SimpleText",
        "order": 2
    },
    {
        "id": 20221,
        "name": "Julieta Agriano",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[0],
        "links": [{id:2021, distance: 80},{id:202, distance: 80}],
        "type": "SimpleText",
        "order": 3
    },
    {
        "id": 20222,
        "name": "Ep.Di",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[0],
        "links": [{id:2021, distance: 80},{id:2025, distance: 80}],
        "type": "SimpleText",
        "order": 3
    },
    {
        "id": 20223,
        "name": "Ari",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[0],
        "links": [{id:2021, distance: 80},{id:2028, distance: 80}],
        "type": "SimpleText",
        "order": 3
    },
    {
        "id": 20224,
        "name": "Mel",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[0],
        "links": [{id:2021, distance: 80},{id:2024, distance: 80}],
        "type": "SimpleText",
        "order": 3
    },
    {
        "id": 20225,
        "name": "Rama Cerratto",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[0],
        "links": [{id:2021, distance: 80},{id:0, distance: 80}],
        "type": "SimpleText",
        "order": 3
    },
    {
        "id": 20226,
        "name": "La Er",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[0],
        "links": [{id:2021, distance: 80},{id:0, distance: 80}],
        "type": "SimpleText",
        "order": 3
    },
    {
        "id": 20227,
        "name": "Clau Brito",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[0],
        "links": [{id:2021, distance: 80},{id:0, distance: 80}],
        "type": "SimpleText",
        "order": 3
    },
    {
        "id": 20228,
        "name": "Luz Alta",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[0],
        "links": [{id:2021, distance: 80},{id:0, distance: 80}],
        "type": "SimpleText",
        "order": 3
    },
    {
        "id": 20229,
        "name": "Marian Basti",
        "val": globalDefaultSettings.nodeSize,
        "color": colorsArray[0],
        "links": [{id:2021, distance: 80},{id:2027, distance: 80}],
        "type": "SimpleText",
        "order": 3
    }
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
var isEspora = (typeof espora != 'undefined');
jQuery(function(){
    var neuronsToLoad = isEspora ? esporaNeurons.filter(node => node.order == 0) : indexNeurons;
    var mundo = new Mundo('contentNetwork', {nodes: neuronsToLoad , links: createLinks(neuronsToLoad)}, showNeuronData);
    mundo.addElement(new Background(mundo));

    if(isEspora){
        $(".floatingMenu").hide();
        $(".floatingTitle").hide();
    }

    $(document).on('click', '.next', function(){
        var nextId = $(this).attr('id');
        var thisNeuronId = $(this).attr('thisNeuronId');

        if($(this).attr('url')){
            window.location.replace("https://tropicalponcho.art");
        }

        if(thisNeuronId == 1){
            mundo.insertNodes({nodes: obras , links: createLinks(obras)}, nextId, goToNeuron); //Cargo las que siguen y luego voy
        }else if(thisNeuronId == 20 || thisNeuronId == 202){
            var nextNeurons = esporaNeurons.filter(node => node.order != 0);
            mundo.insertNodes({nodes: nextNeurons , links: createLinks(nextNeurons)}, nextId, false);
            mundo.backToBasicsView(-50, 300);
            $('.data').fadeOut(300, function(){
                $('.formulario').fadeIn(300);
            });
        }else{
            goToNeuron(nextId); //Si no, solo voy a la siguiente
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
    $(document).on('click', '.floatingMenu .bn', function(){
        goToNeuron($(this).attr('neuronId'));
    });
    
    $(document).on("click", '.volver', function( event ) {
        /* $(".floatingMenu").removeClass("der"); */
        /* $(".floatingMenu").removeClass("izq"); */
        goBack();
    });

    $(document).on("click", '#check', function( event ) {
        if($(this).prop('checked')){
            $(".floatingMenu .bn").show();
            mundo.backToBasicsView();
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
        mundo.backToBasicsView();
        if(!isEspora){
            $(".floatingTitle").fadeIn(600);
        }
        $(".floatingInfo").fadeOut(600);
        bnActive = false;
        $('#check').prop('checked', true);
    }

    function goToNeuron(neuronId){
        var node = mundo.activeNodeById(neuronId);
        showNeuronData(node);
    }
    //Helper functions
    /* $(document).on('click', '#takeScreenshot', function(){
        takeScreenshot(mundo);
    }); */

    function showNeuronData(node){
        if(window.innerWidth < 800){
            $(".floatingMenu .bn").fadeOut(200, function(){
                $('[neuronid="'+node.id+'"]').fadeIn(200);
            });
            $('#check').prop('checked', true);
            bnActive = true;
        }
        $('.bn[neuronid="'+node.id+'"]').focus();
        var thisNode = somasData.filter(textNode => textNode.id == node.id)[0];
        if(thisNode?.subtitle)
            $(".subtitle").text(thisNode.subtitle);

        if(thisNode?.info){
            if(Array.isArray(thisNode.info)){
                thisNode.info.forEach(p => {
                    $(".info").append($('<p></p>').text(p));
                });
            }else{
                $(".info").text(thisNode.info);
            }
        }
        if(thisNode?.next){
            $(".next").attr("id",thisNode.next.id);
            $(".next").attr("thisNeuronId", thisNode.id);
            if(thisNode.next.name){
                $(".next").text(thisNode.next.name);
            }else{
                $(".next").text('SEGUIR');
            }
            if(thisNode.next.url){
                $(".next").attr("url",thisNode.next.url);
            }
            $(".next").show();
        }else{
            $(".next").hide();
        }
        //console.log("nodeside:" + node.side);
        if(node.side == "izq"){
            $(".floatingInfo").addClass("izq");
            $(".floatingInfo").removeClass("der");
    
            /* $(".floatingMenu").addClass("izq");
            $(".floatingMenu").removeClass("der"); */
        }else{
            $(".floatingInfo").removeClass("izq");
            $(".floatingInfo").addClass("der");
    
            /* $(".floatingMenu").removeClass("izq ");*/
            /* $(".floatingMenu").addClass("der"); */
        }
        $(".floatingTitle").fadeOut(600);//Oculto el titulo
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
    


function createLinks(nodes){
    var nodeLinks = [];
    //var newBlend = indexNeurons.concat(nodes);
    nodes.forEach( node => {
        if( node.links ){
            node.links.forEach( link => {

                var newLink = {
                    source: link.id,
                    target: node.id
                };

                newLink.distance = link.distance ?? globalDefaultSettings.linkDistance;

                nodeLinks.push(newLink);

            });
        }
    });
    return nodeLinks;
}
