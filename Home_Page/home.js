document.addEventListener("DOMContentLoaded", function () {
  const validateBtn = document.querySelector(".validate-btn");
  validateBtn.addEventListener("click", validateIdea);
});

function validateIdea() {
  const ideaText = document.getElementById("idea").value.toLowerCase();
  const usp = document.getElementById("USP").value.toLowerCase();
  const techStack = document.getElementById("tech_stack") ? document.getElementById("tech_stack").value : "";

  const trendingKeywords = ["ai", "blockchain", "sustainable", "remote", "iot"];
  const saturatedKeywords = ["food delivery", "ecommerce", "ride sharing", "dating", "grocery"];

  let trendScore = 0;
  let saturationScore = 0;
  let innovationScore = 0;
  let breakdown = "";

  // Trend score
  let trendMatches = [];
  trendingKeywords.forEach(keyword => {
    if (ideaText.includes(keyword) || techStack.includes(keyword)) {
      trendScore += 20;
      trendMatches.push(keyword);
    }
  });
  breakdown += `Trend Score: +${trendScore} (${trendMatches.length ? "Matched: " + trendMatches.join(", ") : "No trending keywords matched"})\n`;

  // Saturation score
  let saturationMatches = [];
  saturatedKeywords.forEach(keyword => {
    if (ideaText.includes(keyword)) {
      saturationScore += 20;
      saturationMatches.push(keyword);
    }
  });
  breakdown += `Saturation Score: +${saturationScore} (${saturationMatches.length ? "Matched: " + saturationMatches.join(", ") : "No saturated keywords matched"})\n`;

  // Innovation score
  let innovationDetails = [];
  if (usp.length > 30) {
    innovationScore += 30;
    innovationDetails.push("USP > 30 chars (+30)");
  }
  if (!saturatedKeywords.some(k => ideaText.includes(k))) {
    innovationScore += 40;
    innovationDetails.push("Not saturated (+40)");
  }
  if (techStack === "ai_ml" || ideaText.includes("ai")) {
    innovationScore += 30;
    innovationDetails.push("AI/ML used (+30)");
  }
  breakdown += `Innovation Score: +${innovationScore} (${innovationDetails.length ? innovationDetails.join(", ") : "No innovation bonuses"})\n`;

  // --- New Features Below ---

  // 1. Warn if idea or USP is too short
  if (ideaText.length < 20) {
    breakdown += "⚠️ Warning: Your idea description is very short. Consider adding more details.\n";
  }
  if (usp.length < 15) {
    breakdown += "⚠️ Warning: Your USP is quite short. A strong USP helps your idea stand out.\n";
  }

  // 2. Highlight if idea is highly innovative (high innovationScore)
  if (innovationScore >= 70) {
    breakdown += "🌟 Your idea is highly innovative!\n";
  }

  // 3. Suggest adding a tech stack if missing
  if (!techStack) {
    breakdown += "💡 Tip: Adding a tech stack can improve your innovation score.\n";
  }

  // 4. Show a fun emoji summary
  let emojiSummary = "";
  if (trendScore >= 80) emojiSummary += "🔥";
  if (saturationScore >= 80) emojiSummary += "💧";
  if (innovationScore >= 80) emojiSummary += "💡";
  if (emojiSummary) breakdown += `Summary: ${emojiSummary}\n`;

  // 5. Store a timestamp for the validation
  localStorage.setItem("validationTime", new Date().toISOString());

  // --- End New Features ---

  trendScore = Math.min(trendScore, 100);
  saturationScore = Math.min(saturationScore, 100);
  innovationScore = Math.min(innovationScore, 100);

  const totalScore = trendScore + (100 - saturationScore) + innovationScore;
  const normalizedScore = Math.round(totalScore / 3);

  let verdict = "";
  if (normalizedScore >= 80) {
    verdict = "🚀 Excellent potential! Your startup idea is innovative and well-aligned with trends.";
  } else if (normalizedScore >= 50) {
    verdict = "🌱 Good start. Consider refining your niche or highlighting more unique features.";
  } else {
    verdict = "⚠️ Your idea may be too generic. Try targeting a more specific problem or market.";
  }

  // Store results
  localStorage.setItem("trendScore", trendScore);
  localStorage.setItem("saturationScore", saturationScore);
  localStorage.setItem("innovationScore", innovationScore);
  localStorage.setItem("verdict", verdict);
  localStorage.setItem("breakdown", breakdown);

  window.location.href = "result.html";
}
