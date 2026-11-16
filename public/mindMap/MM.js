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
let currentMapId = null;

let loggedIn = false;

async function checkLogin() {
    try{
        const response = await fetch("/api/auth/me");
        loggedIn = response.ok;
    } catch(error){
        loggedIn = false;
    }
}

function requireLoginFor(action){
    if(loggedIn){
        return true;
    }
    if(confirm(`You need to log in to ${action}. Go to the login page.`)){
        window.location.href = "/login.html";
    }
    return false;
}

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
    });

    makeDraggable(nodeElement, id);

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
    if(!requireLoginFor("create a mind map")) return;

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
    if(!requireLoginFor("create a mind map")) return;

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
    if(!requireLoginFor("create a mind map")) return;

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
    if(!requireLoginFor("create a mind map")) return;

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

function serializeMap(){
    const w = workspace.clientWidth;
    const h = workspace.clientHeight;

    return{
        title: document.getElementById("mapTitle").value.trim() || "Untitled Mind Map",
        nodes: [...nodes.values()].map(node => {
            const c = getNodeCenter(node.element);

            return{
                id: node.id,
                parentId: node.parentId,
                text: node.element.textContent,
                x: c.x / w,
                y: c.y / h
            };
        })
    };
}

async function saveMindMap() {
    if(!requireLoginFor("create a mind map")) return;

    const status = document.getElementById("saveStatus");
    status.textContent = "Saving...";

    try{
        const response = await fetch(
            currentMapId ? `/api/mindmaps/${currentMapId}` : "/api/mindmaps",
            {
                method: currentMapId ? "PUT" : "POST",
                headers: { "Content-type": "application/json" },
                body: JSON.stringify(serializeMap())
            }
        );

        if(response.status === 401){
            loggedIn = false;
            window.location.href = "/login.html";
            return;
        }

        if(!response.ok){
            throw new Error(`Server responded with ${response.status}`);
        }

        const data = await response.json();
        currentMapId = data.id;
        history.replaceState(null, "", `?id=${currentMapId}`);
        status.textContent = "Saved";
    } catch(error){
        console.error(error);
        status.textContent = "Save Failed";
    }
}

function restoreNode(data, w, h){
    const element = document.createElement("div");

    element.classList.add("mind-node");
    element.textContent = data.text;
    element.style.left = `${data.x * w}px`;
    element.style.top = `${data.y * h}px`;

    workspace.appendChild(element);

    element.addEventListener("click", (event) => {
        event.stopPropagation();
        selectNode(data.id);
    });

    nodes.set(data.id, {
        id: data.id,
        element: element,
        parentId: data.parentId,
        x: data.x * w,
        y: data.y * h
    });

    makeDraggable(element, data.id);
}

function loadMap(map){
    nodes.forEach((node, id) => {
        if(id !== "central"){
            node.element.remove();
            nodes.delete(id);
        }
    });

    const w = workspace.clientWidth;
    const h = workspace.clientHeight;
    let highestCounter = 0;

    document.getElementById("mapTitle").value = map.title;

    map.nodes.forEach(data => {
        if(data.id === "central"){
            centralNode.textContent = data.text;
            centralNode.style.left = `${data.x * w}px`;
            centralNode.style.top = `${data.y * h}px`;
            return;
        }

        restoreNode(data, w, h);

        const nr = parseInt(data.id.replace("node-", ""), 10);

        if(nr > highestCounter){
            highestCounter = nr;
        }
    });

    nodeCounter = highestCounter;
    currentMapId = map.id;

    selectNode("central");
    drawConnections();
}

async function loadMapFromUrl() {
    const id = new URLSearchParams(window.location.search).get("id");

    if(!id){
        return;
    }

    try {
        const response = await fetch(`/api/mindmaps/${encodeURIComponent(id)}`);

        if(response.status === 401){
            window.location.href = "/login.html";
            return;
        }

        if(response.status === 404){
            alert("Mind does not exist.");
            history.replaceState(null, "", window.location.pathname);
            return;
        }

        if(!response.ok){
            throw new Error(`Server responded with ${response.status}`);
        }

        loadMap(await response.json());
        document.getElementById("saveStatus").textContent = "Saved";
    } catch (error) {
        console.error(error);
        alert("Could not open mind map.")
    }
}

function newMap(){
    if(!requireLoginFor("create a mind map")) return;

    if(nodes.size > 1 && !confirm("Start a new mind map? Anything you have not saved will be lost.")){
        return;
    }

    window.location.assign(window.location.pathname);
}

loadMapFromUrl();
checkLogin();

document.getElementById("saveMindMapBtn").addEventListener("click", saveMindMap);
addBranchBtn.addEventListener("click", addBranch);
addSubtopicBtn.addEventListener("click", addSubtopic);
editNodeBtn.addEventListener("click", editNode);
deletenodeBtn.addEventListener("click", deleteNode);
document.getElementById("newMapBtn").addEventListener("click", newMap);

window.addEventListener("resize", drawConnections);