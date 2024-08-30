// Import the necessary module from Xenova
import { pipeline } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

var map;

var map = L.map("map").setView([20, 0], 3);
var db = await fetch("./public/data.json")
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        const capitals = [];
        data.map((d) => {
            if (d["feature code"] == "PPLC") {
                capitals.push(d);
            }
        });
        return capitals;
    });

console.log(db);

// Add CartoDB Positron tile layer
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> contributors',
}).addTo(map);

async function classifyImages(text, imageUrls) {
    // Load the CLIP pipeline
    const clipModel = await pipeline(
        "zero-shot-image-classification",
        "Xenova/clip-vit-base-patch16"
    );

    // Initialize an array to store results
    const results = [];

    // Iterate through each image URL
    for (const imageUrl of imageUrls) {
        // Perform classification using the input text as a label
        const predictions = await clipModel(imageUrl, [text]);

        // Store the results
        results.push({
            image: imageUrl,
            predictions: predictions.map((p) => ({
                label: p.label,
                confidence: p.score,
            })),
        });
    }

    // Display the results
    console.log("Classification results based on input text:", text);
    results.forEach((result) => {
        console.log(`\nImage: ${result.image}`);
        result.predictions.forEach((prediction) => {
            console.log(
                `- ${prediction.label}: ${prediction.confidence.toFixed(4)}`
            );
        });
    });
}

// Function to handle the button click event
function onRunButtonClick() {
    console.log("run sim");

    const inputField = document.getElementById("textInput");
    const inputText = inputField.value;

    console.log("Input text:", inputText);

    if (inputText != "") {
        classifyImages(
            inputText,
            db.map((place) => place.url)
        ).catch((err) => console.error(err));
    } else {
        alert("Please enter an input text to run the analysis");
    }
}

document.getElementById("runBtn").addEventListener("click", onRunButtonClick);
