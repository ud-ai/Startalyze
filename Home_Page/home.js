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
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA-E0zpZAK23VmN3PHJHQY28rbpumPSyL0";
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
  const idea = document.getElementById("idea").value;
  const usp = document.getElementById("USP").value;
  // Get all selected tech stacks as a comma-separated string
  const techStack = $("#tech_stack").val() ? $("#tech_stack").val().join(", ") : "";
  const industry = document.getElementById("industry") ? document.getElementById("industry").value : "";
  const targetAudience = document.getElementById("target_audience") ? document.getElementById("target_audience").value : "";
  const problem = document.getElementById("problem") ? document.getElementById("problem").value : "";
  const otherTech = document.getElementById("other_tech") ? document.getElementById("other_tech").value : "";

  // Use the prompt builder
  const prompt = buildGeminiPrompt({ idea, usp, techStack, industry, targetAudience, problem, otherTech });

  // Show loader, hide form
  document.getElementById('loader').classList.remove('hidden');
  document.querySelector('.form-container form').style.display = 'none';

  const geminiResult = await callGemini(prompt);

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
console.log("Gemini result on result.html:", geminiResult);
