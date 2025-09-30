import { openaiConfig } from 'tailwind-llm-provider';
import { getLLMConfigData } from './config';

// Cache for config data
let llmConfigCache: any = null;

async function getLLMConfigCached() {
  if (!llmConfigCache) {
    llmConfigCache = await getLLMConfigData();
  }
  return llmConfigCache;
}

// Custom validation function that doesn't fetch models
async function validateApiKey(baseUrl, apiKey) {
  if (!apiKey || !baseUrl) {
    throw new Error('API key and base URL are required');
  }

  // Simple validation - just check if the URL is valid
  if (!/^https?:\/\//.test(baseUrl)) {
    throw new Error('Invalid URL format');
  }

  // You could add a simple API test here if needed
  // For now, we'll just validate the format
  return true;
}

// Configuration function using tailwind-llm-provider
export async function getLLMConfig(forceShow = false) {
  try {
    const llmConfig = await getLLMConfigCached();
    
    // First try to load from localStorage with our custom key
    const savedData = localStorage.getItem('csv_scrollytelling_llm_config');
    let savedConfig = null;
    
    if (savedData && !forceShow) {
      try {
        savedConfig = JSON.parse(savedData);
        if (savedConfig && savedConfig.baseUrl && savedConfig.apiKey) {
          return {
            baseURL: savedConfig.baseUrl,
            baseUrl: savedConfig.baseUrl,
            apiKey: savedConfig.apiKey,
            models: llmConfig.predefinedModels,
            selectedModel: savedConfig.selectedModel || llmConfig.predefinedModels[0].id
          };
        }
      } catch (e) {
        console.error('Failed to parse saved config:', e);
      }
    }

    const config = await openaiConfig({
      storage: localStorage,
      key: "csv_scrollytelling_llm_config",
      baseUrls: llmConfig.providers,
      show: forceShow,
      title: "OpenRouter API Configuration",
      baseUrlLabel: "Choose API Provider",
      apiKeyLabel: "API Key",
      buttonLabel: "Save & Test Configuration",
      help: "Select an OpenRouter-compatible provider and enter your API key. You'll be able to choose from our curated selection of top AI models."
    });

    // Override the models with our predefined list
    if (config) {
      // Save the updated config with selected model
      const configToSave = {
        baseUrl: config.baseURL || config.baseUrl,
        apiKey: config.apiKey,
        selectedModel: savedConfig?.selectedModel || llmConfig.predefinedModels[0].id
      };
      localStorage.setItem('csv_scrollytelling_llm_config', JSON.stringify(configToSave));
      
      return {
        ...config,
        models: llmConfig.predefinedModels,
        selectedModel: savedConfig?.selectedModel || llmConfig.predefinedModels[0].id
      };
    }

    return null;
  } catch (error) {
    if (error.message === 'cancelled') {
      return null;
    }
    throw error;
  }
}

// Show configuration modal
export async function showLLMConfigModal() {
  return await getLLMConfig(true);
}

// Stream generation function
export async function* generateResponseStream(config: any, prompt: string, options: any = {}) {
  if (!config || !config.apiKey) {
    throw new Error('API key is required');
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${config.apiKey}`,
    "HTTP-Referer": window.location.origin,
    "X-Title": "CSV Scrollytelling Generator"
  };

  const llmConfig = await getLLMConfigCached();
  // Use the first available model if no specific model is selected
  const model = config.selectedModel || config.models?.[0]?.id || llmConfig.predefinedModels[0].id;

  const response = await fetch(`${config.baseURL}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: options.temperature ?? 0.7,
      stream: true
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Failed to get response stream');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              yield content;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// Non-streaming generation
export async function generateResponse(config: any, prompt: string, options: any = {}) {
  let fullText = '';
  
  for await (const chunk of generateResponseStream(config, prompt, options)) {
    fullText += chunk;
  }
  
  return { text: fullText };
}

// Check if configuration is valid
export function isConfigured(config: any) {
  return config && config.apiKey && config.baseURL;
}

// Get available models from config
export async function getAvailableModels(config: any) {
  if (config?.models) {
    return config.models;
  }
  
  const llmConfig = await getLLMConfigCached();
  return llmConfig.predefinedModels;
}

// Get provider name from base URL
export async function getProviderName(baseURL: string) {
  const llmConfig = await getLLMConfigCached();
  const provider = llmConfig.providers.find(p => p.url === baseURL);
  return provider?.name || 'Custom Provider';
}