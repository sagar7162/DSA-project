const loadFactors = new Map();
let pathAnimationInProgress = false;
function findShortestPath(startNodeName, endNodeName) {
    if (pathAnimationInProgress) {
        console.log("Path animation in progress, please wait");
        return [];
    }

    pathAnimationInProgress = true;
    let preference = prompt("Which parameter is more important?\n1: Latency\n2: Bandwidth\n3: Both equally");
    
    if (!["1", "2", "3"].includes(preference)) {
        preference = "3";
    }
    
    const weights = {
        "1": { latency: 0.9, bandwidth: 0.1 },
        "2": { latency: 0.1, bandwidth: 0.9 },
        "3": { latency: 0.5, bandwidth: 0.5 }
    }[preference];

    console.log(`Using weights: latency=${weights.latency}, bandwidth=${weights.bandwidth}`);

    const graph = createGraph();
    
    if (!graph[startNodeName] || !graph[endNodeName]) {
        console.error("Start or end node not found in graph");
        pathAnimationInProgress = false;
        return [];
    }

    const distances = {};
    const previousNodes = {};
    const unvisited = new Set(Object.keys(graph));
    
    // Initialize distances
    for (let node of unvisited) {
        distances[node] = node === startNodeName ? 0 : Infinity;
        previousNodes[node] = null;
    }

    while (unvisited.size > 0) {
        // Find node with minimum distance
        let currentNode = null;
        let minDistance = Infinity;
        
        for (const node of unvisited) {
            if (distances[node] < minDistance) {
                currentNode = node;
                minDistance = distances[node];
            }
        }

        if (currentNode === null || distances[currentNode] === Infinity) {
            break; // No reachable nodes
        }

        if (currentNode === endNodeName) {
            break; // Found destination
        }

        unvisited.delete(currentNode);

        // Check all neighbors
        for (let neighbor in graph[currentNode]) {
            if (!unvisited.has(neighbor)) continue;

            const edge = graph[currentNode][neighbor];
            const loadFactor = getLoad(currentNode, neighbor);

            // Calculate effective metrics
            const effectiveLatency = edge.latency * (1 + loadFactor);
            const effectiveBandwidth = edge.bandwidth *(1 + loadFactor);

            // Normalize both metrics consistently
            const normalizedLatency = effectiveLatency ;
            const normalizedBandwidth = effectiveBandwidth ;

            // Calculate edge cost
            const edgeCost = (normalizedLatency * weights.latency) + 
                           (normalizedBandwidth * weights.bandwidth);

            const newDistance = distances[currentNode] + edgeCost;

            if (newDistance < distances[neighbor]) {
                distances[neighbor] = newDistance;
                previousNodes[neighbor] = currentNode;
            }
        }
    }

    // Reconstruct path
    const path = [];
    let current = endNodeName;
    
    while (current !== null) {
        path.unshift(current);
        current = previousNodes[current];
    }

    if (path.length === 0 || path[0] !== startNodeName) {
        console.error("No valid path found between", startNodeName, "and", endNodeName);
        pathAnimationInProgress = false;
        return [];
    }

    // Calculate final path metrics
    let totalLatency = 0;
    let minBandwidth = Infinity;
    
    for (let i = 0; i < path.length - 1; i++) {
        const node1 = path[i];
        const node2 = path[i + 1];
        const edge = graph[node1][node2];
        const loadFactor = getLoad(node1, node2);
        
        const effectiveLatency = edge.latency * (1 + loadFactor);
        const effectiveBandwidth = edge.bandwidth * (1 + loadFactor);
        
        totalLatency += effectiveLatency;
        minBandwidth = Math.min(minBandwidth, effectiveBandwidth);
        
        console.log(`Segment ${node1}->${node2}:`, {
            baseLatency: edge.latency,
            effectiveLatency,
            baseBandwidth: edge.bandwidth,
            effectiveBandwidth,
            loadFactor,
            normalizedLatency: effectiveLatency / (effectiveLatency + 1),
            normalizedBandwidth: 1 / (effectiveBandwidth + 1)
        });
    }

    console.log("Path metrics:", {
        path,
        totalLatency,
        effectiveBandwidth: minBandwidth,
        hopCount: path.length - 1
    });

    updateLoadFactors(path);
    updateConnectionParameters(path, preference);
    return path;
}

// Helper function to create edge key
function createEdgeKey(node1, node2) {
    // Sort nodes to ensure consistent key regardless of order
    const nodes = [node1, node2].sort();
    return `${nodes[0]}-${nodes[1]}`;
}

// Get load factor for an edge
function getLoad(node1, node2) {
    const key = createEdgeKey(node1, node2);
    return loadFactors.get(key) || 0;
}

