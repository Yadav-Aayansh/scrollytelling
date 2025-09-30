import React, { useState } from 'react';
import { Play, Eye, FileText, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { getDemoConfig, getDemoDatasetUrl, getDemoHtmlUrl } from '../utils/config';

interface DemoCard {
  id: string;
  title: string;
  description: string;
  dataset: string;
  htmlFile: string;
  prompt: string;
  tags: string[];
  // Runtime properties
  datasetUrl?: string;
  csvContent?: string;
  file?: File;
}

interface DemoCardsProps {
  onLoadDemo: (demo: DemoCard) => void;
  disabled?: boolean;
}

export const DemoCards: React.FC<DemoCardsProps> = ({ onLoadDemo, disabled }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [demoStories, setDemoStories] = useState<DemoCard[]>([]);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<{ [key: string]: string }>({});
  const [htmlData, setHtmlData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  // Load demo configuration on component mount
  React.useEffect(() => {
    const loadDemoConfig = async () => {
      try {
        const demos = await getDemoConfig();
        const demosWithUrls = demos.map(demo => ({
          ...demo,
          datasetUrl: getDemoDatasetUrl(demo.dataset)
        }));
        setDemoStories(demosWithUrls);
        setConfigLoaded(true);
      } catch (error) {
        console.error('Failed to load demo config:', error);
        setConfigError('Failed to load demo configuration');
        setConfigLoaded(true);
      }
    };

    loadDemoConfig();
  }, []);

  const loadCsvData = async (demo: DemoCard) => {
    if (csvData[demo.id]) return csvData[demo.id];
    
    setLoading(prev => ({ ...prev, [demo.id]: true }));
    try {
      const response = await fetch(demo.datasetUrl!);
      if (!response.ok) throw new Error('Failed to fetch CSV');
      const data = await response.text();
      setCsvData(prev => ({ ...prev, [demo.id]: data }));
      return data;
    } catch (error) {
      console.error('Error loading CSV:', error);
      const errorMsg = 'Error loading CSV data';
      setCsvData(prev => ({ ...prev, [demo.id]: errorMsg }));
      throw new Error(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, [demo.id]: false }));
    }
  };

  const loadHtmlData = async (demo: DemoCard) => {
    if (htmlData[demo.id] && !htmlData[demo.id].startsWith('Error')) return;
    
    setLoading(prev => ({ ...prev, [demo.id]: true }));
    try {
      const response = await fetch(getDemoHtmlUrl(demo.htmlFile));
      if (!response.ok) {
        throw new Error(`Failed to fetch ${demo.htmlFile}: ${response.status} ${response.statusText}`);
      }
      const htmlContent = await response.text();
      setHtmlData(prev => ({ ...prev, [demo.id]: htmlContent }));
      return htmlContent;
    } catch (error) {
      console.error('Error loading HTML:', error);
      const errorMsg = `Error loading HTML file: ${error.message}`;
      setHtmlData(prev => ({ ...prev, [demo.id]: errorMsg }));
      throw new Error(errorMsg);
    } finally {
      setLoading(prev => ({ ...prev, [demo.id]: false }));
    }
  };

  const handleLoadDemo = async (demo: DemoCard) => {
    if (disabled) return;
    
    try {
      // Always load fresh data to ensure it's available
      const csvContent = await loadCsvData(demo);
      
      if (!csvContent || csvContent.startsWith('Error')) {
        throw new Error('Failed to load CSV data');
      }
      
      const file = new File([csvContent], demo.dataset, { type: 'text/csv' });
      onLoadDemo({ ...demo, csvContent, file });
    } catch (error) {
      console.error('Error loading demo:', error);
      alert(`Failed to load demo dataset: ${error.message}`);
    }
  };

  const openHtmlPreview = async (demo: DemoCard) => {
    try {
      let htmlContent = htmlData[demo.id];
      
      // If we don't have the HTML content or it's an error, try to load it
      if (!htmlContent || htmlContent.startsWith('Error')) {
        htmlContent = await loadHtmlData(demo);
      }
      
      if (htmlContent && !htmlContent.startsWith('Error')) {
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        throw new Error('HTML content is empty or invalid');
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert(`Failed to load preview: ${error.message}`);
    }
  };

  const toggleExpanded = (demoId: string) => {
    setExpandedCard(expandedCard === demoId ? null : demoId);
  };

  // Show loading state while config is being loaded
  if (!configLoaded) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileText className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Demo Stories</h2>
            <p className="text-sm text-gray-600">Loading demo configurations...</p>
          </div>
        </div>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  // Show error state if config failed to load
  if (configError) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-100 rounded-lg">
            <FileText className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Demo Stories</h2>
            <p className="text-sm text-red-600">{configError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <FileText className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Demo Stories</h2>
          <p className="text-sm text-gray-600">Explore examples with generated outputs</p>
        </div>
      </div>

      <div className="space-y-6">
        {demoStories.map((demo) => {
          const isExpanded = expandedCard === demo.id;
          const isLoading = loading[demo.id];
          
          return (
            <div key={demo.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Card Header */}
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{demo.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{demo.description}</p>
                  </div>
                  
                  {/* Preview Button - Right Side */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => openHtmlPreview(demo)}
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                  </div>
                </div>

                {/* Action Buttons - Below, Less Highlighted */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleLoadDemo(demo)}
                    disabled={disabled || isLoading}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" />
                    Try This Dataset
                  </button>

                  <button
                    onClick={() => toggleExpanded(demo.id)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    View Prompt
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Prompt */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-6">
                  <h4 className="font-medium text-gray-900 mb-3">AI Prompt Used</h4>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {demo.prompt}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};