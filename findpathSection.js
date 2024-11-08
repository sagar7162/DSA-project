document.getElementById("initiate-routing-btn").addEventListener("click", function () {
    // Get transmitter nodes from input
    const transmitterNames = document.getElementById("transmitters").value
        .split(",")
        .map(name => name.trim())
        .filter(name => name); // Remove any empty strings

    const notFoundTransmitters = transmitterNames.filter(name => !nodesInTree.includes(name));
    if (notFoundTransmitters.length > 0) {
        alert(`Transmitters not found in the tree: ${notFoundTransmitters.join(", ")}`);
        return;
    }

    // Mark nodes visually as transmitters
    transmitterNames.forEach(name => {
        const nodeElement = [...treeArea.children].find(el => el.textContent === name);
        if (nodeElement) {
            nodeElement.classList.add("transmitter");
        }
    });

    // Get all nodes and determine receivers (nodes not listed as transmitters)
    const receiverNames = nodesInTree.filter(name => !transmitterNames.includes(name));

    // Process each receiver with a delay of 2 seconds between each
    receiverNames.forEach((receiver, index) => {
        setTimeout(() => {
            const closestTransmitter = findNearestTransmitter(receiver, transmitterNames);

            if (closestTransmitter) {
                const path = findShortestPath(closestTransmitter, receiver);
                if (path.length > 0) {
                    console.log(`Path for ${receiver} to nearest transmitter ${closestTransmitter}: ${path.join(" -> ")}`);
                    alert(`Path for ${receiver} to nearest transmitter ${closestTransmitter}: ${path.join(" -> ")}`);
                } else {
                    console.log(`No path found for ${receiver} to reach any transmitter.`);
                }
            }
        }, index * 10000); // 10-second gap between each receiver's pathfinding
    });
});

// Helper function to find the nearest transmitter for a given receiver
function findNearestTransmitter(receiver, transmitters) {
    let shortestPath = [];
    let nearestTransmitter = null;

    transmitters.forEach(transmitter => {
        const path = findShortestPath(transmitter, receiver);
        if (path.length > 0 && (shortestPath.length === 0 || path.length < shortestPath.length)) {
            shortestPath = path;
            nearestTransmitter = transmitter;
        }
    });

    return nearestTransmitter;
}