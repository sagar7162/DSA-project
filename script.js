const treeArea = document.getElementById("tree-area");

let draggedItem = null;
let selectedNodes = [];  // To store the two nodes to connect with a line

// Add event listeners to all draggable items
document.querySelectorAll(".draggable").forEach(item => {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragend", handleDragEnd);
});

treeArea.addEventListener("dragover", handleDragOver);
treeArea.addEventListener("drop", handleDrop);

// Handle when an item starts being dragged
function handleDragStart(e) {
    draggedItem = this;
    setTimeout(() => this.classList.add("hidden"), 0);
}

// Handle when dragging ends
function handleDragEnd(e) {
    this.classList.remove("hidden");
    draggedItem = null;
}

// Allow items to be dragged over the tree area
function handleDragOver(e) {
    e.preventDefault();
}

// Handle when an item is dropped in the tree area
function handleDrop(e) {
    e.preventDefault();
    const dropX = e.clientX - treeArea.offsetLeft;
    const dropY = e.clientY - treeArea.offsetTop;

    if (draggedItem) {
        const itemType = draggedItem.getAttribute("data-type");

        if (itemType === "node") {
            let value = prompt("Enter name of this node")
            draggedItem.setAttribute("data-value", value);
            const nodeValue = value;
            createNode(dropX, dropY, nodeValue);
        } 
    }
}

// Create a new node in the tree
function createNode(x, y, value) {
    const newNode = document.createElement("div");
    newNode.classList.add("node-in-tree");
    newNode.style.left = `${x}px`;
    newNode.style.top = `${y}px`;
    
    newNode.textContent = value;


    treeArea.appendChild(newNode);

    // Add click event listener to select nodes for line connection
    newNode.addEventListener("click", () => handleNodeClick(newNode));

    // Make the node draggable within the tree area to reposition
    newNode.addEventListener("mousedown", function (e) {
        const node = this;
        const offsetX = e.offsetX;
        const offsetY = e.offsetY;

        function moveNode(e) {
            node.style.left = `${e.clientX - treeArea.offsetLeft - offsetX}px`;
            node.style.top = `${e.clientY - treeArea.offsetTop - offsetY}px`;
        }

        function stopMovingNode() {
            document.removeEventListener("mousemove", moveNode);
            document.removeEventListener("mouseup", stopMovingNode);
        }

        document.addEventListener("mousemove", moveNode);
        document.addEventListener("mouseup", stopMovingNode);
    });
}

// Handle clicks on nodes to select two for line creation
function handleNodeClick(node) {
    // Add the node to the selectedNodes array
    selectedNodes.push(node);

    // If we have two nodes, we create a line between them
    if (selectedNodes.length === 2) {
        createLineBetweenNodes(selectedNodes[0], selectedNodes[1]);
        selectedNodes = [];  // Reset the array for next line
    }
}

// Create a line between two nodes
function createLineBetweenNodes(node1, node2) {
    const line = document.createElement("div");
    line.classList.add("line-in-tree");

    // Calculate the positions of the nodes
    const node1Rect = node1.getBoundingClientRect();
    const node2Rect = node2.getBoundingClientRect();

    const x1 = node1Rect.left + node1Rect.width / 2 - treeArea.offsetLeft;
    const y1 = node1Rect.top + node1Rect.height / 2 - treeArea.offsetTop;

    const x2 = node2Rect.left + node2Rect.width / 2 - treeArea.offsetLeft;
    const y2 = node2Rect.top + node2Rect.height / 2 - treeArea.offsetTop;

    // Calculate the length and angle of the line
    const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

    // Position and style the line
    line.style.width = `${length}px`;
    line.style.transform = `rotate(${angle}deg)`;
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.zIndex = 0; 
    treeArea.appendChild(line);

//line parameter
    const parameter = document.createElement("div");
parameter.classList.add("val-in-line");

let val = prompt("Parameter of line");
parameter.innerText = `${val}`;

// Calculate midpoint of the line
const midX = (x1 + x2) / 2;
const midY = (y1 + y2) / 2;

// Style the parameter div
parameter.style.position = 'absolute';  // Make sure it's absolutely positioned
parameter.style.transform = `rotate(${angle}deg)`;

// Set the width of the parameter div (optional, depending on how you want to style it)
parameter.style.width = 'auto';
parameter.style.whiteSpace = 'nowrap';  // Ensure it doesn't wrap

// Adjust position to center the number on the line
parameter.style.left = `${midX}px`;
parameter.style.top = `${midY - 20}px`;  // Offset upwards to ensure it appears above the line
parameter.style.zIndex = 1; 

// Optionally adjust based on line direction (to make sure the text stays above the line)
if (angle < 0) {
    parameter.style.top = `${midY - 20}px`;  // Keep it above if line is slanted negatively
} else {
    parameter.style.top = `${midY - 30}px`;  // Keep it a bit higher if line is positively slanted
}

// Append the parameter div to the tree area
treeArea.appendChild(parameter);

    

}
