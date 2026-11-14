const workspace = document.getElementById("workspace");
const centralNode = document.getElementById("centralNode");
const connections = document.getElementById("connections");
const addBranchBtn = document.getElementById("addBranchBtn");
const addSubtopicBtn = document.getElementById("addSubtopicBtn");
const editNodeBtn = document.getElementById("editNodeBtn");
const deletenodeBtn = document.getElementById("deleteNodeBtn");

const nodes = new Map();

let nodeCounter = 0;
let selectedNodeId = null;

nodes.set("central", {
    id: "central",
    element: centralNode,
    parentId: null,
    x: 0,
    y: 0
});

selectedNodeId = "central";
centralNode.classList.add("selected");
makeDraggable(centralNode, "central");

centralNode.addEventListener("click", () => {
    selectNode("central");
});

function getNodeCenter(element){
    const nodeRect = element.getBoundingClientRect();
    const workspaceRect = workspace.getBoundingClientRect();

    return{
        x: nodeRect.left - workspaceRect.left - workspace.clientLeft + nodeRect.width / 2,
        y: nodeRect.top - workspaceRect.top - workspace.clientTop + nodeRect.height / 2
    };
}

function selectNode(id){
    nodes.forEach(node => {
        node.element.classList.remove("selected");
    });

    selectedNodeId = id;

    const selectedNode = nodes.get(id);

    if(selectedNode) {
        selectedNode.element.classList.add("selected");
    }
}

function findAvailablePosition(element, preferredX, preferredY){
    const padding = 20;
    const gap = 25;

    const width = element.offsetWidth;
    const height = element.offsetHeight;

    const stepX = width + gap;
    const stepY = height + gap;

    const workspaceWidth = workspace.clientWidth;
    const workspaceHeight = workspace.clientHeight;

    for(let ring = 0; ring <= 20; ring++){
        for(let dy = -ring; dy <= ring; dy++){
            for(let dx = -ring; dx <= ring; dx++){
                if(Math.max(Math.abs(dx), Math.abs(dy)) !== ring){
                    continue;
                }

                const x = preferredX + dx * stepX;
                const y = preferredY + dy * stepY;

                if(x < width/2 + padding || x > workspaceWidth - width / 2 -padding ||
                    y < height / 2 + padding || y > workspaceHeight - height / 2 - padding
                ){
                    continue;
                }

                let overlaps = false;

                nodes.forEach(existingNode => {
                    const existingPos = getNodeCenter(existingNode.element);
                    const existingWidth = existingNode.element.offsetWidth;
                    const existingHeight = existingNode.element.offsetHeight;
                    const overlapX = Math.abs(x - existingPos.x) < (width + existingWidth) / 2 + gap;
                    const overlapY = Math.abs(y - existingPos.y) < (height + existingHeight) / 2 + gap;

                    if(overlapX && overlapY){
                        overlaps = true;
                    }
                });

                if(!overlaps){
                    return { x, y };
                }
            }
        }
    }
    return null;
}

function createNode(content, parentId, x, y){
    const id = `node-${++nodeCounter}`;

    const nodeElement = document.createElement("div");

    nodeElement.classList.add("mind-node");
    nodeElement.textContent = content;

    nodeElement.style.position = "absolute";
    nodeElement.style.transform = "translate(-50%, -50%)";

    workspace.appendChild(nodeElement);

    const position = findAvailablePosition(nodeElement, x, y);

    if(!position){
        nodeElement.remove();
        nodeCounter--;
        alert("There is no available space.")
        return;
    }

    nodeElement.style.left = `${position.x}px`;
    nodeElement.style.top = `${position.y}px`;

    nodeElement.addEventListener("click", (event) => {
        event.stopPropagation();
        selectNode(id);
        makeDraggable(nodeElement, id);
    });

    nodes.set (id, {
        id: id,
        element: nodeElement,
        parentId: parentId,
        x: position.x,
        y: position.y
    });

    drawConnections();
    selectNode(id);
}

function addBranch() {

    const topic = prompt("Enter your new branch:");

    if (!topic || !topic.trim()) {
        return;
    }

    const center = getNodeCenter(centralNode);

    const branchCount = [...nodes.values()]
        .filter(node => node.parentId === "central").length;

    const angle = branchCount * (Math.PI / 4);

    const radiusX = workspace.clientWidth * 0.25;
    const radiusY = workspace.clientHeight * 0.25;

    const x = center.x + Math.cos(angle) * radiusX;
    const y = center.y + Math.sin(angle) * radiusY;

    createNode(topic.trim(), "central", x, y);
}

function addSubtopic(){
    if(!selectedNodeId){
        alert("Please select a subtopic first.");
        return;
    }

    const topic = prompt("Enter your new subtopic:");

    if(!topic || !topic.trim()){
        return;
    }

    const parentNode = nodes.get(selectedNodeId);
    const children = [...nodes.values()].filter(node => node.parentId === selectedNodeId);
    const parentPosition = getNodeCenter(parentNode.element);
    
    const x = parentPosition.x + 220;
    const y = parentPosition.y + children.length * 100;

    createNode(topic.trim(), selectedNodeId, x, y);
}

