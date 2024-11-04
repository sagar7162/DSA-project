// Dijkstra's algorithm implementation
function findShortestPath(startNodeName, endNodeName) {
    const graph = createGraph();

    console.log("findShortestPath.js");


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
            console.log(`Dynamic weight from ${currentNode} to ${neighbor}: ${dynamicWeight}`);
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
    
    // Update dynamic weights in the UI for each connection in the path
    path.forEach((node, index) => {
        if (index < path.length - 1) {
            const nextNode = path[index + 1];
            const connection = connections.find(conn => 
                (conn.node1.textContent === node && conn.node2.textContent === nextNode) ||
                (conn.node1.textContent === nextNode && conn.node2.textContent === node)
            );

            if (connection) {
                const baseDistance = connection.parameter; // Original parameter
                const loadFactor = getLoad(node, nextNode);
                const dynamicWeight = getDynamicWeight(baseDistance, loadFactor);

                // Update parameter label to show original and dynamic weights
                connection.parameterLabel.innerHTML = `${baseDistance} <span style="color: green;">(${dynamicWeight.toFixed(2)})</span>`;
            }
        }
    });

    return path;
}


// Create graph from connections
function createGraph() {

    console.log("createGraph.js");
    
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

    console.log("constructPath.js");

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