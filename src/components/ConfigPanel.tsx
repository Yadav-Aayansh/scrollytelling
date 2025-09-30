import React from 'react';
import { Settings, Check, Zap } from 'lucide-react';
import { getProviderName, getAvailableModels } from '../utils/llmProvider';

interface ConfigPanelProps {
  config: any;
  configured: boolean;
  onConfigureClick: () => void;
  onModelChange: (modelId: string, config: any) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  config, 
  configured, 
  onConfigureClick, 
  onModelChange 
}) => {
  const [availableModels, setAvailableModels] = React.useState<any[]>([]);
  const [providerName, setProviderName] = React.useState<string>('Not configured');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadConfigData = async () => {
      try {
        const models = await getAvailableModels(config);
        setAvailableModels(models || []);
        
        if (config?.baseURL) {
          const name = await getProviderName(config.baseURL);
          setProviderName(name);
        } else {
          setProviderName('Not configured');
        }
      } catch (error) {
        console.error('Error loading config data:', error);
        setAvailableModels([]);
        setProviderName('Error loading config');
      } finally {
        setLoading(false);
      }
    };

    loadConfigData();
  }, [config]);
  
  const getCurrentModel = () => {
    return config?.selectedModel || (availableModels.length > 0 ? availableModels[0].id : 'No model selected');
  };

  const getCurrentModelName = () => {
    const currentModelId = getCurrentModel();
    const model = availableModels.find(m => m.id === currentModelId);
    return model ? `${model.name} (${model.provider})` : currentModelId;
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = e.target.value;
    onModelChange(newModelId, config);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {configured ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <Zap className="h-5 w-5 text-blue-600" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">API Configuration</h2>
            <p className="text-sm text-gray-600">
              {configured && !loading
                ? `Using ${getCurrentModelName()} via ${providerName}`
                : loading 
                  ? 'Loading configuration...'
                  : 'Configure your API to access AI models'
              }
            </p>
          </div>
          {configured && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
              Ready
            </span>
          )}
        </div>
        
        <button
          onClick={onConfigureClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          {configured ? 'Reconfigure' : 'Configure'}
        </button>
      </div>

      {/* Model Selection */}
      {configured && availableModels.length > 0 && !loading && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select AI Model ({availableModels.length} available)
          </label>
          <select
            value={getCurrentModel()}
            onChange={handleModelChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableModels.map((model: any) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.provider})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};