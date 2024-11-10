// Function to handle node clicks with improved error handling
function handleNodeClick(node) {
    if (!node) {
        console.error("Invalid node clicked");
        return;
    }

    if (selectedNodes.includes(node)) {
        console.log("Node already selected");
        return;
    }

    selectedNodes.push(node);
    console.log("Selected nodes:", selectedNodes.length);

    if (selectedNodes.length === 2) {
        const node1 = selectedNodes[0];
        const node2 = selectedNodes[1];

        // Validate nodes before proceeding
        if (!node1 || !node2) {
            console.error("Invalid node selection");
            selectedNodes = [];
            return;
        }

        let latency = prompt("Parameter of line (latency)");
        if (latency === null || latency.trim() === "" || isNaN(parseFloat(latency))) {
            console.log("Invalid latency input");
            selectedNodes = [];
            return;
        }

        let bandwidth = prompt("Parameter of line (bandwidth)");
        if (bandwidth === null || bandwidth.trim() === "" || isNaN(parseFloat(bandwidth))) {
            console.log("Invalid bandwidth input");
            selectedNodes = [];
            return;
        }

        createLineBetweenNodes(node1, node2, latency, bandwidth);
        selectedNodes = [];
    }
}

// Create a line between two nodes with improved positioning and error handling
function createLineBetweenNodes(node1, node2, latency, bandwidth) {
    // Validate inputs
    if (!node1 || !node2) {
        console.error("Invalid nodes provided:", { node1, node2 });
        return;
    }

    if (!treeArea) {
        console.error("Tree area not found");
        return;
    }

    if (isNodesConnected(node1, node2)) {
        alert('Nodes are already connected!');
        return;
    }

    try {
        // Create line element
        const line = document.createElement("div");
        line.classList.add("line-in-tree");

        // Get positions with error checking
        const node1Rect = node1.getBoundingClientRect();
        const node2Rect = node2.getBoundingClientRect();
        const treeRect = treeArea.getBoundingClientRect();

        if (!node1Rect || !node2Rect || !treeRect) {
            console.error("Failed to get element boundaries");
            return;
        }

        // Calculate positions relative to tree area
        const x1 = node1Rect.left - treeRect.left + (node1Rect.width / 2);
        const y1 = node1Rect.top - treeRect.top + (node1Rect.height / 2);
        const x2 = node2Rect.left - treeRect.left + (node2Rect.width / 2);
        const y2 = node2Rect.top - treeRect.top + (node2Rect.height / 2);

        // Calculate line properties
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

        // Apply styles with error checking
        if (isNaN(length) || isNaN(angle)) {
            console.error("Invalid line calculations:", { length, angle });
            return;
        }

        // Set line position and properties
        line.style.width = `${length}px`;
        line.style.transform = `rotate(${angle}deg)`;
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.transformOrigin = "0 0";  // Add transform origin
        line.style.position = "absolute";    // Ensure absolute positioning

        // Create and position parameter label
        const parameterLabel = document.createElement("div");
        parameterLabel.classList.add("val-in-line");

        // Calculate dynamic weights
        const baseLatency = parseFloat(latency);
        const baseBandwidth = parseFloat(bandwidth);
        const loadFactor = getLoad(node1.textContent, node2.textContent);
        const dynamicLatency = getDynamicWeight(baseLatency, loadFactor);
        const dynamicBandwidth = getDynamicWeight(baseBandwidth, loadFactor);

        parameterLabel.innerHTML = `
            <div>L: ${latency} <span style="color: green;">(${dynamicLatency.toFixed(2)})</span></div>
            <div>B: ${bandwidth} <span style="color: blue;">(${dynamicBandwidth.toFixed(2)})</span></div>
        `;

        // Position the label
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        parameterLabel.style.position = 'absolute';
        parameterLabel.style.left = `${midX}px`;
        parameterLabel.style.top = `${midY - 30}px`;
        parameterLabel.style.transform = 'translate(-50%, -50%)'; // Center the label

        // Append elements to tree area
        treeArea.appendChild(line);
        treeArea.appendChild(parameterLabel);

        // Store connection information
        connections.push({ 
            node1, 
            node2, 
            line, 
            parameterLabel, 
            latency: baseLatency,
            bandwidth: baseBandwidth
        });
        
        lines.push({ line, parameterLabel, node1, node2 });

        console.log("Line created successfully");
    } catch (error) {
        console.error("Error creating line:", error);
    }
}
// Check if nodes are connected
function isNodesConnected(node1, node2) {
    return connections.some(connection =>
        (connection.node1 === node1 && connection.node2 === node2) ||
        (connection.node1 === node2 && connection.node2 === node1)
    );
}
