const treeArea = document.getElementById("tree-area");

let draggedItem = null;
let selectedNodes = [];  // To store the two nodes to connect with a line
let connections = []; // Store all node connections (nodes and their lines)
let lines = []; // Store all lines to update positions when nodes move
let nodesInTree = []; // Store the names of all nodes created in the tree

// Add event listeners to all draggable items
document.querySelectorAll(".draggable").forEach(item => {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragend", handleDragEnd);
});

treeArea.addEventListener("dragover", handleDragOver);
treeArea.addEventListener("drop", handleDrop);

// Handle when an item starts being dragged
function handleDragStart(e) {
    draggedItem = this;
    setTimeout(() => this.classList.add("hidden"), 0);
}

// Handle when dragging ends
function handleDragEnd(e) {
    this.classList.remove("hidden");
    draggedItem = null;
}

// Allow items to be dragged over the tree area
function handleDragOver(e) {
    e.preventDefault();
}

// Handle when an item is dropped in the tree area
function handleDrop(e) {
    e.preventDefault();
    const dropX = e.clientX - treeArea.offsetLeft;
    const dropY = e.clientY - treeArea.offsetTop;

    if (draggedItem) {
        const itemType = draggedItem.getAttribute("data-type");

        if (itemType === "node") {
            let value = prompt("Enter name of this node");
            draggedItem.setAttribute("data-value", value);
            const nodeValue = value;
            createNode(dropX, dropY, nodeValue);
            nodesInTree.push(nodeValue);  // Store node name in nodesInTree array
        }
    }
}

let lastClickTime = 0; // To track the timing of clicks for double-click detection

// Function to change the value of a node
function editNodeValue(node) {
    const currentValue = node.getAttribute("data-value");
    const newValue = prompt("Enter new value for this node", currentValue);
    if (newValue !== null && newValue.trim() !== "") {
        node.setAttribute("data-value", newValue);
        node.textContent = newValue; // Update the displayed value
        updateLines(node); // Update lines to ensure correct positioning
    }
}

// Function to change the parameter of a line
function editLineParameter(lineData) {
    const currentParameter = lineData.parameterLabel.innerText;
    const newParameter = prompt("Enter new parameter for this line", currentParameter);
    if (newParameter !== null && newParameter.trim() !== "") {
        lineData.parameterLabel.innerText = newParameter; // Update the displayed parameter
    }
}

// Function to handle double-click for deleting a node
function handleNodeDoubleClick(node) {
    const confirmed = confirm("Are you sure you want to delete this node?");
    if (confirmed) {
        // Remove the node
        node.remove();
        // Remove associated lines
        lines = lines.filter(lineData => {
            const isConnected = lineData.node1 === node || lineData.node2 === node;
            if (isConnected) {
                lineData.line.remove(); // Remove line from the DOM
                lineData.parameterLabel.remove(); // Remove parameter label from the DOM
            }
            return !isConnected; // Keep lines not connected to the deleted node
        });
        connections = connections.filter(connection => connection.node1 !== node && connection.node2 !== node);
    }
}

// Create a new node in the tree
function createNode(x, y, value) {
    const newNode = document.createElement("div");
    newNode.classList.add("node-in-tree");
    newNode.style.left = `${x}px`;
    newNode.style.top = `${y}px`;
    newNode.textContent = value;

    treeArea.appendChild(newNode);

    // Add click event listener to select nodes for line connection
    newNode.addEventListener("click", (e) => handleNodeClick(newNode, e));

    // Make the node draggable within the tree area to reposition
    newNode.addEventListener("mousedown", function (e) {
        const node = this;
        const offsetX = e.offsetX;
        const offsetY = e.offsetY;

        let isDragging = false;

        function moveNode(e) {
            isDragging = true;
            node.style.left = `${e.clientX - treeArea.offsetLeft - offsetX}px`;
            node.style.top = `${e.clientY - treeArea.offsetTop - offsetY}px`;
            updateLines(node);  // Update the lines when the node is moved
        }

        function stopMovingNode() {
            document.removeEventListener("mousemove", moveNode);
            document.removeEventListener("mouseup", stopMovingNode);
            if (!isDragging) {
                handleNodeClick(node);  // Only trigger click if it wasn't a drag
            }
        }

        document.addEventListener("mousemove", moveNode);
        document.addEventListener("mouseup", stopMovingNode);
    });
}

// Handle clicks on nodes to select two for line creation
function handleNodeClick(node) {
    if (selectedNodes.includes(node)) return;

    selectedNodes.push(node);

    if (selectedNodes.length === 2) {
        const node1 = selectedNodes[0];
        const node2 = selectedNodes[1];

        let parameter = prompt("Parameter of line (latency)");
        if (parameter === null || parameter.trim() === "") {
            selectedNodes = [];
            return;
        }

        createLineBetweenNodes(node1, node2, parameter);
        selectedNodes = [];
    }
}

