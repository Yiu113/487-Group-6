document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("flowchartCanvas");
  const context = canvas.getContext("2d");

  document.getElementById("showJsonButton").addEventListener("click", function () {
const jsonData = JSON.stringify(nodes, null, 2);
copyToClipboard(jsonData);
alert("JSON data copied to clipboard!");
});

function copyToClipboard(text) {
const textarea = document.createElement("textarea");
textarea.value = text;
document.body.appendChild(textarea);
textarea.select();
document.execCommand("copy");
document.body.removeChild(textarea);
}

  const nodes = [];
  let selectedNode = null;
  let offsetX = 0;
  let offsetY = 0;

  canvas.addEventListener("mousedown", function (event) {
      const clickedNode = findNodeAtPosition(event.clientX, event.clientY);

      if (clickedNode) {
          selectedNode = clickedNode;
          offsetX = event.clientX - selectedNode.x;
          offsetY = event.clientY - selectedNode.y;
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
      const newNode = {
          x: event.clientX - canvas.getBoundingClientRect().left,
          y: event.clientY - canvas.getBoundingClientRect().top,
          width: 100,
          height: 100, // Adjusted height for images
          text: prompt("Enter text for the node:"),
          shape: prompt("Choose shape (rectangle or ellipse):").toLowerCase(),
          image: null,
          connections: [],
      };

      // Ask user if they want to add an image
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

  document.getElementById("showJsonButton").addEventListener("click", function () {
      alert(JSON.stringify(nodes, null, 2));
  });

  document.getElementById("loadJsonButton").addEventListener("click", function () {
      const jsonData = document.getElementById("jsonInput").value;
      try {
          nodes.length = 0; // Clear existing nodes
          const parsedNodes = JSON.parse(jsonData);
          parsedNodes.forEach(node => {
              // Convert image URLs to Image objects
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
          sourceNode.connections.push(targetNode);
          drawFlowchart();
      }
  }

  function drawArrow(context, fromX, fromY, toX, toY) {
      const headLength = 10;

      context.beginPath();
      context.moveTo(fromX, fromY);
      context.lineTo(toX, toY);

      // Calculate arrowhead points
      const angle = Math.atan2(toY - fromY, toX - fromX);
      const arrowX1 = toX - headLength * Math.cos(angle - Math.PI / 6);
      const arrowY1 = toY - headLength * Math.sin(angle - Math.PI / 6);
      const arrowX2 = toX - headLength * Math.cos(angle + Math.PI / 6);
      const arrowY2 = toY - headLength * Math.sin(angle + Math.PI / 6);

      // Draw arrowhead
      context.moveTo(arrowX1, arrowY1);
      context.lineTo(toX, toY);
      context.lineTo(arrowX2, arrowY2);

      context.strokeStyle = "#000";
      context.lineWidth = 2;
      context.stroke();
      context.fillStyle = "#000";
      context.fill();
  }
  function drawFlowchart() {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw arrows and text
      nodes.forEach(node => {
          node.connections.forEach(targetNode => {
              const startX = node.x + node.width / 2;
              const startY = node.y + node.height;
              const endX = targetNode.x + targetNode.width / 2;
              const endY = targetNode.y;

              drawArrow(context, startX, startY, endX, endY);

              // Calculate text position
              const textX = (startX + endX) / 2;
              const textY = (startY + endY) / 2;

              // Draw text
              const text = prompt("Enter text for the line connecting these nodes:");
              context.fillStyle = "#000"; /* Black */
              context.font = "12px Arial";
              context.fillText(text, textX, textY);
          });
      });

      // Draw nodes (unchanged)
      nodes.forEach(node => {
          context.beginPath();
          if (node.shape === "rectangle") {
              context.rect(node.x, node.y, node.width, node.height);
          } else if (node.shape === "ellipse") {
              context.ellipse(node.x + node.width / 2, node.y + node.height / 2, node.width / 2, node.height / 2, 0, 0, 2 * Math.PI);
          }
          context.fillStyle = "#f48fb1"; /* Pink */
          context.strokeStyle = "#d81b60"; /* Darker Pink */
          context.lineWidth = 3;
          context.stroke();
          context.fill();

// Draw text (unchanged)
context.fillStyle = "#fff"; /* White */
context.font = "14px Arial";
context.fillText(node.text, node.x + 15, node.y + 25);

// Draw image (unchanged)
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

drawFlowchart();
});
