export const createScrollytellingPrompt = (dataProfile: any, fileName: string, storyStyle?: string, userPrompt?: string): string => {
  const systemPrompt = `You are an expert scrollytelling developer with 10+ years of experience in D3.js, Scrollama, and data visualization. You MUST create working, tested code that renders properly on first load.

CRITICAL SUCCESS CRITERIA:
- ALL charts MUST render visibly on page load
- NO console errors allowed
- ALL D3 transitions MUST work smoothly
- Scrollama MUST trigger all step changes
- Data MUST be properly processed and displayed

You have deep expertise in D3.js v7, Scrollama, responsive design, and performance optimization.`;

  const validationSection = `**MANDATORY VALIDATION CHECKLIST - YOU MUST VERIFY EACH ITEM:**

□ Data parsing: CSV data correctly converted to JavaScript arrays
□ D3 scales: All scales (x, y, color, size) properly defined with correct domains
□ SVG setup: Width, height, margins calculated correctly for all chart types
□ Initial render: First chart visible immediately on page load
□ Scrollama init: Event listeners properly attached to all steps
□ Transitions: Each step change triggers smooth D3 animations
□ Responsiveness: Charts adapt to different screen sizes
□ Error handling: Graceful handling of missing/invalid data points
□ Performance: No memory leaks, efficient DOM updates
□ Browser compatibility: Works in Chrome, Firefox, Safari, Edge`;

  const strictRequirements = `**STRICT TECHNICAL REQUIREMENTS - NO EXCEPTIONS:**

1. **HTML STRUCTURE** (EXACT format required):
   \`\`\`
   <!DOCTYPE html>
   <html lang="en">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>[Data-driven title]</title>
     <script src="https://d3js.org/d3.v7.min.js"></script>
     <script src="https://unpkg.com/scrollama"></script>
     <style>/* CSS here */</style>
   </head>
   <body>/* Content here */</body>
   </html>
   \`\`\`

2. **CSS REQUIREMENTS** (Copy this EXACT structure):
   \`\`\`
   * { margin: 0; padding: 0; box-sizing: border-box; }
   body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
   
   .scrollytelling-container {
     display: flex;
     max-width: 1400px;
     margin: 0 auto;
   }
   
   .steps-container {
     flex: 1;
     padding-right: 2rem;
   }
   
   .step {
     height: 100vh;
     display: flex;
     align-items: center;
     padding: 2rem;
     border-bottom: 1px solid #eee;
   }
   
   .chart-container {
     flex: 1;
     position: sticky;
     top: 0;
     height: 100vh;
     display: flex;
     align-items: center;
     justify-content: center;
     background: #fff;
   }
   
   #chart-svg {
     max-width: 100%;
     max-height: 90vh;
   }
   \`\`\`

3. **JAVASCRIPT REQUIREMENTS** (MANDATORY structure):
   \`\`\`
   // STEP 1: Parse and validate data
   const rawData = [/* CSV data as JSON */];
   const data = rawData.filter(d => /* validation logic */);
   
   // STEP 2: Set up dimensions and scales
   const margin = {top: 40, right: 40, bottom: 60, left: 60};
   const width = 800 - margin.left - margin.right;
   const height = 500 - margin.top - margin.bottom;
   
   // STEP 3: Create SVG
   const svg = d3.select("#chart-svg")
     .attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom);
   
   const g = svg.append("g")
     .attr("transform", \`translate(\${margin.left},\${margin.top})\`);
   
   // STEP 4: Initialize first chart
   function initChart() {
     // MUST render first visualization here
   }
   
   // STEP 5: Step update functions
   const stepFunctions = {
     0: () => { /* First step animation */ },
     1: () => { /* Second step animation */ },
     // ... continue for all steps
   };
   
   // STEP 6: Scrollama setup
   const scroller = scrollama();
   
   scroller
     .setup({
       step: '.step',
       offset: 0.5,
       debug: false
     })
     .onStepEnter(handleStepEnter)
     .onStepExit(handleStepExit);
   
   function handleStepEnter(response) {
     const stepIndex = response.index;
     if (stepFunctions[stepIndex]) {
       stepFunctions[stepIndex]();
     }
   }
   
   // STEP 7: Initialize on load
   window.addEventListener('load', () => {
     initChart();
   });
   \`\`\`

4. **DATA PROCESSING RULES**:
   - Convert all numeric strings to numbers using +value or parseFloat()
   - Handle null/undefined values with || 0 or filtering
   - Validate date formats and convert properly
   - Create backup values for any missing data points

5. **CHART REQUIREMENTS** (MUST include ALL):
   - **EXACTLY 10 steps total** across 3 chart types
   - **Steps 0-3**: Bar/Column chart with progressive data reveal
   - **Steps 4-6**: Line/Area chart with time-based animation  
   - **Steps 7-9**: Scatter plot or other advanced visualization
   - Each step MUST have visible changes (color, data, labels, etc.)
   - Smooth transitions between ALL steps (duration: 500-1000ms)

6. **ERROR PREVENTION**:
   - Wrap all D3 operations in try-catch blocks
   - Add console.log statements for debugging
   - Validate data before creating scales
   - Check if elements exist before manipulating them`;

  const dataAnalysisSection = `**DATA ANALYSIS INSTRUCTIONS**:

Based on the CSV profile below, you MUST:
1. **Identify the 3 most interesting data dimensions**
2. **Create meaningful data groupings/categories**  
3. **Calculate summary statistics** (mean, max, min, totals)
4. **Design 3 complementary chart types** that reveal different insights
5. **Write compelling narrative text** for each step that explains the data story

**NARRATIVE REQUIREMENTS**:
- Each step needs 2-3 sentences explaining what the viewer is seeing
- Use specific data points and numbers in the text
- Progressive revelation: start broad, get more specific
- Include context and implications of the data patterns
- End with actionable insights or conclusions`;

  const outputInstructions = `**OUTPUT INSTRUCTIONS - FOLLOW EXACTLY**:

1. **FIRST**: Analyze the data profile and plan your 10 steps
2. **SECOND**: Write the complete HTML file following the exact structure above
3. **THIRD**: Test mentally that each requirement is met
4. **RETURN ONLY**: The complete HTML code (no markdown, no explanations)

**QUALITY ASSURANCE - Before returning code, verify**:
✅ Data is properly parsed and validated
✅ All 10 steps have unique, visible changes  
✅ First chart renders immediately on load
✅ Scrollama is properly initialized
✅ All D3 scales have correct domains/ranges
✅ Transitions work smoothly between steps
✅ No undefined variables or functions
✅ Responsive design works on mobile
✅ Clean, semantic HTML structure
✅ Performance optimized (no redundant operations)

**IF ANY REQUIREMENT IS NOT MET, REWRITE THE ENTIRE CODE UNTIL PERFECT**`;

  const mainPromptContent = `${strictRequirements}

${validationSection}

${dataAnalysisSection}

${outputInstructions}

${storyStyle ? `**STORY STYLE REQUIREMENT**: ${storyStyle} - Apply this tone and approach throughout the narrative.` : ''}

${userPrompt ? `**ADDITIONAL USER REQUIREMENTS**: ${userPrompt} - Incorporate these specific requests while maintaining all technical requirements above.` : ''}`;

  const dataSection = `**CSV DATA PROFILE TO ANALYZE:**

\`\`\`json
${JSON.stringify(dataProfile, null, 2)}
\`\`\`

**FILE NAME**: ${fileName}

Remember: You MUST create a working HTML file that renders perfectly on first load. No excuses, no partial implementations. Every chart must work, every transition must be smooth, every step must trigger properly.`;

  return `${systemPrompt}\n\n${mainPromptContent}\n\n${dataSection}`;
};

