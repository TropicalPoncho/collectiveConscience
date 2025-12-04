import Cookies from "/javascripts/js.cookie.min.mjs";
import { ingestGraphData , aimNodeFromId , takeScreenshot, activateZoomToFit, activateOrbit, resetOrbit, stopOrbit} from "./neuralNetworkRender.js";

jQuery(function(){

    M.AutoInit();

    //Inicializo la variable de myNeuron según id recibido o cookie
    var myNeuron = (typeof myNeuronId !== 'undefined') ? myNeuronId : Cookies.get("neuron");
    var _myNickName = (typeof myNickName !== 'undefined') ? myNickName.toLowerCase() : null; //Viene def.

    //Comienzo a cargar la red:
    GetNeurons(0);
    setTimeout(function(){
        var neuronCookie = Cookies.get("neuron");
        if(!neuronCookie){ //Si nunca entró muestra modal: (si entra con su link, lo indica en el step)
            var elem = document.querySelector('.modal');
            M.Modal.init(elem, { dismissible: false, startingTop: '40%', inDuration: 500, outDuration: 500});
            M.Modal.getInstance(elem).open();
        }else{ //Si ya ingreso alguna vez:
            stopOrbit();
            loadAll(neuronCookie); //Cargo todo y señalo al final
        }
    }, 5000);

    var totalNeurons = [];
    function GetNeurons(page){
        $.get( "/neurons", {page: page}, function( neurons ) {
            if(neurons.length != 0){
                totalNeurons.push(...neurons);
                if(page == 0){ //Lo hago solo con la primer pag
                    initNetwork();
                }
                page++;
                GetNeurons(page);
            }else{ //Cuando termina de cargar
                //setTimeout(() => { manageNewNeurons(); }, 5000);
            }
        });
    }

    function loadByOrder(order){
        var neurons = totalNeurons.filter(item => item.nOrder == order);
        ingestGraphData(neurons, '636326c5b63661e98b47ed11' ,myNeuron, _myNickName);
    }

    function loadAll(neuronId = null){
        var cant = 10;
        var page = 1;
        var _neuronId = neuronId ?? Cookies.get('neuron');
        activateZoomToFit();
        var interval = setInterval(() => {
            var neurons = totalNeurons.slice((page - 1) * cant, page * cant);
            if(neurons.length == 0){
                if(_neuronId){
                    aimNodeFromId(neuronId);
                }
                clearInterval(interval);
            }
            ingestGraphData(neurons, '636326c5b63661e98b47ed11', myNeuron, _myNickName);
            page++;
        }, 2000);
    }

    function initNetwork(){
        activateOrbit();
        loadByOrder(1); // Cargo SOMA y productoras
    }

    function loadTourStep(step){
        $('.step').addClass('hidden');
        $("#stepsInfo").fadeOut(600, function(){
            switch(step){
                case "2":
                    resetOrbit(100);
                    loadByOrder(2);
                    break;
                case "3":
                    resetOrbit(200, true);
                    loadByOrder(3);
                    break;
                case "4": //Crea tu neurona
                    stopOrbit();
                    loadAll();
                    $("#stepBtnsContainer").hide();
                    break;
            }
            $(`#${step}`).removeClass('hidden');
            $("#stepsInfo").fadeIn(500);
        });
    }

    $(document).on("click", '#btnModal', function(event) {
        $(".flyerInfo").fadeOut(1000, function(){
            loadTourStep(1); //Paso al siguiente step
        });
    });

    $(document).on("click", '#continueTour', function(event) {
        var step = $(event.target).attr('step');
        if((typeof myNeuronId !== 'undefined' || typeof myNickName !== 'undefined') && step == 4){ //Si ya tiene neurona y es el paso 4
            loadTourStep("5"); //Salto al 5
            loadAll();
            stopOrbit();
            $("#stepBtnsContainer").hide();
        }else{
            loadTourStep(step); //Paso al siguiente step
        }
        step++;
        $(event.target).attr('step', step); //Preparo el click
    });

    //Skips
    function skipTour(){
        if(typeof myNeuronId !== 'undefined' || typeof myNickName !== 'undefined'){ //Si ya tiene neurona y es el paso 4
            loadTourStep("5"); //Salto al 5
            loadAll();
            stopOrbit();
            $("#stepBtnsContainer").hide();
        }else{
            loadTourStep("4"); //Paso al siguiente step
        }
    }

    $(document).on("click", '#skipTour', function(event) {
        skipTour();
    });

    $(document).on("click", '#modalSkipTour', function(event) {
        $(".flyerInfo").fadeOut(1000, function(){
            skipTour();
        });
    });

    //Volver
    $(document).on("click", '#volver', function( event ) {
        $("#stepsInfo").fadeOut(600, function(){
            aimNodeFromId(myNeuron);
            $(".flyerInfo").fadeIn(600);
        });
    });

    //Crear
    $(document).on("click", '#createNeuronBtn', function( event ) {
        var data = {
            nickName: $('form #nickName').val(),
            email: $('form #email').val(),
            name: $('form #nickName').val()
        }
        if(typeof fromId !== 'undefined'){
            data.fromId = fromId;
        }else if(typeof fromNickName !== 'undefined'){
            data.fromNickName = fromNickName.toLowerCase();
        }else{
            data.fromId = '63c8f08512a3964fe0064ba6';
        }
        createNeuron(data);
    });
    
    function createNeuron(data){
        //Llamo para crear la neurona
        $.post( "/neurons", data, function( response ) {
            var newNeuron = response;
            Cookies.set("neuron", newNeuron._id); //Agrego la cookie
            myNeuron = newNeuron._id;
            ingestGraphData([newNeuron], null, myNeuron); //La agrego a la red
            loadTourStep("5");
        });
    }
        
/*     function manageNewNeurons(){
        if(typeof myNeuron == 'undefined' && !_myNickName){ //Nueva visita
            if (typeof fromId !== 'undefined' || typeof fromNickName !== 'undefined'){ //Con el Origen informado
                var data;
                if(typeof fromId !== 'undefined'){
                    data = {fromId: fromId};
                }else{
                    data = {fromNickName: fromNickName.toLowerCase()};
                }
                //Llamo para crear la neurona
                $.post( "/neurons", data, function( response ) {
                    var newNeuron = response;
                    Cookies.set("neuron", newNeuron._id); //Agrego la cookie
                    myNeuron = newNeuron._id;
                    ingestGraphData([newNeuron], myNeuron); //La agrego a la red
                    aimNodeFromId(myNeuron);
                });
            }else{
                //Si no existe y no informa el fromId?? Nada
                //TODO: Mostrar cuadro de dialogo para pedir codigo.
            }
        }else if(myNeuron != undefined){ //Si ya existe
            aimNodeFromId(myNeuron);
        }else{
            aimNodeFromNickName(_myNickName);
        }
    } */
    

    $(document).on("click", '#share_wpp', function() {
        var whatsapp_url = "https://api.whatsapp.com://send?text=";
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            whatsapp_url = "whatsapp://send?text=";
        }

        var neuronLink = 'network/636326c5b63661e98b47ed11'; //Default (Web)
        if(typeof myNeuron !== 'undefined'){ //Si tiene myNeuronDefinida
            neuronLink = 'network/' + myNeuron;
        }else if(_myNickName){
            neuronLink = 'soma/synapsis/' + _myNickName;
        }

        var text = "SOMA - 21.01.23 | FESTIVAL DE ARTE INMERSIVO \t" 
        text += "Ami, quiero invitarte a este tremendo evento en el Camping Río Azul. \t"
        text += "Es un festival multidisciplinario con muchas propuestas artisticas. \n"
        text += "El flyer del evento también es una obra digital dinámica que responde a tu interacción. Entrá en el siguiente link para generar tu propia neurona y enterarte de toda la data del evento: ";
        var url = "https://tropicalponcho.art/" + neuronLink;
        var message = encodeURIComponent(text) + " - " + encodeURIComponent(url);
        window.open(whatsapp_url + message, '_blank');
        return false;
    });

    $(document).on("click", "#btn_explainNetwork",function(){
        if($(this).text() == "Volver"){
            $("#introNetwork").removeClass("hidden");
            $("#explainNetwork").addClass("hidden");
            $(this).text("¿Qué estoy viendo?");
        }else{
            $("#introNetwork").addClass("hidden");
            $("#explainNetwork").removeClass("hidden");
            $(this).text("Volver"); 
        }
    });

    $(document).on('click', '#btn_captura',function(){
        takeScreenshot();
    });

    /* $(document).on("click", ".triggerFloatingInfo",function(){
        if($('.floatingInfo').is(":visible")){
            $('.floatingInfo').css('display', 'none');
            $(this).children('i#close').addClass('hidden');
            $(this).children('i#open').removeClass('hidden');
        }else{
            $('.floatingInfo').css('display', 'block');
            $(this).children('i#close').removeClass('hidden');
            $(this).children('i#open').addClass('hidden');
        }
    }); */

});