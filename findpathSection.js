// Handle find path button click
document.getElementById("find-path-btn").addEventListener("click", function () {
    
    const transmitterNode = document.getElementById("transmitter").value.trim();
    const receiverNode = document.getElementById("receiver").value.trim();

    
    const graph = createGraph();
    const missingNodes = [];
    
    if (!graph[transmitterNode]) {
        missingNodes.push(transmitterNode);
    }
    if (!graph[receiverNode]) {
        missingNodes.push(receiverNode);
    }

 
    if (missingNodes.length > 0) {
        alert(`Node(s) not found: ${missingNodes.join(', ')}`);
        return;
    }
    const path = findShortestPath(transmitterNode, receiverNode);

    if (path.length > 0) {
        alert(`Shortest path from ${transmitterNode} to ${receiverNode}: ${path.join(' -> ')}`);
    } else {
        alert(`No path found between ${transmitterNode} and ${receiverNode}.`);
    }
});

// Functions to set transmitter and receiver nodes
function setTransmitter() {
    console.log("setTransmitter");


    const transmitterNames = document.getElementById("transmitter").value.split(",").map(name => name.trim());
    let notFound = [];

    transmitterNames.forEach(name => {
        const node = nodesInTree.find(n => n === name);
        if (node) {
            const nodeElement = [...treeArea.children].find(el => el.textContent === name);
            if (nodeElement) {
                nodeElement.classList.add("transmitter");
                alert(`${name} set as transmitter`);
            }
        } else {
            notFound.push(name);
        }
    });

    if (notFound.length > 0) {
        alert(`Nodes not found in the tree: ${notFound.join(", ")}`);
    }
}

function setReceiver() {
    console.log("setReceiver");

    const receiverNames = document.getElementById("receiver").value.split(",").map(name => name.trim());
    let notFound = [];

    receiverNames.forEach(name => {
        const node = nodesInTree.find(n => n === name);
        if (node) {
            const nodeElement = [...treeArea.children].find(el => el.textContent === name);
            if (nodeElement) {
                nodeElement.classList.add("receiver");
                alert(`${name} set as receiver`);
            }
        } else {
            notFound.push(name);
        }
    });

    if (notFound.length > 0) {
        alert(`Nodes not found in the tree: ${notFound.join(", ")}`);
    }
}
