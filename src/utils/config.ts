interface DemoConfig {
  id: string;
  title: string;
  description: string;
  dataset: string;
  htmlFile: string;
  prompt: string;
  tags: string[];
}

interface AppConfig {
  title: string;
  description: string;
  maxFileSize: string;
  supportedFormats: string[];
}

interface LLMModel {
  id: string;
  name: string;
  provider: string;
}

interface LLMProvider {
  url: string;
  name: string;
}

interface LLMConfig {
  defaultTemperature: number;
  predefinedModels: LLMModel[];
  providers: LLMProvider[];
}

interface Config {
  demos: DemoConfig[];
  app: AppConfig;
  llm: LLMConfig;
}

let configCache: Config | null = null;

export async function loadConfig(): Promise<Config> {
  if (configCache) {
    return configCache;
  }

  try {
    const response = await fetch(`${import.meta.env.BASE_URL || '/'}config.json`);
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.status} ${response.statusText}`);
    }
    
    configCache = await response.json();
    return configCache!;
  } catch (error) {
    console.error('Error loading config:', error);
    throw new Error('Failed to load application configuration');
  }
}

export function clearConfigCache() {
  configCache = null;
}

// Convenience functions for accessing specific config sections
export async function getDemoConfig(): Promise<DemoConfig[]> {
  const config = await loadConfig();
  return config.demos;
}

export async function getAppConfig(): Promise<AppConfig> {
  const config = await loadConfig();
  return config.app;
}

export async function getLLMConfigData(): Promise<LLMConfig> {
  const config = await loadConfig();
  return config.llm;
}

// Helper function to get demo by ID
export async function getDemoById(id: string): Promise<DemoConfig | undefined> {
  const demos = await getDemoConfig();
  return demos.find(demo => demo.id === id);
}

// Helper function to get CSV URL for a demo
export function getDemoDatasetUrl(dataset: string): string {
  return `${import.meta.env.BASE_URL || '/'}${dataset}`;
}

// Helper function to get HTML file URL for a demo
export function getDemoHtmlUrl(htmlFile: string): string {
  return `${import.meta.env.BASE_URL || '/'}${htmlFile}`;
}