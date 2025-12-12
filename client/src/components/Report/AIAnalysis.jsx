import React from "react";
import { Brain, Sparkles, Loader2, ChevronUp, AlertCircle, BarChart3, TrendingUp, Lightbulb } from "lucide-react";

const AIAnalysis = ({
  aiAnalysis,
  aiLoading,
  aiError,
  showAiAnalysis,
  onGenerate,
  onToggle,
}) => {
  return (
    <div className="animate-fade-in relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-lg">
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Business Insights</h2>
              <p className="text-sm text-gray-500">Professional analysis & recommendations</p>
            </div>
          </div>

          <button
            onClick={showAiAnalysis ? onToggle : onGenerate}
            disabled={aiLoading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : showAiAnalysis ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Hide Analysis
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Analysis
              </>
            )}
          </button>
        </div>

        {/* AI Error State */}
        {aiError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <p className="font-semibold text-red-700">Analysis Failed</p>
                <p className="text-sm text-red-600">{aiError}</p>
              </div>
            </div>
          </div>
        )}

        {/* AI Loading State */}
        {aiLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20" />
              <div className="relative rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 p-6 shadow-xl">
                <Brain className="h-12 w-12 animate-pulse text-white" />
              </div>
            </div>
            <p className="mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-lg font-bold text-transparent">
              Analyzing Your Business Data...
            </p>
            <p className="text-sm text-gray-500">This may take a few moments</p>
          </div>
        )}

        {/* AI Analysis Results */}
        {showAiAnalysis && aiAnalysis && !aiLoading && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900">Executive Summary</h3>
              </div>
              <p className="leading-relaxed text-gray-700">{aiAnalysis.summary}</p>
            </div>

            {/* Predictions */}
            {aiAnalysis.predictions && aiAnalysis.predictions.length > 0 && (
              <div className="rounded-xl border border-teal-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold text-gray-900">Predictions</h3>
                </div>
                <ul className="space-y-2.5">
                  {aiAnalysis.predictions.map((prediction, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 rounded-lg bg-teal-50/50 p-3 transition-all hover:bg-teal-50"
                      style={{ animation: `fadeInScale ${0.2 + idx * 0.1}s ease-out` }}
                    >
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                        {idx + 1}
                      </div>
                      <p className="flex-1 text-sm leading-relaxed text-gray-700">
                        {typeof prediction === 'string' ? prediction : JSON.stringify(prediction)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0 && (
              <div className="rounded-xl border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-bold text-gray-900">Recommendations</h3>
                </div>
                <ul className="space-y-2.5">
                  {aiAnalysis.suggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 rounded-lg bg-emerald-50/50 p-3 transition-all hover:bg-emerald-50"
                      style={{ animation: `fadeInScale ${0.2 + idx * 0.1}s ease-out` }}
                    >
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                        💡
                      </div>
                      <p className="flex-1 text-sm leading-relaxed text-gray-700">
                        {typeof suggestion === 'string' ? suggestion : JSON.stringify(suggestion)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Insights */}
            {aiAnalysis.insights && aiAnalysis.insights.length > 0 && (
              <div className="rounded-xl border border-teal-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-teal-600" />
                  <h3 className="font-bold text-gray-900">Key Insights</h3>
                </div>
                <ul className="space-y-2.5">
                  {aiAnalysis.insights.map((insight, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 rounded-lg bg-teal-50/50 p-3 transition-all hover:bg-teal-50"
                      style={{ animation: `fadeInScale ${0.2 + idx * 0.1}s ease-out` }}
                    >
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700">
                        ✨
                      </div>
                      <p className="flex-1 text-sm leading-relaxed text-gray-700">
                        {typeof insight === 'string' ? insight : JSON.stringify(insight)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;
