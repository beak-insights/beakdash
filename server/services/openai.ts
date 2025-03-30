import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a response from the AI Copilot
 * @param prompt User's prompt
 * @param context Previous conversation context
 * @param datasetId Optional dataset ID to reference
 */
export async function generateAIResponse(
  prompt: string,
  context: { role: "user" | "assistant"; content: string }[] = [],
  datasetId?: number,
  chartType?: string
): Promise<string> {
  try {
    // System message that defines the AI's behavior
    const systemMessage = `You are an AI Copilot for a dashboard creation platform called BeakDash. 
Your role is to help users create, manage, and optimize their data dashboards. 

${datasetId ? `You are currently working with dataset ID: ${datasetId}. The user wants insights about this data.` : ''}
${chartType ? `The user is working with a ${chartType} chart.` : ''}

Provide concise, helpful responses about:
- Data visualization recommendations
- Chart configuration suggestions
- Dashboard layout optimization
- Data analysis insights

If the user asks about specific data or charts, recommend appropriate visualizations.
If they need help with dashboard features, guide them step by step.`;

    // Format messages in the structure expected by OpenAI
    const messages = [
      { role: "system", content: systemMessage },
      ...context,
      { role: "user", content: prompt },
    ];

    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.7,
    });

    // Return the AI's response
    return completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback response in case of an error
    return "I'm sorry, I encountered an error processing your request. Please try again later.";
  }
}

/**
 * Generate chart recommendations based on dataset
 * @param datasetId Dataset ID to analyze
 */
export async function generateChartRecommendation(datasetId: number): Promise<any> {
  try {
    // Import required modules
    const { storage } = await import("../storage");
    
    // Fetch the dataset
    const dataset = await storage.getDataset(datasetId);
    if (!dataset) {
      throw new Error("Dataset not found");
    }

    // System message that defines what we want from the AI
    const systemMessage = `You are an AI data visualization expert. 
    Analyze the following dataset and recommend the most appropriate chart type for visualization.
    
    Dataset name: ${dataset.name}
    Dataset description: ${dataset.query || "No description provided"}
    
    Based on the dataset information, recommend a chart type from this list: 
    bar, column, line, pie, scatter, dual-axes
    
    Provide your response in JSON format with these properties:
    - chartType: the recommended chart type (from the list above)
    - explanation: a brief explanation of why this chart type is recommended (2-3 sentences)
    - suggestedConfig: a brief suggestion for chart configuration (what columns to use for axes, etc.)`;

    // Call the OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemMessage },
      ],
      max_tokens: 500,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    // Parse the JSON response
    const responseContent = completion.choices[0].message.content || "{}";
    const recommendation = JSON.parse(responseContent);

    // Add the dataset ID to the recommendation
    recommendation.datasetId = datasetId;

    return recommendation;
  } catch (error) {
    console.error("Chart recommendation error:", error);
    
    // Return a fallback recommendation if there's an error
    return {
      chartType: "bar",
      explanation: "I apologize, but I encountered an error while analyzing your dataset. Based on general best practices, a bar chart is often versatile for many data types.",
      suggestedConfig: "Consider using categorical data for X-axis and numerical data for Y-axis.",
      datasetId: datasetId,
    };
  }
}