// Create a line between two nodes
function createLineBetweenNodes(node1, node2, parameter) {
    // Check if the nodes are already connected
    if (isNodesConnected(node1, node2)) {
        alert('Nodes are already connected!');
        return;
    }

    const line = document.createElement("div");
    line.classList.add("line-in-tree");

    // Calculate the positions of the nodes
    const node1Rect = node1.getBoundingClientRect();
    const node2Rect = node2.getBoundingClientRect();

    const x1 = node1Rect.left + node1Rect.width / 2 - treeArea.offsetLeft;
    const y1 = node1Rect.top + node1Rect.height / 2 - treeArea.offsetTop;

    const x2 = node2Rect.left + node2Rect.width / 2 - treeArea.offsetLeft;
    const y2 = node2Rect.top + node2Rect.height / 2 - treeArea.offsetTop;

    // Calculate the length and angle of the line
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    // Style the line
    line.style.width = `${length}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;

    treeArea.appendChild(line);

    // Create a div for the parameter label
    const parameterLabel = document.createElement("div");
    parameterLabel.classList.add("val-in-line");
    parameterLabel.innerText = parameter;

    // Calculate the midpoint of the line
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Position the parameter label above the line
    parameterLabel.style.position = 'absolute';
    parameterLabel.style.left = `${midX}px`;
    parameterLabel.style.top = `${midY - 20}px`;  // Adjust to place it above the line

    treeArea.appendChild(parameterLabel);

    // Track the connection between the nodes
    connections.push({ node1, node2, line, parameterLabel, parameter: parseFloat(parameter) });
    lines.push({ line, parameterLabel, node1, node2 });  // Store for updating later
}

// Check if nodes are connected
function isNodesConnected(node1, node2) {
    return connections.some(connection =>
        (connection.node1 === node1 && connection.node2 === node2) ||
        (connection.node1 === node2 && connection.node2 === node1)
    );
}

// Update lines when nodes are moved
function updateLines(movedNode) {
    connections.forEach(({ line, parameterLabel, node1, node2 }) => {
        if (node1 === movedNode || node2 === movedNode) {
            const node1Rect = node1.getBoundingClientRect();
            const node2Rect = node2.getBoundingClientRect();

            const x1 = node1Rect.left + node1Rect.width / 2 - treeArea.offsetLeft;
            const y1 = node1Rect.top + node1Rect.height / 2 - treeArea.offsetTop;

            const x2 = node2Rect.left + node2Rect.width / 2 - treeArea.offsetLeft;
            const y2 = node2Rect.top + node2Rect.height / 2 - treeArea.offsetTop;

            // Calculate the length and angle of the line
            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

            // Update line position and dimensions
            line.style.width = `${length}px`;
            line.style.transform = `rotate(${angle}deg)`;
            line.style.left = `${x1}px`;
            line.style.top = `${y1}px`;

            // Update parameter position to stay centered above the line
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            parameterLabel.style.left = `${midX}px`;
            parameterLabel.style.top = `${midY - 20}px`;  // Keep it above the line
        }
    });
}

// Dijkstra's algorithm implementation
function findShortestPath(startNodeName, endNodeName) {
    const graph = createGraph();

    const distances = {};
    const previousNodes = {};
    const priorityQueue = new PriorityQueue();

    // Initialize distances and priority queue
    for (let node of Object.keys(graph)) {
        distances[node] = Infinity;
        previousNodes[node] = null;
        priorityQueue.enqueue(node, Infinity);
    }
    distances[startNodeName] = 0;
    priorityQueue.enqueue(startNodeName, 0);

    while (!priorityQueue.isEmpty()) {
        const currentNode = priorityQueue.dequeue().element;

        for (let neighbor in graph[currentNode]) {
            const distance = graph[currentNode][neighbor];
            const newDist = distances[currentNode] + distance;

            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previousNodes[neighbor] = currentNode;
                priorityQueue.enqueue(neighbor, newDist);
            }
        }
    }

    return constructPath(previousNodes, startNodeName, endNodeName);
}

// Create graph from connections
function createGraph() {
    const graph = {};
    connections.forEach(({ node1, node2, parameter }) => {
        const name1 = node1.textContent;
        const name2 = node2.textContent;

        if (!graph[name1]) graph[name1] = {};
        if (!graph[name2]) graph[name2] = {};

        graph[name1][name2] = parameter; // Use parameter as weight (latency)
        graph[name2][name1] = parameter; // Undirected graph
    });
    return graph;
}

// Construct path from end node to start node
function constructPath(previousNodes, startNodeName, endNodeName) {
    const path = [];
    let currentNode = endNodeName;

    while (currentNode) {
        path.unshift(currentNode);
        currentNode = previousNodes[currentNode];
    }

    if (path[0] === startNodeName) {
        return path; // Valid path found
    } else {
        return []; // No valid path found
    }
}

// Priority Queue implementation for Dijkstra's algorithm
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        const queueElement = { element, priority };
        this.items.push(queueElement);
        this.sort();
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }

    sort() {
        this.items.sort((a, b) => a.priority - b.priority);
    }
}

// Handle find path button click
document.getElementById("find-path-btn").addEventListener("click", function () {
    const transmitterNode = document.getElementById("transmitter").value.trim();
    const receiverNode = document.getElementById("receiver").value.trim();
    const path = findShortestPath(transmitterNode, receiverNode);

    if (path.length > 0) {
        alert(`Shortest path from ${transmitterNode} to ${receiverNode}: ${path.join(' -> ')}`);
    } else {
        alert(`No path found between ${transmitterNode} and ${receiverNode}.`);
    }
});

// Functions to set transmitter and receiver nodes
function setTransmitter() {
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
