import { useState } from 'react';
import { createScrollytellingPrompt, createRefactorPrompt } from '../utils/llmPrompt';
import { generateResponse, generateResponseStream, isConfigured } from '../utils/llmProvider';
import { createDataProfile } from '../utils/dataProfile';
import { getLLMConfigData } from '../utils/config';

export const useLLMGeneration = (config: any) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [dataProfile, setDataProfile] = useState<any>(null);

  const extractHtmlFromResponse = (responseText: string): string => {
    // Remove markdown code fences if present
    let cleanText = responseText.replace(/```html\s*/g, '').replace(/```\s*$/g, '');
    
    // Find the first occurrence of <!doctype html> or <html> (case insensitive)
    const doctypeMatch = cleanText.match(/<!doctype\s+html[^>]*>/i);
    const htmlMatch = cleanText.match(/<html[^>]*>/i);
    
    let startIndex = 0;
    if (doctypeMatch) {
      startIndex = cleanText.indexOf(doctypeMatch[0]);
    } else if (htmlMatch) {
      startIndex = cleanText.indexOf(htmlMatch[0]);
    }
    
    // Find the last </html> tag
    const endMatch = cleanText.lastIndexOf('</html>');
    
    if (endMatch === -1) {
      throw new Error('No valid HTML document found in response');
    }
    
    // Extract the HTML content
    const htmlContent = cleanText.substring(startIndex, endMatch + 7).trim();
    
    // Validate that we have a complete HTML document
    if (!htmlContent.toLowerCase().includes('<html') || !htmlContent.toLowerCase().includes('</html>')) {
      throw new Error('Generated content is not a complete HTML document');
    }
    
    return htmlContent;
  };

  const generateScrollytelling = async (
    csvContent: string, 
    fileName: string, 
    storyStyle?: string, 
    promptInput?: string,
    useStreaming: boolean = false
  ) => {
    if (!isConfigured(config)) {
      setError('Please configure your LLM API first');
      return;
    }

    setIsGenerating(true);
    setError('');
    setStreamingContent('');

    try {
      const llmConfig = await getLLMConfigData();
      
      // Create data profile instead of sending full CSV
      const profile = createDataProfile(csvContent);
      setDataProfile(profile);
      
      console.log('Data Profile:', profile);
      
      let prompt: string;
      
      if (promptInput && generatedHtml) {
        // For refactoring, include the existing HTML as context
        prompt = createRefactorPrompt(promptInput, generatedHtml, profile, fileName);
      } else {
        // For initial generation, use the optional user prompt
        prompt = createScrollytellingPrompt(profile, fileName, storyStyle, promptInput);
      }
      
      console.log('Generated Prompt Length:', prompt.length);

      if (useStreaming) {
        // Use streaming generation
        let fullContent = '';
        
        for await (const chunk of generateResponseStream(config, prompt, { temperature: llmConfig.defaultTemperature })) {
          fullContent += chunk;
          setStreamingContent(fullContent);
        }
        
        const htmlContent = extractHtmlFromResponse(fullContent);
        setGeneratedHtml(htmlContent);
      } else {
        // Use non-streaming generation
        const result = await generateResponse(config, prompt, { temperature: llmConfig.defaultTemperature });
        const htmlContent = extractHtmlFromResponse(result.text);
        setGeneratedHtml(htmlContent);
      }

      // Additional validation for D3 and Scrollama
      if (!generatedHtml.includes('d3.v7.min.js') && !generatedHtml.includes('d3js.org')) {
        console.warn('Generated HTML may not include D3.js library');
      }
      
      if (!generatedHtml.includes('scrollama')) {
        console.warn('Generated HTML may not include Scrollama library');
      }
    } catch (err) {
      console.error('LLM Generation Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate scrollytelling story');
    } finally {
      setIsGenerating(false);
      setStreamingContent('');
    }
  };

  return {
    generateScrollytelling,
    isGenerating,
    generatedHtml,
    streamingContent,
    dataProfile,
    error,
    setError
  };
};
