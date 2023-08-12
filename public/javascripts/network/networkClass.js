
class Network {
    
    Graph;
    elementId = 'networkGraph';
    controlType = 'orbit';
    cameraDistance = 350;
    
    link = {
        Width: 1.5,
        Opacity: 0.4,
        DirectionalParticleWidth: 1,
        DirectionalParticles: 4,
        DirectionalParticleSpeed: 4 * 0.001
    };

    constructor(elementId = null, arActive = null){
        if(elementId)
            this.elementId = id;

        if(arActive){
            Graph = ForceGraphAR()
                (document.getElementById(this.elementId));
        }else{
            Graph = ForceGraph3D({ controlType: this.controlType })
                (document.getElementById(this.elementId))
                .nodeLabel('name')
                .cameraPosition({ z: this.cameraDistance })
                .onNodeHover(node => { //Funcion para modificar esto? 
                    consoleLog(node);
                })
                .cooldownTicks(100) //Para q era? Menos updates?
                .onNodeClick(node => aimNode(node))
                .onEngineTick(() => {
                    animateParticles(); //Mover a donde creo un objeto particles
                });
        }

                //.nodeAutoColorBy('group')
        Graph.linkWidth(this.link.Width)
            .linkOpacity(this.link.Opacity)
            .linkDirectionalParticleWidth(this.link.DirectionalParticleWidth)
            .linkDirectionalParticles(this.link.DirectionalParticles)
            .linkDirectionalParticleSpeed(d => this.link.DirectionalParticleSpeed)
            .nodeThreeObject(node => CreateNodeThreeObject(node));
    }

    ingestGraphData(neurons, aimNodeId = null, myNeuron = null, myNickName = null){
        neurons.forEach((item, index, arr) => {
            if(graphData.nodes.find(node => node.id == item._id)){ //Para no repetir
                return;
            }
            var color = globalDefaultSettings.marbleColorA;
            if((myNeuron && myNeuron == item._id) || (myNickName && myNickName == item.nickName)){
                color = globalDefaultSettings.myNeuronColor;
            }
            graphData.nodes.push({ 
                "id": item._id, 
                "nickName": item.nickName ?? null,
                "name": item.name,
                "img": item.imgPath,
                "imgActive": item.imgActive ?? false,
                "imgSize": item.imgSize ?? globalDefaultSettings.imgSize,
                "val": item.graphVal ?? globalDefaultSettings.nodeSize,
                "info": item.info ?? null,
                "color": color,
                "type": item.nodeType ?? null,
                "particlesSize": item.graphVal ?? globalDefaultSettings.particlesSize,
                "particles": item.particles ?? null
            });
            /* if(item.name == "SOMA")
                graphData.nodes[graphData.nodes.length - 1].fz = 0; */
            
            item.fromId.forEach((fromId) => {
                var linkDistance = globalDefaultSettings.linkDistance;
                /* if(item._id == '636326c5b63661e98b47ed11' || fromId == '636326c5b63661e98b47ed11'){ //Si viene o va de SOMA
                    linkDistance = globalDefaultSettings.somaDistance;
                } */
                if(item._id == '636326c5b63661e98b47ed11' && fromId == '6335d5e37636ed5b3529c543'){ //SOMA y SOMA BETA
                    linkDistance = globalDefaultSettings.longDistance;
                } 
                var newLink = {
                    source: fromId,
                    target: item._id,
                    curvature: 0.8, 
                    rotation: Math.PI * 3 / 3,
                    distance: linkDistance
                };
                if(!graphData.nodes.find(item => item.id === fromId)){
                    linkWaitList.push(newLink);
                }else{
                    graphData.links.push(newLink);
                }
            });
        });
        linkWaitList.forEach((item, index, arr) => { //Reviso el waitList
            if(graphData.nodes.find(node => node.id === item.source)){
                graphData.links.push(item);
                arr.splice(index,1); //Lo remuevo del waitList
            }
        });
        try {
            Graph.graphData(graphData);
        } catch (error) {
            console.log(error);        
        }
        Graph
          .d3Force('link')
          .distance(link => link.distance );
        Graph.numDimensions(3);
    }

