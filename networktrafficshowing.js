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
    if (isNodesConnected(node1, node2)) {
        alert('Nodes are already connected!');
        return;
    }

    const line = document.createElement("div");
    line.classList.add("line-in-tree");

    const node1Rect = node1.getBoundingClientRect();
    const node2Rect = node2.getBoundingClientRect();

    const x1 = node1Rect.left + node1Rect.width / 2 - treeArea.offsetLeft;
    const y1 = node1Rect.top + node1Rect.height / 2 - treeArea.offsetTop;
    const x2 = node2Rect.left + node2Rect.width / 2 - treeArea.offsetLeft;
    const y2 = node2Rect.top + node2Rect.height / 2 - treeArea.offsetTop;

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
    connections.forEach(({ line, parameterLabel, node1, node2 }) => {
        if (node1 === movedNode || node2 === movedNode) {
            const node1Rect = node1.getBoundingClientRect();
            const node2Rect = node2.getBoundingClientRect();

            const x1 = node1Rect.left + node1Rect.width / 2 - treeArea.offsetLeft;
            const y1 = node1Rect.top + node1Rect.height / 2 - treeArea.offsetTop;
            const x2 = node2Rect.left + node2Rect.width / 2 - treeArea.offsetLeft;
            const y2 = node2Rect.top + node2Rect.height / 2 - treeArea.offsetTop;

            const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

            line.style.width = `${length}px`;
            line.style.transform = `rotate(${angle}deg)`;
            line.style.left = `${x1}px`;
            line.style.top = `${y1}px`;

            // Use updated dynamic weight
            const baseDistance = parseFloat(parameterLabel.innerText.split(" ")[0]);
            const loadFactor = getLoad(node1.textContent, node2.textContent); // From network file
            const dynamicWeight = getDynamicWeight(baseDistance, loadFactor); // From network file

            parameterLabel.innerHTML = `${baseDistance} <span style="color: green;">(${dynamicWeight.toFixed(2)})</span>`;

            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            parameterLabel.style.left = `${midX}px`;
            parameterLabel.style.top = `${midY - 20}px`;
        }
    });
}
