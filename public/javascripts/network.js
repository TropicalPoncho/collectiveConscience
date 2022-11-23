import Cookies from "/javascripts/js.cookie.min.mjs";
import { ingestGraphData , aimNodeFromId , takeScreenshot, aimNodeFromNickName} from "./neuralNetworkRender.js";

jQuery(function(){

    //Inicializo la variable de myNeuron según id recibido o cookie
    var myNeuron = (typeof myNeuronId !== 'undefined') ? myNeuronId : Cookies.get("neuron");
    var _myNickName = (typeof myNickName !== 'undefined') ? myNickName.toLowerCase() : null;

    //Comienzo a cargar la red:
    GetNeurons(1);

    function GetNeurons(page){
        $.get( "/neurons", {page: page}, function( neurons ) {
            if(neurons.length != 0){
                ingestGraphData(neurons, myNeuron, _myNickName);
                page++;
                GetNeurons(page);
            }else{ //Cuando termina de cargar
                manageNewNeurons();
            }
        });
    }
    
    function manageNewNeurons(){
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
    }
    

    $(document).on("click", '#share_wpp', function() {
        var whatsapp_url = "https://api.whatsapp.com://send?text=";
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            whatsapp_url = "whatsapp://send?text=";
        }
        var text = "SOMA BETA - 26.11.22 | Festival de artes en Temperley, BsAs \t" 
        text += "Ami, quiero invitarte a este tremendo evento en Cultura del Sur. \t"
        text += "Tocará Anita Hagen con Vinilos, habrán exposiciones, traino de danza, performances, exposiciones y más. \n"
        text += "El flyer del evento también es una obra digital dinámica que responde a tu interacción. Entrá en el siguiente link para generar tu propia neurona y enterarte de toda la data del evento: ";
        var url = "http://tropicalponcho.art/network/synapsis/" + myNeuron;
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

    $(document).on("click", ".triggerFloatingInfo",function(){
        if($('.floatingInfo').is(":visible")){
            $('.floatingInfo').css('display', 'none');
            $(this).children('i#close').addClass('hidden');
            $(this).children('i#open').removeClass('hidden');
        }else{
            $('.floatingInfo').css('display', 'block');
            $(this).children('i#close').removeClass('hidden');
            $(this).children('i#open').addClass('hidden');
        }
    });

});