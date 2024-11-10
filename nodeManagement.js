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
// function editLineParameter(lineData) {
//     const currentParameter = lineData.parameterLabel.innerText;
//     const newParameter = prompt("Enter new parameter for this line", currentParameter);
//     if (newParameter !== null && newParameter.trim() !== "") {
//         lineData.parameterLabel.innerText = newParameter; // Update the displayed parameter
//     }
// }

// Function to handle double-click for editing or deleting a node
function handleNodeDoubleClick(node) {
    const action = prompt("Type 'edit' to rename, 'delete' to remove this node:");
    if (action === "edit") {
        editNodeValue(node);
    } else if (action === "delete") {
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
}

// Create a new node in the tree
function createNode(x, y, value) {
    if (pathAnimationInProgress) {
        alert("Please wait for path animation to complete before creating new nodes.");
        return;
    }
    const newNode = document.createElement("div");
    newNode.classList.add("node-in-tree");
    newNode.style.left = `${x}px`;
    newNode.style.top = `${y}px`;
    newNode.textContent = value;

    treeArea.appendChild(newNode);

    // Add click event listener to select nodes for line connection
    newNode.addEventListener("click", (e) => handleNodeClick(newNode, e));
    
    // Handle double-click to edit or delete the node
    newNode.addEventListener("dblclick", () => handleNodeDoubleClick(newNode));

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
// Event listener for double-clicking a line to edit its parameter
lines.forEach(lineData => {
    lineData.line.addEventListener("dblclick", () => editLineParameter(lineData));
});
function resetPathVisualization() {
    pathAnimationInProgress = false;
    clearAnimations();
    // Reset all connection lines to their original color
    connections.forEach(conn => {
        conn.line.style.backgroundColor = "black";
    });
}

// Add a function to check if node creation is allowed
function canCreateNode() {
    return !pathAnimationInProgress;
}
function updateLines(movedNode) {
    connections.forEach(({ line, parameterLabel, node1, node2, latency, bandwidth }) => {
        if (node1 === movedNode || node2 === movedNode) {
            const node1Rect = node1.getBoundingClientRect();
            const node2Rect = node2.getBoundingClientRect();
            const treeRect = treeArea.getBoundingClientRect();

            const x1 = node1Rect.left - treeRect.left + node1Rect.width / 2;
            const y1 = node1Rect.top - treeRect.top + node1Rect.height / 2;
            const x2 = node2Rect.left - treeRect.left + node2Rect.width / 2;
            const y2 = node2Rect.top - treeRect.top + node2Rect.height / 2;

            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

            line.style.width = `${length}px`;
            line.style.transform = `rotate(${angle}deg)`;
            line.style.left = `${x1}px`;
            line.style.top = `${y1}px`;

            // Update both parameters
            const loadFactor = getLoad(node1.textContent, node2.textContent);
            const dynamicLatency = getDynamicWeight(latency, loadFactor);
            const dynamicBandwidth = getDynamicWeight(bandwidth, loadFactor);
            
            parameterLabel.innerHTML = `
                <div>L: ${latency} <span style="color: green;">(${dynamicLatency.toFixed(2)})</span></div>
                <div>B: ${bandwidth} <span style="color: blue;">(${dynamicBandwidth.toFixed(2)})</span></div>
            `;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            parameterLabel.style.left = `${midX - parameterLabel.offsetWidth / 2}px`;
            parameterLabel.style.top = `${midY - 30}px`;
        }
    });
}
