// Handle find path button click
document.getElementById("find-path-btn").addEventListener("click", function () {
    
    const transmitterNode = document.getElementById("transmitter").value.trim();
    const receiverNode = document.getElementById("receiver").value.trim();
    const path = findShortestPath(transmitterNode, receiverNode,true);

    if (path.length > 0) {
        alert(`Shortest path from ${transmitterNode} to ${receiverNode}: ${path.join(' -> ')}`);
        highlightPath(path);
    } else {
        alert(`No path found between ${transmitterNode} and ${receiverNode}.`);
    }
});


// Function to highlight each connection in the path with an interval
// function highlightPath(path) {
//     const interval = 500; // Interval in milliseconds between highlights

//     path.forEach((node, index) => {
//         if (index < path.length - 1) {
//             const nextNode = path[index + 1];

//             setTimeout(() => {
//                 highlightConnection(node, nextNode);
//             }, index * interval); // Delay each highlight based on its index
//         }
//     });
// }

// // Function to highlight a connection between two nodes
// // Function to highlight a connection between two nodes
// function highlightConnection(node1Name, node2Name) {
//     const connection = connections.find(conn => 
//         (conn.node1 && conn.node1.textContent === node1Name && conn.node2 && conn.node2.textContent === node2Name) ||
//         (conn.node1 && conn.node1.textContent === node2Name && conn.node2 && conn.node2.textContent === node1Name)
//     );

//     if (connection) {
//         if (connection.node1 && connection.node2 && connection.lineElement) {
//             // Add the highlight class to both nodes and the connecting line
//             connection.node1.classList.add("highlighted");
//             connection.node2.classList.add("highlighted");
//             connection.lineElement.classList.add("highlight");
            
//             // Optionally remove the highlight after some time
//             setTimeout(() => {
//                 connection.node1.classList.remove("highlighted");
//                 connection.node2.classList.remove("highlighted");
//                 connection.lineElement.classList.remove("highlight");
//             }, 400); // Keep it highlighted for a short duration
//         }
//     } else {
//         console.warn(`Connection not found for nodes: ${node1Name}, ${node2Name}`);
//     }
// }


// Functions to set transmitter and receiver nodes
function setTransmitter() {
    console.log("setTransmitter");


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
    console.log("setReceiver");

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
