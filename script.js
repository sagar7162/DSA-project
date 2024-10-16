const treeArea = document.getElementById("tree-area");

let draggedItem = null;
let selectedNodes = [];  // To store the two nodes to connect with a line
let connections = []; // Store all node connections (nodes and their lines)
let lines = []; // Store all lines to update positions when nodes move

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
    // Avoid selecting the same node multiple times or connected nodes
    if (selectedNodes.includes(node)) {
        return;
    }

    selectedNodes.push(node);

    // If two nodes are selected, create a line between them
    if (selectedNodes.length === 2) {
        const node1 = selectedNodes[0];
        const node2 = selectedNodes[1];

        // Prompt for line parameter
        let parameter = prompt("Parameter of line");

        // If user cancels the prompt or enters an empty value, don't create a line
        if (parameter === null || parameter.trim() === "") {
            selectedNodes = [];
            return;
        }

        createLineBetweenNodes(node1, node2, parameter);
        selectedNodes = [];  // Reset the array for the next line
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
    connections.push({ node1, node2, line, parameterLabel });
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
