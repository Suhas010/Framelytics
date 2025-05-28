import React from 'react';
import { useAnalysisContext, ANALYSIS_CONFIG } from '../../context/AnalysisContext';
import { useAnalyzer } from '../../hooks/useAnalyzer';

/**
 * Component for rendering the analyze button
 */
export const AnalyzeButton: React.FC = () => {
    const { analysisMode, isAnalyzing } = useAnalysisContext();
    const { runAnalysis } = useAnalyzer();
    
    const config = ANALYSIS_CONFIG[analysisMode];
    
    return (
        <button 
            className="framer-button-primary" 
            onClick={runAnalysis}
            disabled={isAnalyzing}
            style={{backgroundColor: config.primaryColor}}
        >
            {isAnalyzing ? "Analyzing..." : `Analyze ${analysisMode.charAt(0).toUpperCase() + analysisMode.slice(1)}`}
        </button>
    );
}; 