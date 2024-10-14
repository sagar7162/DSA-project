const treeArea = document.getElementById("tree-area");

let draggedItem = null;
let selectedNodes = [];  // To store the two nodes to connect with a line
let connections = [];    // Store connections (nodes and lines)
let lines = []; // Store line objects to update their positions

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
        }
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

        function moveNode(e) {
            node.style.left = `${e.clientX - treeArea.offsetLeft - offsetX}px`;
            node.style.top = `${e.clientY - treeArea.offsetTop - offsetY}px`;
            updateLines(node);  // Update the lines when the node is moved
        }

        function stopMovingNode() {
            document.removeEventListener("mousemove", moveNode);
            document.removeEventListener("mouseup", stopMovingNode);
        }

        document.addEventListener("mousemove", moveNode);
        document.addEventListener("mouseup", stopMovingNode);
    });
}

// Handle clicks on nodes to select two for line creation
function handleNodeClick(node) {
    // Avoid selecting the same node multiple times or connected nodes
    if (selectedNodes.includes(node)) {
        return;
    }

    selectedNodes.push(node);

    // If two nodes are selected, create a line between them
    if (selectedNodes.length === 2) {
        createLineBetweenNodes(selectedNodes[0], selectedNodes[1]);
        selectedNodes = [];  // Reset the array for the next line
    }
}

// Check if a line already exists between two nodes
function lineExists(node1, node2) {
    return connections.some(({ node1: n1, node2: n2 }) => 
        (n1 === node1 && n2 === node2) || (n1 === node2 && n2 === node1)
    );
}

// Check if a node is already part of an existing line
function isNodePartOfExistingLine(node) {
    return connections.some(({ node1, node2 }) => node1 === node || node2 === node);
}

// Function to create a line between two nodes
function createLineBetweenNodes(node1, node2) {
    // Check if the nodes are already connected
    if (isNodesConnected(node1, node2)) {
        alert('Nodes are already connected!');
        return;  // If connected, do nothing
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

    // Prompt for line parameter only if creating a new line
    const parameter = document.createElement("div");
    parameter.classList.add("val-in-line");

    let val = prompt("Parameter of line");
    parameter.innerText = `${val}`;
    parameter.style.position = 'absolute';
    parameter.style.width = 'auto';
    parameter.style.whiteSpace = 'nowrap';

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    parameter.style.left = `${midX}px`;
    parameter.style.top = `${midY - 20}px`;  // Adjust to place it above the line
    treeArea.appendChild(parameter);

    // Track the connection between the nodes
    connections.push({ node1, node2, line });
    lines.push({ line, parameter, node1, node2 });  // Store for updating later
}

function isNodesConnected(node1, node2) {
    return connections.some(connection =>
        (connection.node1 === node1 && connection.node2 === node2) ||
        (connection.node1 === node2 && connection.node2 === node1)
    );
}

// Update lines when nodes are moved
function updateLines(movedNode) {
    lines.forEach(({ line, parameter, node1, node2 }) => {
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

            // Update parameter position
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            parameter.style.left = `${midX}px`;
            parameter.style.top = `${midY - 20}px`;  // Keep it above the line
        }
    });
}
