# Network Routing Optimization Project

This project provides a visualization tool and a routing algorithm for dynamically finding the shortest path between nodes in a network. Using graph-based algorithms, the project allows users to visualize a tree structure of nodes (representing devices like routers or switches) and simulate efficient data transmission from selected transmitter nodes to receiver nodes.

## Table of Contents
- [Features](#features)
- [How It Works](#how-it-works)
- [Usage](#usage)
- [Technologies Used](#technologies-used)

---

### Features

- *Interactive Tree Generation*: Users can input the number of nodes and links to automatically generate a network structure.
- *Shortest Path Routing*: Implements Dijkstra's algorithm to calculate the shortest path from selected transmitters to receivers.
- *Load Balancing and Efficient Routing*: Finds the shortest, least-latent path for efficient data transfer and displays the path in real time.
- *Dynamic Node and Link Creation*: Offers a draggable interface for manually creating nodes and links or using automatic generation from user input.
- *Node Overlap Prevention*: Ensures that new nodes are placed without overlapping existing nodes.
- Dynamic Visuals: Edge colors update dynamically to show path progress in real-time.


#### Prerequisites
- Basic knowledge of HTML, JavaScript
- Any modern web browser to run the project.


### How It Works

This project has two main parts:

1. *Node and Link Generation*:
   - The user can specify the number of nodes and links.
   - Random positions for nodes are generated and checked to prevent overlap.
   - Links are created with user-defined weights, which represent network parameters like latency.

2. *Routing Logic*:
   - Users specify transmitter nodes for data transmission.
   - The system calculates the shortest path for each receiver node to its nearest transmitter using Dijkstra's algorithm.
   - Pathfinding results are displayed in real time.

### Usage

1. *Generate Tree Structure*:
   - In the input fields, specify the number of nodes and links.
   - Click on the "Generate Connections" button to auto-generate the network.

2. *Add Transmitters*:
   - Input the transmitter nodes in the provided field, separated by commas.
   - Click "Initiate Routing" to begin calculating the shortest paths.

3. *Shortest Path Calculation*:
   - Each receiver will find the shortest path to the nearest transmitter.
   - A visual update will display the shortest path one edge at a time.
   
4. *Manual Mode*:
   - Alternatively, you can drag and drop nodes and create links manually for custom networks.

### Example Walkthrough

1. *Define Network Parameters*:
   - Set the number of nodes (n) and links (k) in the provided fields and press *Generate Connections*.

2. *Add Link Data*:
   - For each link, specify the two nodes it connects and a weight parameter, then click *Initiate Routing*.

3. *Set Transmitters and Start Routing*:
   - Enter transmitter nodes, initiate routing, and observe paths calculated dynamically.

4. *Find Shortest Path Between Any Two Device*:
    - Make one node a transmitter and any other node a receiver to view shortest path between them.

### Technologies Used

- *Frontend*: HTML, CSS, JavaScript
- *Algorithms*: Dijkstra's algorithm
- *Data Structures: Arrays, Priority Queue, Graph, Objects

### Future Improvements

- *Enhanced Visualization*: Add real-time visual indicators to represent packet movement across nodes.
- *Network Metrics*: Incorporated a parameter that is propotional to the network traffic.
- *Database Integration*: Store network configurations for quick retrieval and simulation of different network setups.