function drawConnections(){
    connections.innerHTML = "";

    nodes.forEach(node => {
        if(!node.parentId){
            return;
        }

        const parentNode = nodes.get(node.parentId);

        if(!parentNode){
            return;
        }

        const parentPosition = getNodeCenter(parentNode.element);
        const childPosition = getNodeCenter(node.element);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        line.setAttribute("x1", parentPosition.x);
        line.setAttribute("y1", parentPosition.y);
        line.setAttribute("x2", childPosition.x);
        line.setAttribute("y2", childPosition.y);

        line.setAttribute("stroke", "#a5a5c7");
        line.setAttribute("stroke-width", "2");

        connections.appendChild(line);
    });
}

function editNode(){
    if(!selectedNodeId){
        return;
    }

    const node = nodes.get(selectedNodeId);

    const newContent = prompt(
        "Edit topic:",
        node.element.textContent
    );

    if(newContent && newContent.trim()){
        node.element.textContent = newContent.trim();
        drawConnections();
    }
}

function deleteNode(){
    if(!selectedNodeId || selectedNodeId === "central"){
        alert("The central topic cannot be deleted.");
        return;
    }

    const idsToDelete = [selectedNodeId];

    for(let i = 0; i < idsToDelete.length; i++){
        const currentId = idsToDelete[i];

        nodes.forEach(node => {
            if(node.parentId === currentId){
                idsToDelete.push(node.id);
            }
        });
    }

    idsToDelete.forEach(id => {
        const node = nodes.get(id);

        if(node){
            node.element.remove();
            nodes.delete(id);
        }
    });

    selectedNodeId = "central";
    selectNode("central");

    drawConnections();
}

function getDescendantIds(id){
    const result = [];
    const queue = [id];

    while(queue.length > 0){
        const currentId = queue.shift();

        nodes.forEach(node => {
            if(node.parentId === currentId){
                result.push(node.id);
                queue.push(node.id);
            }
        });
    }
    return result;
}

function makeDraggable(element, id){
    let dragging = false;
    let startPointer = { x: 0, y: 0 };
    let group = [];
    let minDx = 0, maxDx = 0, minDy = 0, maxDy= 0;

    function pointerInWorkspace(event){
        const rect = workspace.getBoundingClientRect();
        return{
            x: event.clientX - rect.left - workspace.clientLeft,
            y: event.clientY - rect.top - workspace.clientTop
        };
    }

    element.addEventListener("pointerdown", (event) => {
        if(event.button !== 0){
            return;
        }

        event.stopPropagation();
        dragging = true;
        element.setPointerCapture(event.pointerId);
        selectNode(id);

        startPointer = pointerInWorkspace(event);

        const ids = [id, ...getDescendantIds(id)];

        group = ids.map(nodeId => {
            const node = nodes.get(nodeId);
            const center = getNodeCenter(node.element);

            return{
                node,
                startX: center.x,
                startY: center.y,
                halfWidth: node.element.offsetWidth/2,
                halfHeight: node.element.offsetHeight/2
            };
        });

        minDx = -Infinity;
        maxDx = Infinity;
        minDy = -Infinity;
        maxDy = Infinity;

        group.forEach(item => {
            minDx = Math.max(minDx, item.halfWidth - item.startX);
            maxDx = Math.min(maxDx, workspace.clientWidth - item.halfWidth - item.startX);
            minDy = Math.max(minDy, item.halfHeight - item.startY);
            maxDy = Math.min(maxDy, workspace.clientHeight - item.halfHeight - item.startY);
        })
    });

    element.addEventListener("pointermove", (event) => {
        if(!dragging){
            return;
        }

        const pointer = pointerInWorkspace(event);

        const dx = Math.min(Math.max(pointer.x - startPointer.x, minDx), maxDx);
        const dy = Math.min(Math.max(pointer.y - startPointer.y, minDy), maxDy);


        group.forEach(item => {
            const x = item.startX + dx;
            const y = item.startY + dy;

            item.node.element.style.left = `${x}px`;
            item.node.element.style.top = `${y}px`;
            item.node.x = x;
            item.node.y = y;
        });

        drawConnections();
    });

    function stopDragging(event){
        dragging = false;

        if(element.hasPointerCapture(event.pointerId)){
            element.releasePointerCapture(event.pointerId);
        }
    }

    element.addEventListener("pointerup", stopDragging);
    element.addEventListener("pointercancel", stopDragging);
}

addBranchBtn.addEventListener("click", addBranch);
addSubtopicBtn.addEventListener("click", addSubtopic);
editNodeBtn.addEventListener("click", editNode);
deletenodeBtn.addEventListener("click", deleteNode);

window.addEventListener("resize", drawConnections);