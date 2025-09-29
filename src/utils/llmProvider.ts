import { openaiConfig } from 'tailwind-llm-provider';

// Predefined models instead of fetching from API
const PREDEFINED_MODELS = [
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google" },
  { id: "openai/gpt-5-codex", name: "GPT-5 Codex", provider: "OpenAI" },
  { id: "openai/gpt-5-mini", name: "GPT-5 Mini", provider: "OpenAI" },
  { id: "qwen/qwen3-Max", name: "Qwen 3 Max", provider: "Alibaba" },
  { id: "x-ai/grok-4-fast", name: "Grok 4", provider: "xAI" },
  { id: "anthropic/claude-opus-4.1", name: "Claude 4.1 Opus", provider: "Anthropic" }
];

// Define your OpenRouter-style providers
const OPENROUTER_PROVIDERS = [
  { url: "https://openrouter.ai/api/v1", name: "OpenRouter" },
  { url: "https://aipipe.org/openrouter/v1", name: "AI Pipe" },
  { url: "https://llmfoundry.straive.com/openrouter/v1", name: "LLM Foundry" }
];

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
            models: PREDEFINED_MODELS,
            selectedModel: savedConfig.selectedModel || PREDEFINED_MODELS[0].id
          };
        }
      } catch (e) {
        console.error('Failed to parse saved config:', e);
      }
    }

    const config = await openaiConfig({
      storage: localStorage,
      key: "csv_scrollytelling_llm_config",
      baseUrls: OPENROUTER_PROVIDERS,
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
        selectedModel: savedConfig?.selectedModel || PREDEFINED_MODELS[0].id
      };
      localStorage.setItem('csv_scrollytelling_llm_config', JSON.stringify(configToSave));
      
      return {
        ...config,
        models: PREDEFINED_MODELS,
        selectedModel: savedConfig?.selectedModel || PREDEFINED_MODELS[0].id
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

  // Use the first available model if no specific model is selected
  const model = config.selectedModel || config.models?.[0] || "google/gemini-2.5-flash";

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
export function getAvailableModels(config: any) {
  return config?.models || PREDEFINED_MODELS;
}

// Get provider name from base URL
export function getProviderName(baseURL: string) {
  const provider = OPENROUTER_PROVIDERS.find(p => p.url === baseURL);
  return provider?.name || 'Custom Provider';
}