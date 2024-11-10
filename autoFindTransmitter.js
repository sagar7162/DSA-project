// Assuming nodesInTree is already populated after tree generation
document.getElementById("initiate-routing-btn").addEventListener("click", function () {
    // Step 1: Get the transmitter names from the input
    const transmitterNames = document.getElementById("transmitters").value
        .split(",")
        .map(name => name.trim())
        .filter(name => name);

    // Step 2: Check if all transmitters are in the tree
    const notFoundTransmitters = transmitterNames.filter(name => !nodesInTree.includes(name));
    if (notFoundTransmitters.length > 0) {
        alert('Transmitters not found in the tree: ${notFoundTransmitters.join(", ")}');
        console.log("Transmitters not found:", notFoundTransmitters);
        return;
    }

    // Step 3: Get receiver names (nodes not in the transmitter list)
    const receiverNames = nodesInTree.filter(name => !transmitterNames.includes(name));

    // Step 4: Process each receiver at an interval of 5 seconds
    receiverNames.forEach((receiver, index) => {
        setTimeout(() => {
            // Step 5: Find the nearest transmitter for each receiver
            const closestTransmitter = findNearestTransmitter(receiver, transmitterNames);

            if (closestTransmitter) {
                // Step 6: Find the shortest path to the nearest transmitter
                const path = findShortestPath(closestTransmitter, receiver);
                if (path && path.length > 0) {
                    console.log(`Path for ${receiver} to nearest transmitter ${closestTransmitter}: ${path.join(" -> ")}`);
                    alert(`Path for ${receiver} to nearest transmitter ${closestTransmitter}: ${path.join(" -> ")}`);
                } else {
                    console.log(`No path found for ${receiver} to reach any transmitter.`);
                }
            }
        }, index * 5000);
    });
});

// Updated findNearestTransmitter to check against nodesInTree
function findNearestTransmitter(receiver, transmitters) {
    let shortestPath = null;
    let nearestTransmitter = null;

    transmitters.forEach(transmitter => {
        const path = findShortestPath(transmitter, receiver,false);
        if (path && path.length > 0 && (!shortestPath || path.length < shortestPath.length)) {
            shortestPath = path;
            nearestTransmitter = transmitter;
        }
    });

    return nearestTransmitter;
}