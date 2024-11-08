// Function to handle node clicks
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
    if (!node1) {
        console.error("nodes are missing :1");
        return; // Exit the function if nodes are missing
    }
    if (!node2) {
        console.error("nodes are missing:2");
        return; // Exit the function if nodes are missing
    }
    if (isNodesConnected(node1, node2)) {
        alert('Nodes are already connected!');
        return;
    }

    const line = document.createElement("div");
    line.classList.add("line-in-tree");

    const node1Rect = node1.getBoundingClientRect();
    const node2Rect = node2.getBoundingClientRect();
    // Get the tree area position relative to the page
    const treeRect = treeArea.getBoundingClientRect();
    // Calculate the positions relative to the treeArea
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

    treeArea.appendChild(line);

    const parameterLabel = document.createElement("div");
    parameterLabel.classList.add("val-in-line");

    // Use dynamic weight from the other JS file
    const baseDistance = parseFloat(parameter);
    const loadFactor = getLoad(node1.textContent, node2.textContent); // From network file
    const dynamicWeight = getDynamicWeight(baseDistance, loadFactor); // From network file

    parameterLabel.innerHTML = `${parameter} <span style="color: green;">(${dynamicWeight.toFixed(2)})</span>`;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    parameterLabel.style.position = 'absolute';
    parameterLabel.style.left = `${midX}px`;
    parameterLabel.style.top = `${midY - 20}px`;

    treeArea.appendChild(parameterLabel);

    connections.push({ node1, node2, line, parameterLabel, parameter: baseDistance });
    lines.push({ line, parameterLabel, node1, node2 });
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
    connections.forEach(({ line, parameterLabel, node1, node2, parameter }) => {
        if (node1 === movedNode || node2 === movedNode) {
            // Get the updated positions of the nodes after moving
            const node1Rect = node1.getBoundingClientRect();
            const node2Rect = node2.getBoundingClientRect();

            // Get the position of the tree area
            const treeRect = treeArea.getBoundingClientRect();

            // Calculate the center positions of both nodes relative to the treeArea
            const x1 = node1Rect.left - treeRect.left + node1Rect.width / 2;
            const y1 = node1Rect.top - treeRect.top + node1Rect.height / 2;
            const x2 = node2Rect.left - treeRect.left + node2Rect.width / 2;
            const y2 = node2Rect.top - treeRect.top + node2Rect.height / 2;

            // Calculate the length and angle between the nodes
            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

            // Update the line styles to reflect the new positions
            line.style.width = `${length}px`;
            line.style.transform = `rotate(${angle}deg)`;
            line.style.left = `${x1}px`;
            line.style.top = `${y1}px`;

            // Recalculate dynamic weight and update the label
            const loadFactor = getLoad(node1.textContent, node2.textContent); // From network file
            const dynamicWeight = getDynamicWeight(parameter, loadFactor); // From network file
            parameterLabel.innerHTML = `${parameter} <span style="color: green;">(${dynamicWeight.toFixed(2)})</span>`;

            // Position the parameter label at the midpoint between the nodes
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            parameterLabel.style.left = `${midX - parameterLabel.offsetWidth / 2}px`; // Adjusted to center the label
            parameterLabel.style.top = `${midY - 20}px`; // Adjusted for spacing above the line
        }
    });
}

