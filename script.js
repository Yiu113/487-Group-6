document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("flowchartCanvas");
    const context = canvas.getContext("2d");

    const nodes = [];
    let selectedNode = null;
    let offsetX = 0;
    let offsetY = 0;

    canvas.addEventListener("mousedown", function (event) {
        const clickedNode = findNodeAtPosition(event.clientX, event.clientY);
        if (clickedNode) {
            selectedNode = clickedNode;
            offsetX = event.clientX - clickedNode.x;
            offsetY = event.clientY - clickedNode.y;
        }
    });

    canvas.addEventListener("mousemove", function (event) {
        if (selectedNode) {
            selectedNode.x = event.clientX - offsetX;
            selectedNode.y = event.clientY - offsetY;
            drawFlowchart();
        }
    });

    canvas.addEventListener("mouseup", function () {
        selectedNode = null;
    });

    canvas.addEventListener("click", function (event) {
        const mouseX = event.clientX - canvas.getBoundingClientRect().left;
        const mouseY = event.clientY - canvas.getBoundingClientRect().top;

        const lineInfo = findLineAtPosition(mouseX, mouseY);
        if (lineInfo) {
            const text = prompt("Enter text for this connection:");
            lineInfo.connection.text = text;
            drawFlowchart();
            return;
        }

        const newNode = {
            x: mouseX,
            y: mouseY,
            width: 100,
            height: 100,
            text: prompt("Enter text for the node:"),
            shape: prompt("Choose shape (rectangle or ellipse):").toLowerCase(),
            image: null,
            connections: [],
        };

        const addImageDecision = confirm("Do you want to add an image to this node?");
        if (addImageDecision) {
            const imageUrl = prompt("Enter the URL of the image:");
            if (imageUrl) {
                newNode.image = new Image();
                newNode.image.src = imageUrl;
            }
        }

        if (newNode.text || newNode.image) {
            calculateNodeSize(newNode);
            nodes.push(newNode);
            drawFlowchart();

            const connectDecision = confirm("Do you want to connect this node to another node?");
            if (connectDecision) {
                connectNodes(newNode);
            }
        }
    });

    function copyToClipboard(text) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }

    document.getElementById("showJsonButton").addEventListener("click", function () {
        const jsonData = JSON.stringify(nodes, null, 2);
        copyToClipboard(jsonData);
        alert("JSON data copied to clipboard!");
    });

    document.getElementById("loadJsonButton").addEventListener("click", function () {
        const jsonData = document.getElementById("jsonInput").value;
        try {
            nodes.length = 0;
            const parsedNodes = JSON.parse(jsonData);
            parsedNodes.forEach(node => {
                if (node.image) {
                    node.image = new Image();
                    node.image.src = node.image;
                }
                nodes.push(node);
            });
            drawFlowchart();
        } catch (error) {
            alert("Invalid JSON data. Please enter valid JSON.");
        }
    });

    function calculateNodeSize(node) {
        const textWidth = node.text ? context.measureText(node.text).width : 0;
        const textHeight = 18;
        const imageHeight = node.image ? node.height - textHeight : 0;
        node.width = Math.max(textWidth + 30, 100);
        node.height = Math.max(textHeight + 30 + imageHeight, 100);
    }

    function connectNodes(sourceNode) {
        const targetNodeIndex = prompt("Enter the index of the target node (starting from 0):");
        const targetNode = nodes[targetNodeIndex];

        if (targetNode) {
            const connection = {
                node: targetNode,
                text: "" // Initialize with empty text
            };
            sourceNode.connections.push(connection);
            drawFlowchart();
        }
    }

    function drawLine(context, fromX, fromY, toX, toY, text) {
        context.beginPath();
        context.moveTo(fromX, fromY);
        context.lineTo(toX, toY);
        context.strokeStyle = "#000";
        context.lineWidth = 2;
        context.stroke();
    
        if (text) {
            // Calculate the position for the text
            let textX, textY;
            if (fromX < toX) {
                // Text on the right side of the line
                textX = (fromX + toX) / 2 + 10; // Offset to the right
                textY = (fromY + toY) / 2 - 10; // Offset above
            } else {
                // Text on the left side of the line
                textX = (fromX + toX) / 2 - 10; // Offset to the left
                textY = (fromY + toY) / 2 + 10; // Offset above
            }
    
            context.fillStyle = "#000"; // Black color for text
            context.font = "12px Arial";
            context.fillText(text, textX, textY);
        }
    }
    

    function drawFlowchart() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        nodes.forEach(node => {
            node.connections.forEach(connection => {
                const {startX, startY, endX, endY} = calculateEdgePoints(node, connection.node);
                drawLine(context, startX, startY, endX, endY);

                if (connection.text) {
                    const textX = (startX + endX) / 2;
                    const textY = (startY + endY) / 2;
                    context.fillStyle = "#000"; // Black color for text
                    context.font = "12px Arial";
                    context.fillText(connection.text, textX, textY);
                }
            });

            context.beginPath();
            if (node.shape === "rectangle") {
                context.rect(node.x, node.y, node.width, node.height);
            } else if (node.shape === "ellipse") {
                context.ellipse(node.x + node.width / 2, node.y + node.height / 2, node.width / 2, node.height / 2, 0, 0, 2 * Math.PI);
            }
            context.fillStyle = "#f48fb1"; // Pink
            context.strokeStyle = "#d81b60"; // Darker Pink
            context.lineWidth = 3;
            context.stroke();
            context.fill();

            context.fillStyle = "#fff"; // White
            context.font = "14px Arial";
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(node.text, node.x + node.width / 2, node.y + node.height / 2);

            if (node.image) {
                context.drawImage(node.image, node.x + 15, node.y + 35, node.width - 30, node.height - 50);
            }
        });
    }

    function findNodeAtPosition(x, y) {
        for (const node of nodes) {
            if (
                (node.shape === "rectangle" && x >= node.x && x <= node.x + node.width && y >= node.y && y <= node.y + node.height) ||
                (node.shape === "ellipse" && Math.pow((x - (node.x + node.width / 2)) / (node.width / 2), 2) + Math.pow((y - (node.y + node.height / 2)) / (node.height / 2), 2) <= 1)
            ) {
                return node;
            }
        }
        return null;
    }

    function findLineAtPosition(x, y) {
        const threshold = 5;
        for (const node of nodes) {
            for (const connection of node.connections) {
                const {startX, startY, endX, endY} = calculateEdgePoints(node, connection.node);
                if (Math.abs((endY - startY) * x - (endX - startX) * y + endX * startY - endY * startX)
                    / Math.sqrt((endY - startY) ** 2 + (endX - startX) ** 2) <= threshold) {
                    return {node, connection};
                }
            }
        }
        return null;
    }

    function calculateEdgePoints(sourceNode, targetNode) {
        let startX, startY, endX, endY;
        // Adjust the start and end points based on the positions of the nodes
        // For simplicity, this code is for rectangular nodes only.
        if (sourceNode.x < targetNode.x) {
            startX = sourceNode.x + sourceNode.width / 2; // Set startX to the horizontal center of sourceNode
            endX = targetNode.x + targetNode.width / 2;   // Set endX to the horizontal center of targetNode
        } else {
            startX = sourceNode.x + sourceNode.width / 2; // Set startX to the horizontal center of sourceNode
            endX = targetNode.x + targetNode.width / 2;   // Set endX to the horizontal center of targetNode
        }
    
        if (sourceNode.y < targetNode.y) {
            startY = sourceNode.y + sourceNode.height;
            endY = targetNode.y;
        } else {
            startY = sourceNode.y;
            endY = targetNode.y + targetNode.height;
        }
    
        return { startX, startY, endX, endY };
    }
    

    drawFlowchart();
});