    activateZoomToFit() {
        Graph.onEngineStop(() => Graph.zoomToFit(400));
    }

    //Camera orbit
    orbitInterval = null;
    angle = 0;
    finalDistance = 0;
    extraDistance = 0;
    activateOrbit(addDistance = 0, resetAndStop){
        finalDistance += addDistance;

        if(!orbitInterval){
            orbitInterval = setInterval(() => {
                if(somaNode == null){
                    somaNode = graphData.nodes.find(item => item.id == '636326c5b63661e98b47ed11');
                }
                
                if(extraDistance < finalDistance){
                    extraDistance += 1;
                }
                if(resetAndStop && extraDistance >= finalDistance){
                    stopOrbit();
                }
                
                Graph.cameraPosition({
                    x: ( globalDefaultSettings.cameraDistance + extraDistance ) * Math.sin(angle),
                    y: -90,
                    z: ( globalDefaultSettings.cameraDistance + extraDistance ) * Math.cos(angle)
                }, somaNode);
                angle += Math.PI / 1500;
            }, 10);  
        }
    }

    resetOrbit(distance, resetAndStop = false){
        stopOrbit();
        activateOrbit(distance, resetAndStop);
    }

    consoleLog(node){
        if(node){
            console.log(node.id);
        }
    }

    takeScreenshot() {
        // open in new window like this
        var w = window.open('', '');
        w.document.title = "Screenshot";
        var img = new Image();
        // Without 'preserveDrawingBuffer' set to true, we must render now
        renderer.render(scene, camera);
        img.src = renderer.domElement.toDataURL();
        w.document.body.appendChild(img);  
    }

    aimNode(node){
        if(!arActive){
            // Aim at node from outside it
            const distance = globalDefaultSettings.aimDistance;
            const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
    
            const newPos = node.x || node.y || node.z
                ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
                : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)
    
    
            Graph.cameraPosition(
                newPos, // new position
                node, // lookAt ({ x, y, z })
                3000  // ms transition duration
            );
            ingestNodeInfo(node);
        }
    }

    ingestNodeInfo(node){
        if(node.info && node.name != "SOMA BETA"){ 
            var $neuronInfoElem = $(`.neuronInfo#${node.id}`); //Busco la data de esta neurona
            if(!$neuronInfoElem.length){ //Si no existe lo creo
                $neuronInfoElem = $("<div></div>",{class: "neuronInfo", id: node.id }).appendTo('.neuronInfoContainer');
                $("<h3></h3>").text(node.name).appendTo($neuronInfoElem);
                $("<h4></h4>").text(node.info.sub).appendTo($neuronInfoElem);
                if(node.info.img){
                    $('<img src="'+ node.info.img +'">').load(function() {
                        $(this).appendTo($neuronInfoElem);
                    });
                }
                $("<p></p>").text(node.info.bio).appendTo($neuronInfoElem);
                if(node.info.links){
                    node.info.links.forEach((item, index, arr) => {
                        var elem = $(`<a class="btn" target="_blank" type="button" href="${item.href}"></a>`);
                        elem.append($(`<i class="ico ig"></i>"Instagram"`));
                        $("<div></div>").append(elem).appendTo($neuronInfoElem);
                    });
                }
            }
            $('.neuronInfoContainer > .neuronInfo').addClass("hidden"); //Oculto el anterior
            $neuronInfoElem.removeClass("hidden"); //Muestro el actual
            $("#flyerInfoContent").addClass("hidden"); //Oculto la data original
        }else{
            $(".neuronInfo").addClass("hidden"); //Oculto todas las neuronInfo
            $("#flyerInfoContent").removeClass("hidden"); //Muestro la data original
        }
    }
}