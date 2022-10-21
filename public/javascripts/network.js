import Cookies from "/javascripts/js.cookie.min.mjs";
import { ingestGraphData , aimNodeFromId , takeScreenshot} from "./neuralNetworkRender.js";

jQuery(function(){

    //Inicializo la variable de myNeuron según id recibido o cookie
    var myNeuron = (typeof myNeuronId !== 'undefined') ? myNeuronId : Cookies.get("neuron");

    //Comienzo a cargar la red:
    GetNeurons(1);

    function GetNeurons(page){
        $.get( "/neurons", {page: page}, function( neurons ) {
            if(neurons.length != 0){
                ingestGraphData(neurons);
                page++;
                GetNeurons(page);
            }else{ //Cuando termina de cargar
                manageNewNeurons();
            }
        });
    }
    
    function manageNewNeurons(){
        if(myNeuron == undefined){ //Nueva visita
            if (typeof fromId !== 'undefined'){ //Con el Origen informado
                //Llamo para crear la neurona
                $.post( "/neurons", {fromId: fromId}, function( response ) {
                    var newNeuron = response;
                    Cookies.set("neuron", newNeuron._id); //Agrego la cookie
                    myNeuron = newNeuron._id;
                    ingestGraphData([newNeuron]); //La agrego a la red
                });
            }else{ 
                //Si no existe y no informa el fromId?? Nada
                //TODO: Mostrar cuadro de dialogo para pedir codigo.
            }
        }else{ //Si ya existe
            aimNodeFromId(myNeuron);
        }
    }
    

    $(document).on("click", '#share_wpp', function() {
        var whatsapp_url = "https://api.whatsapp.com://send?text=";
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            whatsapp_url = "whatsapp://send?text=";
        }
        var text = "SOMA BETA - 26.11.22 | Festival de artes en Temperley \n" 
        text += "Ami, quiero invitarte a este tremendo evento en Cultura del Sur. \n"
        text += "Tocará Anita Hagen con Vinilos, habrán exposiciones, traino de danza, performances, exposiciones y más. \n"
        text += "Entrá en el siguiente link para enterarte de toda la data del evento: ";
        var url = "tropicalponcho.art/network/" + myNeuron;
        var message = encodeURIComponent(text) + " - " + encodeURIComponent(url);
        window.location.href = whatsapp_url + message;
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

});