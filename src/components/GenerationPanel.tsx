import React, { useState } from 'react';
import { Zap, RefreshCw } from 'lucide-react';

interface GenerationPanelProps {
  isGenerating: boolean;
  onGenerate: (userPrompt?: string, useStreaming?: boolean) => void;
  onRefactor: (instructions: string) => void;
  disabled: boolean;
  hasGenerated: boolean;
}

export const GenerationPanel: React.FC<GenerationPanelProps> = ({
  isGenerating,
  onGenerate,
  onRefactor,
  disabled,
  hasGenerated
}) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [refactorInstructions, setRefactorInstructions] = useState('');
  const [useStreaming, setUseStreaming] = useState(true);

  const handleGenerate = () => {
    onGenerate(userPrompt || undefined, useStreaming);
  };

  const handleRefactor = () => {
    if (refactorInstructions.trim()) {
      onRefactor(refactorInstructions);
      setRefactorInstructions('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Zap className="h-5 w-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">Generate Story</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="userPrompt" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Instructions (optional)
          </label>
          <textarea
            id="userPrompt"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Any specific requirements, focus areas, or style preferences for your story..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            disabled={disabled}
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useStreaming}
              onChange={(e) => setUseStreaming(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              disabled={disabled}
            />
            <span className="text-sm text-gray-700">Enable streaming (see code as it's generated)</span>
          </label>
        </div>

        <button
          onClick={handleGenerate}
          disabled={disabled || isGenerating}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Generate Scrollytelling Story
            </>
          )}
        </button>

        {hasGenerated && (
          <div className="border-t border-gray-200 pt-4 mt-6">
            <label htmlFor="refactorInstructions" className="block text-sm font-medium text-gray-700 mb-2">
              Refactor Instructions
            </label>
            <textarea
              id="refactorInstructions"
              value={refactorInstructions}
              onChange={(e) => setRefactorInstructions(e.target.value)}
              placeholder="Describe what changes you'd like to make to the generated story..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              disabled={disabled}
            />
            <button
              onClick={handleRefactor}
              disabled={disabled || isGenerating || !refactorInstructions.trim()}
              className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Refactoring...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refactor Story
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};