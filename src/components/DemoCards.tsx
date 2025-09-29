import React, { useState } from 'react';
import { Play, Download, Eye, FileText, Code, BarChart3 } from 'lucide-react';

interface DemoCard {
  id: string;
  title: string;
  description: string;
  dataset: string;
  datasetUrl: string;
  prompt: string;
  htmlFile: string;
  previewImage?: string;
  tags: string[];
}

interface DemoCardsProps {
  onLoadDemo: (demo: DemoCard) => void;
  disabled?: boolean;
}

const DEMO_STORIES: DemoCard[] = [
  {
    id: 'card-transactions',
    title: 'Credit Card Fraud Detection Story',
    description: 'Explore patterns in credit card transactions to understand fraud detection and spending behaviors across different demographics and merchant categories.',
    dataset: 'card_transactions.csv',
    datasetUrl: 'https://raw.githubusercontent.com/gramener/datasets/main/card_transactions.csv',
    htmlFile: 'sample1.html',
    prompt: `Create an engaging scrollytelling story about credit card fraud detection. Focus on:

1. **Transaction Volume Patterns**: Show how transaction amounts vary by time, location, and merchant category
2. **Fraud Detection Insights**: Highlight patterns that distinguish fraudulent from legitimate transactions
3. **Customer Behavior Analysis**: Explore spending habits across different demographics and card types
4. **Risk Assessment**: Visualize high-risk scenarios and protective measures

Make it educational and actionable for both consumers and financial institutions. Use compelling data visualizations that reveal the hidden patterns in financial data.`,
    tags: ['Finance', 'Fraud Detection', 'Security', 'Analytics']
  },
  {
    id: 'supply-chain',
    title: 'Global Supply Chain Optimization',
    description: 'Dive into supply chain data to uncover bottlenecks, optimize routes, and understand the complex web of global commerce and logistics.',
    dataset: 'supply_chain.csv',
    datasetUrl: 'https://raw.githubusercontent.com/gramener/datasets/main/supply_chain.csv',
    htmlFile: 'sample2.html',
    prompt: `Create a compelling scrollytelling narrative about global supply chain optimization. Focus on:

1. **Supply Chain Flow**: Visualize the journey from suppliers to customers across different regions
2. **Performance Metrics**: Show delivery times, costs, and efficiency across different routes and suppliers
3. **Bottleneck Analysis**: Identify and highlight critical points where delays and issues occur
4. **Optimization Opportunities**: Reveal data-driven insights for improving supply chain performance

Make it relevant for business leaders and supply chain professionals. Use dynamic visualizations that show the interconnected nature of global commerce and the impact of optimization strategies.`,
    tags: ['Supply Chain', 'Logistics', 'Business Intelligence', 'Optimization']
  }
];

