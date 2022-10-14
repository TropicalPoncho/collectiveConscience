import Cookies from "/javascripts/js.cookie.min.mjs";
import { ingestGraphData } from "./neuralNetworkRender.js";

$(function() {
    //Comienzo a cargar la red:
    GetNeurons(1);

    function GetNeurons(page){
        $.get( "/neurons", {page: page}, function( neurons ) {
            if(neurons.length != 0){
                ingestGraphData(neurons);
                page++;
                GetNeurons(page);
            }
        });
    }
    
    var neuron = Cookies.get("neuron");
    if(neuron == undefined){ //Nueva visita
        if (typeof fromId !== 'undefined'){ //Con el Origen informado
            //Llamo para crear la neurona
            $.post( "/neurons", {fromId: fromId}, function( response ) {
                var newNeuron = response;
                Cookies.set("neuron", newNeuron._id); //Agrego la cookie
                ingestGraphData([newNeuron]); //La agrego a la red
            });
        }else{ 
            //Si no existe y no informa el fromId?? Nada
        }
    }else{ //Si ya existe
        //GoToNeuron(neuron) //Apunta a ella ??
    }

    $(document).on("click", '#share_wpp', function() {
        var whatsapp_url = "https://web.whatsapp.com://send?text=";
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            whatsapp_url = "whatsapp://send?text=";
        }
        var text = "SOMA BETA - 26.11.22 | Festival de artes en Temperley";
        var url = window.location.href + "?fromId=" + neuron;
        var message = encodeURIComponent(text) + " - " + encodeURIComponent(url);
        window.location.href = whatsapp_url + message;
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

});