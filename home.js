document.addEventListener("DOMContentLoaded", function () {
  const validateBtn = document.querySelector(".validate-btn");
  validateBtn.addEventListener("click", validateIdea);

});

// Add this function to call Gemini (replace YOUR_GEMINI_API_KEY)
async function callGemini(promptText) {
  // Improved prompt for better Gemini results
  const improvedPrompt = `
You are a startup idea validation expert. Analyze the following startup idea and provide:
- A trend score (0-100, how trendy is the idea?).
- A saturation score (0-100, how saturated is the market?).
- An innovation score (0-100, how innovative is the idea?).
- A short, actionable verdict (2-3 sentences).
- A one-line summary with emojis.

Startup Idea Details:
${promptText}

Respond ONLY in this JSON format:
{
  "trend_score": <number>,
  "saturation_score": <number>,
  "innovation_score": <number>,
  "verdict": "<short verdict>",
  "summary": "<one-line emoji summary>"
}
`;

  console.log("Gemini Prompt:\n", improvedPrompt); // <-- This will log the prompt being sent
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyA-E0zpZAK23VmN3PHJHQY28rbpumPSyL0";


  const body = {
    contents: [
      {
        parts: [
          { text: improvedPrompt }
        ]
      }
    ]
  };
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    alert("Gemini API error: " + response.statusText);
    return null;
  }
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
}

function buildGeminiPrompt({ idea, usp, techStack, industry, targetAudience, problem, otherTech }) {
  return `
You are a startup idea validation expert. Analyze the following startup idea and provide:
- A trend score (0-100, how trendy is the idea?).
- A saturation score (0-100, how saturated is the market?).
- An innovation score (0-100, how innovative is the idea?).
- A feasibility score (0-100, how feasible is the idea to build?).
- A market size score (0-100, how large is the potential market?).
- A short, actionable verdict (2-3 sentences).
- A one-line summary with emojis.

Startup Idea: ${idea}
USP: ${usp}
Target Audience: ${targetAudience}
Problem Solved: ${problem}
Tech Stack: ${techStack}${techStack === "other" ? " (" + otherTech + ")" : ""}
Industry: ${industry}

Respond ONLY with a valid JSON object, no markdown, no explanation, no code block, no extra text. 
All values must be real numbers or strings, not placeholders.

{
  "trend_score": [number 0-100],
  "saturation_score": [number 0-100],
  "innovation_score": [number 0-100],
  "feasibility_score": [number 0-100],
  "market_size_score": [number 0-100],
  "verdict": "[short verdict]",
  "summary": "[one-line emoji summary]"
}
`;
}

async function validateIdea() {
  // Get all form values
  const idea = document.getElementById("idea").value.trim();
  const usp = document.getElementById("USP").value.trim();
  const techStackArr = $("#tech_stack").val();
  const industry = document.getElementById("industry") ? document.getElementById("industry").value : "";
  const targetAudience = document.getElementById("target_audience") ? document.getElementById("target_audience").value.trim() : "";
  const problem = document.getElementById("problem") ? document.getElementById("problem").value.trim() : "";
  const otherTech = document.getElementById("other_tech") ? document.getElementById("other_tech").value.trim() : "";

  // Validate required fields
  if (
    !idea ||
    !usp ||
    !techStackArr || techStackArr.length === 0 ||
    !industry ||
    !targetAudience ||
    !problem ||
    (techStackArr.includes("other") && !otherTech)
  ) {
    // Clear previous results so blank form doesn't show old scores
    localStorage.removeItem("geminiResult");
    alert("Please fill in all required fields before validating your idea.");
    return;
  }

  // Use the prompt builder
  const prompt = buildGeminiPrompt({ idea, usp, techStack: techStackArr.join(", "), industry, targetAudience, problem, otherTech });

  // Show loader, hide form
  document.getElementById('loader').classList.remove('hidden');
  document.querySelector('.form-container form').style.display = 'none';
  const wgeminiResult = await callGemini(prompt);

  // Handle Gemini API error (null response)
  if (!geminiResult) {
    // Hide loader, show form again
    document.getElementById('loader').classList.add('hidden');
    document.querySelector('.form-container form').style.display = '';
    alert("Failed to get a response from Gemini API. Please try again.");
    return;
  }

  // Hide loader, show form
  document.getElementById('loader').classList.add('hidden');
  document.querySelector('.form-container form').style.display = '';

  // Improved JSON extraction for Gemini's response
  let parsed = null;
  try {
    // Remove markdown code block markers if present
    let cleaned = geminiResult.replace(/```json|```/g, "").trim();
    // Try to extract the first JSON object from the response
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      parsed = { raw: geminiResult };
    }
  } catch (e) {
    parsed = { raw: geminiResult };
  }
  console.log("Gemini parsed result:", parsed);
  localStorage.setItem("geminiResult", JSON.stringify(parsed));
  window.location.href = "result.html";
}

const geminiResult = JSON.parse(localStorage.getItem("geminiResult") || "{}");

// Check if there are valid scores
const hasScores =
  typeof geminiResult.trend_score === "number" ||
  typeof geminiResult.saturation_score === "number" ||
  typeof geminiResult.innovation_score === "number" ||
  typeof geminiResult.feasibility_score === "number" ||
  typeof geminiResult.market_size_score === "number";

// Hide or show result sections accordingly
if (!hasScores) {
  // Hide all result/chart sections
  document.querySelectorAll('.score-section, .chart-section').forEach(el => el.style.display = 'none');
  // Optionally show a message
  const msg = document.createElement('p');
  msg.textContent = "No results to display. Please fill the form and validate your idea first.";
  msg.className = "text-center text-lg text-gray-500 mt-8";
  document.body.appendChild(msg);
}