export const DemoCards: React.FC<DemoCardsProps> = ({ onLoadDemo, disabled }) => {
  const [activeTab, setActiveTab] = useState<{ [key: string]: 'prompt' | 'csv' | 'output' }>({});
  const [csvData, setCsvData] = useState<{ [key: string]: string }>({});
  const [htmlData, setHtmlData] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const setTabForDemo = (demoId: string, tab: 'prompt' | 'csv' | 'output') => {
    setActiveTab(prev => ({ ...prev, [demoId]: tab }));
  };

  const loadCsvData = async (demo: DemoCard) => {
    if (csvData[demo.id]) return;
    
    setLoading(prev => ({ ...prev, [demo.id]: true }));
    try {
      const response = await fetch(demo.datasetUrl);
      if (!response.ok) throw new Error('Failed to fetch CSV');
      const data = await response.text();
      setCsvData(prev => ({ ...prev, [demo.id]: data }));
    } catch (error) {
      console.error('Error loading CSV:', error);
      setCsvData(prev => ({ ...prev, [demo.id]: 'Error loading CSV data' }));
    } finally {
      setLoading(prev => ({ ...prev, [demo.id]: false }));
    }
  };

  const loadHtmlData = async (demo: DemoCard) => {
    if (htmlData[demo.id]) return;
    
    setLoading(prev => ({ ...prev, [demo.id]: true }));
    try {
      // Fetch the actual HTML file from the public folder
      const response = await fetch(`${import.meta.env.BASE_URL}${demo.htmlFile}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${demo.htmlFile}: ${response.status} ${response.statusText}`);
      }
      const htmlContent = await response.text();
      setHtmlData(prev => ({ ...prev, [demo.id]: htmlContent }));
    } catch (error) {
      console.error('Error loading HTML:', error);
      setHtmlData(prev => ({ ...prev, [demo.id]: `Error loading HTML file: ${error.message}` }));
    } finally {
      setLoading(prev => ({ ...prev, [demo.id]: false }));
    }
  };

  const handleTabClick = async (demo: DemoCard, tab: 'prompt' | 'csv' | 'output') => {
    setTabForDemo(demo.id, tab);
    
    if (tab === 'csv') {
      await loadCsvData(demo);
    } else if (tab === 'output') {
      await loadHtmlData(demo);
    }
  };

  const handleLoadDemo = async (demo: DemoCard) => {
    if (disabled) return;
    
    try {
      // Load CSV data if not already loaded
      if (!csvData[demo.id]) {
        await loadCsvData(demo);
      }
      
      const csvContent = csvData[demo.id];
      if (!csvContent || csvContent.startsWith('Error')) {
        throw new Error('Failed to load CSV data');
      }
      
      // Create a File object to simulate file upload
      const file = new File([csvContent], demo.dataset, { type: 'text/csv' });
      
      // Call the demo loader with the demo data
      onLoadDemo({ ...demo, csvContent, file });
    } catch (error) {
      console.error('Error loading demo:', error);
      alert(`Failed to load demo dataset: ${error.message}`);
    }
  };

  const downloadCsv = async (demo: DemoCard) => {
    if (!csvData[demo.id]) {
      await loadCsvData(demo);
    }
    
    const csvContent = csvData[demo.id];
    if (csvContent && !csvContent.startsWith('Error')) {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = demo.dataset;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const downloadHtml = async (demo: DemoCard) => {
    if (!htmlData[demo.id]) {
      await loadHtmlData(demo);
    }
    
    const htmlContent = htmlData[demo.id];
    if (htmlContent && !htmlContent.startsWith('Error')) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = demo.htmlFile;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const openHtmlPreview = async (demo: DemoCard) => {
    if (!htmlData[demo.id]) {
      await loadHtmlData(demo);
    }
    
    const htmlContent = htmlData[demo.id];
    if (htmlContent && !htmlContent.startsWith('Error')) {
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <BarChart3 className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Demo Stories</h2>
          <p className="text-sm text-gray-600">Explore complete examples: prompts, data, and generated outputs</p>
        </div>
      </div>

      <div className="space-y-8">
        {DEMO_STORIES.map((demo) => {
          const currentTab = activeTab[demo.id] || 'prompt';
          const isLoading = loading[demo.id];
          
          return (
            <div key={demo.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{demo.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">{demo.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {demo.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-white text-gray-700 text-xs rounded-full font-medium border"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadDemo(demo)}
                      disabled={disabled}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Use This Dataset
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => handleTabClick(demo, 'prompt')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                      currentTab === 'prompt'
                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                    AI Prompt
                  </button>
                  <button
                    onClick={() => handleTabClick(demo, 'csv')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                      currentTab === 'csv'
                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Download className="h-4 w-4" />
                    CSV Data ({demo.dataset})
                  </button>
                  <button
                    onClick={() => handleTabClick(demo, 'output')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                      currentTab === 'output'
                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Code className="h-4 w-4" />
                    Generated Output ({demo.htmlFile})
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {currentTab === 'prompt' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">AI Prompt Used</h4>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                        {demo.prompt}
                      </pre>
                    </div>
                  </div>
                )}

                {currentTab === 'csv' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Dataset Preview</h4>
                      <button
                        onClick={() => downloadCsv(demo)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Download className="h-3 w-3" />
                        Download CSV
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border max-h-96 overflow-auto">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                          <span className="ml-2 text-gray-600">Loading CSV data...</span>
                        </div>
                      ) : (
                        <pre className="text-xs text-gray-700 whitespace-pre font-mono leading-relaxed">
                          {csvData[demo.id] ? 
                            csvData[demo.id].split('\n').slice(0, 20).join('\n') + 
                            (csvData[demo.id].split('\n').length > 20 ? '\n... (truncated)' : '')
                            : 'Click to load CSV data'
                          }
                        </pre>
                      )}
                    </div>
                  </div>
                )}

                {currentTab === 'output' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Generated Scrollytelling HTML</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openHtmlPreview(demo)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </button>
                        <button
                          onClick={() => downloadHtml(demo)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          <Download className="h-3 w-3" />
                          Download HTML
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border max-h-96 overflow-auto">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                          <span className="ml-2 text-gray-600">Loading HTML output...</span>
                        </div>
                      ) : (
                        <pre className="text-xs text-gray-700 whitespace-pre font-mono leading-relaxed">
                          {htmlData[demo.id] || 'Click to load HTML output'}
                        </pre>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-100 rounded">
            <Eye className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">How to Use These Examples</h4>
            <p className="text-sm text-blue-800 leading-relaxed">
              Explore each tab to see the complete workflow: the AI prompt that was used, the raw CSV data, 
              and the final generated scrollytelling HTML. Click "Use This Dataset" to load the data and 
              generate your own version with modifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};