// Optional: Helper function to add additional validation
export const addValidationPrompt = (basePrompt: string): string => {
  const validationAddendum = `

**FINAL VALIDATION REMINDER**:
Before submitting your HTML code, mentally execute this checklist:
1. Does the page load without errors?
2. Is the first chart visible immediately?
3. Do all 10 scrollytelling steps work?
4. Are D3 transitions smooth and error-free?
5. Is the data properly processed and displayed?
6. Does Scrollama trigger step changes correctly?
7. Is the layout responsive and well-styled?
8. Are all CDN libraries loading correctly?
9. Is there proper error handling for edge cases?
10. Would this impress a senior developer?

If ANY answer is "no" or "maybe", rewrite the code until ALL answers are "yes".`;

  return basePrompt + validationAddendum;
};

// Usage example with validation:
// const prompt = addValidationPrompt(createScrollytellingPrompt(dataProfile, fileName, storyStyle, userPrompt));
export const createRefactorPrompt = (refactorInstructions: string, existingHtml: string, dataProfile: any, fileName: string): string => {
  const systemPrompt = `You are an expert web developer and data storyteller specializing in refactoring and improving scrollytelling experiences. You have deep expertise in:

- D3.js v7 for data visualization
- Scrollama for scroll-driven animations
- Responsive web design and UX best practices
- Code refactoring and optimization
- Modern HTML5, CSS3, and JavaScript

Your task is to refactor existing scrollytelling code based on specific user instructions while maintaining the core functionality and improving the overall experience.`;

  const userPrompt = `**REFACTOR TASK**: Modify the existing scrollytelling HTML code based on the user's instructions below.

**User's Refactor Instructions:**
${refactorInstructions}

**Requirements for Refactoring:**

1. **Maintain Core Structure**: Keep the existing layout and scrollytelling functionality intact
2. **Apply User Changes**: Implement exactly what the user requested
3. **Preserve Working Code**: Don't break existing functionality unless specifically asked to change it
4. **Complete HTML Output**: Return the full, working HTML file with all changes applied
5. **Libraries**: Continue using the same CDN libraries (D3.js v7, Scrollama)
6. **Performance**: Ensure changes don't negatively impact performance
7. **Responsive Design**: Maintain or improve responsive behavior

**Data Context for Reference:**
CSV File: "${fileName}"

\`\`\`json
${JSON.stringify(dataProfile, null, 2)}
\`\`\`

**Current HTML Code to Refactor:**

\`\`\`html
${existingHtml}
\`\`\`

**Return ONLY the complete refactored HTML code** - no markdown, no explanations, no comments outside the HTML.`;

  return `${systemPrompt}\n\n${userPrompt}`;
};