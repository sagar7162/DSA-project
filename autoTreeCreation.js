// Variables to store node and link inputs
let autoNodes = [];
let autoLinks = [];

// Function to generate input fields for each link
function createTreeFromInput() {
    const nodeCount = parseInt(document.getElementById("node-count").value);
    const linkCount = parseInt(document.getElementById("link-count").value);
    autoNodes = Array.from({ length: nodeCount }, (_, i) => `${i+1}`);
    
    // Clear and create link inputs
    const linkInputSection = document.getElementById("link-input-section");
    linkInputSection.innerHTML = '';  // Clear previous inputs
    for (let i = 0; i < linkCount; i++) {
        const linkInput = document.createElement("div");
        linkInput.innerHTML = `
            <label>Link ${i+1}:</label>
            <input type="number" placeholder="Node 1" class="link-node1">
            <input type="number" placeholder="Node 2" class="link-node2">
            <input type="number" placeholder="Parameter" class="link-param">
        `;
        linkInputSection.appendChild(linkInput);
    }

    // Button to finalize inputs and render tree
    const finalizeButton = document.createElement("button");
    finalizeButton.textContent = "Generate Connections";
    finalizeButton.onclick = generateTreeFromInputs;
    linkInputSection.appendChild(finalizeButton);
}

// Function to check if a new node's position overlaps with any existing nodes
function checkOverlap(x, y) {
    const nodes = document.querySelectorAll(".node-in-tree");
    const margin = 50; // Adjust this margin as needed to ensure enough space between nodes

    for (let node of nodes) {
        const nodeRect = node.getBoundingClientRect();
        const nodeX = nodeRect.left + nodeRect.width / 2;
        const nodeY = nodeRect.top + nodeRect.height / 2;

        // Check if the new node's position overlaps with any existing node's position
        const distance = Math.sqrt((nodeX - x) ** 2 + (nodeY - y) ** 2);
        
        if (distance < margin) {
            return true; // There's an overlap
        }
    }

    return false; // No overlap
}

// Function to generate tree from user-defined nodes and links
function generateTreeFromInputs() {
    const linkInputs = document.querySelectorAll("#link-input-section > div");

    // Clear the existing tree area content before creating a new structure
    treeArea.innerHTML = "";

    const treeWidth = treeArea.offsetWidth;
    const treeHeight = treeArea.offsetHeight;

    // Create nodes
    autoNodes.forEach((nodeName) => {
        let x, y;

        do {
            // Generate random positions within the tree area
            x = Math.floor(Math.random() * (treeWidth - 100)); // Subtract margin to avoid edge
            y = Math.floor(Math.random() * (treeHeight - 100)); // Subtract margin to avoid edge
        } while (checkOverlap(x, y)); // Re-generate if overlap is detected
        //Promise(resolve => setTimeout(resolve, ms));
        createNode(x, y, nodeName);
    });

    // Create connections between nodes
    linkInputs.forEach(linkInput => {
        const node1Index = parseInt(linkInput.querySelector(".link-node1").value) - 1;
        //Promise(resolve => setTimeout(resolve, ms));
        const node2Index = parseInt(linkInput.querySelector(".link-node2").value) - 1;
        const parameter = parseInt(linkInput.querySelector(".link-param").value);

        if (node1Index >= 0 && node1Index < autoNodes.length &&
            node2Index >= 0 && node2Index < autoNodes.length) {

            const node1Name = autoNodes[node1Index];
            const node2Name = autoNodes[node2Index];

            // Find nodes by dataset name
            const node1 = [...document.querySelectorAll(".node-in-tree")].find(n => n.textContent === node1Name);
            const node2 = [...document.querySelectorAll(".node-in-tree")].find(n => n.textContent === node2Name);

            if (node1 && node2) {
                createLineBetweenNodes(node1, node2, parameter);
            } else {
                console.error(`Node not found for names: ${node1Name} or ${node2Name}`);
            }
        }
    });
}


