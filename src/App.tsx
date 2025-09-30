import React, { useState } from 'react';
import { AlertCircle, FileText } from 'lucide-react';
import { getAppConfig } from './utils/config';
import { ConfigPanel } from './components/ConfigPanel';
import { FileUpload } from './components/FileUpload';
import { DemoCards } from './components/DemoCards';
import { GenerationPanel } from './components/GenerationPanel';
import { ResultDisplay } from './components/ResultDisplay';
import { StreamingDisplay } from './components/StreamingDisplay';
import { useLLMGeneration } from './hooks/useLLMGeneration';
import { getLLMConfig, showLLMConfigModal, isConfigured } from './utils/llmProvider';
import { useEffect } from 'react';

function App() {
  const [config, setConfig] = useState<any>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [configLoading, setConfigLoading] = useState(true);
  const [appConfig, setAppConfig] = useState<any>(null);

  const { generateScrollytelling, isGenerating, generatedHtml, streamingContent, dataProfile, error, setError } = useLLMGeneration(config);

  const configured = isConfigured(config);
  const hasFile = csvFile !== null;
  const canGenerate = configured && hasFile && !isGenerating;

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const appConfigData = await getAppConfig();
        setAppConfig(appConfigData);
        
        const savedConfig = await getLLMConfig(false);
        setConfig(savedConfig);
      } catch (error) {
        console.error('Failed to load LLM config:', error);
      } finally {
        setConfigLoading(false);
      }
    };
    
    loadConfig();
  }, []);

  const handleConfigureClick = async () => {
    try {
      const newConfig = await showLLMConfigModal();
      if (newConfig) {
        setConfig(newConfig);
        setError('');
      }
    } catch (error) {
      console.error('Configuration error:', error);
      setError('Failed to configure API. Please try again.');
    }
  };

  const handleModelChange = (modelId: string, currentConfig: any) => {
    if (currentConfig) {
      const updatedConfig = {
        ...currentConfig,
        selectedModel: modelId
      };
      
      // Save to localStorage
      try {
        const configToSave = {
          baseUrl: updatedConfig.baseURL || updatedConfig.baseUrl,
          apiKey: updatedConfig.apiKey,
          selectedModel: modelId
        };
        localStorage.setItem('csv_scrollytelling_llm_config', JSON.stringify(configToSave));
        setConfig(updatedConfig);
        console.log('Model changed to:', modelId);
      } catch (error) {
        console.error('Failed to save model selection:', error);
        setError('Failed to save model selection');
      }
    }
  };

  const handleFileUpload = (file: File, content: string) => {
    setCsvFile(file);
    setCsvContent(content);
    setError('');
  };

  const handleGenerate = async (userPrompt?: string, useStreaming?: boolean) => {
    if (!canGenerate || !csvFile || !csvContent) return;
    
    await generateScrollytelling(csvContent, csvFile.name, undefined, userPrompt, useStreaming);
  };

  const handleRefactor = async (refactorPrompt: string) => {
    if (!canGenerate || !csvFile || !csvContent) return;
    
    await generateScrollytelling(csvContent, csvFile.name, undefined, refactorPrompt);
  };

  const handleLoadDemo = async (demo: any) => {
    try {
      // Use the CSV content that was already loaded by the DemoCards component
      const csvContent = demo.csvContent;
      const file = demo.file;
      
      // Set the file and content
      setCsvFile(file);
      setCsvContent(csvContent);
      setError('');
      
      // Auto-generate with the demo prompt if configured
      if (configured) {
        await generateScrollytelling(csvContent, demo.dataset, undefined, demo.prompt, true);
      }
    } catch (error) {
      console.error('Error loading demo:', error);
      setError(`Failed to load demo: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {appConfig?.title || 'CSV Scrollytelling Generator'}
                </h1>
                <p className="text-sm text-gray-500">
                  {appConfig?.description || 'Transform data into compelling stories'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800">Generation Error</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Panel */}
        <ConfigPanel
          config={config}
          configured={configured}
          onConfigureClick={handleConfigureClick}
          onModelChange={handleModelChange}
        />

        {/* Demo Cards - Show when configured but no file uploaded */}
        {configured && !hasFile && !configLoading && (
          <DemoCards
            onLoadDemo={handleLoadDemo}
            disabled={!configured || isGenerating}
          />
        )}

        {/* File Upload */}
        <FileUpload
          onFileUpload={handleFileUpload}
          disabled={!configured || isGenerating || configLoading}
        />

        {/* Generation Panel */}
        {hasFile && (
          <GenerationPanel
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            onRefactor={handleRefactor}
            disabled={!canGenerate}
            hasGenerated={!!generatedHtml}
          />
        )}

        {/* Streaming Display */}
        {streamingContent && (
          <StreamingDisplay
            content={streamingContent}
            isStreaming={isGenerating}
          />
        )}

        {/* Results */}
        {generatedHtml && !streamingContent && (
          <ResultDisplay
            htmlContent={generatedHtml}
            isGenerating={isGenerating}
          />
        )}

        {/* Instructions */}
        {!hasFile && configured && !configLoading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Or Upload Your Own Data</h2>
              <p className="text-gray-600 mb-6">
                Have your own dataset? Upload a CSV file to create a custom scrollytelling experience 
                tailored to your specific data and requirements.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Upload CSV</h3>
                  <p className="text-sm text-gray-600">Drag & drop or select your data file</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">AI Analysis</h3>
                  <p className="text-sm text-gray-600">Our AI finds patterns and insights</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-emerald-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Interactive Story</h3>
                  <p className="text-sm text-gray-600">Get a beautiful scrollytelling page</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {configLoading && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Loading Configuration...</h2>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;