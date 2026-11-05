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

centralNode.addEventListener("click", () => {
    selectNode("central");
});

function getNodeCenter(element){
    const nodeRect = element.getBoundingClientRect();
    const workspaceRect = workspace.getBoundingClientRect();

    return{
        x: nodeRect.left - workspaceRect.left + nodeRect.width / 2,
        y: nodeRect.top - workspaceRect.top + nodeRect.height / 2
    };
}

function selectNode(id){
    nodes.forEach(node => {
        node.element.classList.remove("selected");
    });

    selectedNodeId = id;

    const selectedNode = nodes.get(id);

    if(selectNode) {
        selectedNode.element.classList.add("selected");
    }
}

function createNode(content, parentId, x, y){
    const id = `node-${++nodeCounter}`;

    const nodeElement = document.createElement("div");

    nodeElement.classList.add("central-node");
    nodeElement.textContent = content;

    nodeElement.style.left = `${x}px`;
    nodeElement.style.top = `${y}px`;
    nodeElement.style.transform = "translate(-50%, -50%)";

    nodeElement.addEventListener("click", (event) => {
        event.stopPropagation();
        selectNode(id);
    });

    workspace.appendChild(nodeElement);

    nodes.set (id, {
        id: id,
        element: nodeElement,
        parentId: parentId,
        x: x,
        y: y
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
    const offset = children.length * 85;
    const x = Math.min(workspace.clientWidth - 100, parentPosition.x + 190);
    const y = Math.max(60, 
        Math.min(
            workspace.clientHeight - 60, parentPosition.y + offset
        )
    );

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
            node.delete(id);
        }
    });

    selectedNodeId = "central";
    selectNode("central");

    drawConnections();
}

addBranchBtn.addEventListener("click", addBranch);
addSubtopicBtn.addEventListener("click", addSubtopic);
editNodeBtn.addEventListener("click", editNode);
deletenodeBtn.addEventListener("click", deleteNode);

window.addEventListener("resize", drawConnections);