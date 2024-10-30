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