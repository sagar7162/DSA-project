// Store load factors for all edges in memory
const loadFactors = new Map();

// Function to find the shortest path and update load factors
function findShortestPath(startNodeName, endNodeName) {
    const graph = createGraph();

    const distances = {};
    const previousNodes = {};
    const priorityQueue = new PriorityQueue();

    // Initialize distances and priority queue
    for (let node of Object.keys(graph)) {
        distances[node] = Infinity;
        previousNodes[node] = null;
        priorityQueue.enqueue(node, Infinity);
    }
    distances[startNodeName] = 0;
    priorityQueue.enqueue(startNodeName, 0);

    while (!priorityQueue.isEmpty()) {
        const currentNode = priorityQueue.dequeue().element;

        for (let neighbor in graph[currentNode]) {
            const baseDistance = graph[currentNode][neighbor];
            const loadFactor = getLoad(currentNode, neighbor);
            const dynamicWeight = getDynamicWeight(baseDistance, loadFactor);

            const newDist = distances[currentNode] + dynamicWeight;

            if (newDist < distances[neighbor]) {
                distances[neighbor] = newDist;
                previousNodes[neighbor] = currentNode;
                priorityQueue.enqueue(neighbor, newDist);
            }
        }
    }

    // Construct and update the path
    const path = constructPath(previousNodes, startNodeName, endNodeName);
    updateLoadFactors(path);
    return path;
}

// Calculate dynamic weight based on load and distance
function getDynamicWeight(baseDistance, loadFactor) {
    const loadWeight = 1 + loadFactor; // Adjust the load factor as needed
    return baseDistance * loadWeight;
}

// Retrieve the load factor for an edge
function getLoad(node1, node2) {
    const key = createEdgeKey(node1, node2);
    return loadFactors.get(key) || 0; // Default to 0 if not set
}

// Update the load factors of edges in the path
function updateLoadFactors(path) {
    const increment = 0.1; // Fixed amount to increment load factor

    for (let i = 0; i < path.length - 1; i++) {
        const node1 = path[i];
        const node2 = path[i + 1];
        const key = createEdgeKey(node1, node2);

        const currentLoad = loadFactors.get(key) || 0;
        loadFactors.set(key, currentLoad + increment);
    }
}

// Helper function to create a unique key for an edge
function createEdgeKey(node1, node2) {
    return `${node1}-${node2}`;
}

// Create graph from connections
function createGraph() {
    const graph = {};
    connections.forEach(({ node1, node2, parameter }) => {
        const name1 = node1.textContent;
        const name2 = node2.textContent;

        if (!graph[name1]) graph[name1] = {};
        if (!graph[name2]) graph[name2] = {};

        graph[name1][name2] = parameter; // Use parameter as weight (latency)
        graph[name2][name1] = parameter; // Undirected graph
    });
    return graph;
}

// Construct path from end node to start node
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

// Priority Queue implementation for Dijkstra's algorithm
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