// Create graph structure from connections
function createGraph() {
    const graph = {};
    
    connections.forEach(({ node1, node2, latency, bandwidth }) => {
        const name1 = node1.textContent;
        const name2 = node2.textContent;

        if (!graph[name1]) graph[name1] = {};
        if (!graph[name2]) graph[name2] = {};

        // Validate parameters
        const validLatency = parseFloat(latency);
        const validBandwidth = parseFloat(bandwidth);

        if (isNaN(validLatency) || isNaN(validBandwidth) || 
            validLatency <= 0 || validBandwidth <= 0) {
            console.error(`Invalid parameters for edge ${name1}-${name2}`);
            return;
        }

        graph[name1][name2] = {
            latency: validLatency,
            bandwidth: validBandwidth
        };

        graph[name2][name1] = {
            latency: validLatency,
            bandwidth: validBandwidth
        };
    });

    return graph;
}
// Update load factors for path
function updateLoadFactors(path) {
    const increment = 0.1;
    
    for (let i = 0; i < path.length - 1; i++) {
        const key = createEdgeKey(path[i], path[i + 1]);
        const currentLoad = loadFactors.get(key) || 0;
        loadFactors.set(key, currentLoad + increment);
    }
}

// Update visual parameters
function updateConnectionParameters(path, preference) {
    if (!document.getElementById('connections')) {
        console.error('SVG container not found');
        pathAnimationInProgress = false;
        return;
    }

    clearAnimations();

    let animationCount = 0;
    const totalAnimations = path.length - 1;

    const animateNextLine = (index) => {
        if (index >= path.length - 1) {
            pathAnimationInProgress = false;
            return;
        }

        const node = path[index];
        const nextNode = path[index + 1];
        const connection = connections.find(conn => 
            (conn.node1.textContent === node && conn.node2.textContent === nextNode) ||
            (conn.node1.textContent === nextNode && conn.node2.textContent === node)
        );

        if (connection) {
            connection.line.style.backgroundColor = "red";

            const loadFactor = getLoad(node, nextNode);
            const effectiveLatency = connection.latency * (1 + loadFactor);
            const effectiveBandwidth = connection.bandwidth * (1 + loadFactor);

            let parameterHTML;
            switch(preference) {
                case "1":
                    parameterHTML = `
                        <div><strong style="color: green;">L: ${connection.latency} (${effectiveLatency.toFixed(2)})</strong></div>
                        <div style="opacity: 0.7;">B: ${connection.bandwidth} (${effectiveBandwidth.toFixed(2)})</div>
                    `;
                    break;
                case "2":
                    parameterHTML = `
                        <div style="opacity: 0.7;">L: ${connection.latency} (${effectiveLatency.toFixed(2)})</div>
                        <div><strong style="color: blue;">B: ${connection.bandwidth} (${effectiveBandwidth.toFixed(2)})</strong></div>
                    `;
                    break;
                default:
                    parameterHTML = `
                        <div>L: ${connection.latency} <span style="color: green;">(${effectiveLatency.toFixed(2)})</span></div>
                        <div>B: ${connection.bandwidth} <span style="color: blue;">(${effectiveBandwidth.toFixed(2)})</span></div>
                    `;
            }

            if (connection.parameterLabel) {
                connection.parameterLabel.innerHTML = parameterHTML;
            }

            setTimeout(() => {
                connection.line.style.backgroundColor = "black";
                animationCount++;
                if (animationCount === totalAnimations) {
                    pathAnimationInProgress = false;
                }
                animateNextLine(index + 1);
            }, 6000);
        } else {
            animateNextLine(index + 1);
        }
    };

    animateNextLine(0);
}

// Clear previous animations
function clearAnimations() {
    const svg = document.getElementById('connections');
    if (svg) {
        const existingAnimatedLines = svg.getElementsByClassName('animated-path');
        while (existingAnimatedLines.length > 0) {
            existingAnimatedLines[0].remove();
        }
    }
}
function getDynamicWeight(baseDistance, loadFactor) {
    const loadWeight = 1 + loadFactor; // Adjust the load factor as needed
    return baseDistance * loadWeight;
}
function getDynamicLatencyWeight(baseLatency, loadFactor) {
    return baseLatency * (1 + loadFactor);
}

function getDynamicBandwidthWeight(baseBandwidth, loadFactor) {
    return baseBandwidth * (1 +(loadFactor)); // Reduce bandwidth as load increases
}

// Helper function to validate edge parameters
function validateEdgeParameters(edge) {
    return edge && 
           !isNaN(edge.latency) && 
           !isNaN(edge.bandwidth) && 
           edge.latency > 0 && 
           edge.bandwidth > 0;
}
// Helper function to get edge parameters between two nodes
function getEdgeParameters(node1Name, node2Name) {
    const graph = createGraph();
    if (graph[node1Name] && graph[node1Name][node2Name]) {
        return graph[node1Name][node2Name];
    }
    return null;
}
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        const queueElement = { element, priority };
        this.items.push(queueElement);
        this.sort();
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }

    sort() {
        this.items.sort((a, b) => a.priority - b.priority);
    }
}
function constructPath(previousNodes, startNodeName, endNodeName) {
    const path = [];
    let currentNode = endNodeName;

    while (currentNode) {
        path.unshift(currentNode);
        currentNode = previousNodes[currentNode];
    }

    if (path[0] === startNodeName) {
        return path; // Valid path found
    } else {
        return []; // No valid path found
    }
}
