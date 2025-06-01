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
    
    const handleAnalyze = async () => {
        await runAnalysis();
    };
    
    // Analyze icon (magnifying glass)
    const AnalyzeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "8px"}}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    );
    
    return (
        <button 
            className="framer-button-primary" 
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            style={{backgroundColor: config.primaryColor}}
        >
            {isAnalyzing ? (
                <>
                    <span className="loading-spinner"></span>
                    Analyzing {analysisMode.charAt(0).toUpperCase() + analysisMode.slice(1)}...
                </>
            ) : (
                <>
                    <AnalyzeIcon />
                    Analyze {analysisMode.charAt(0).toUpperCase() + analysisMode.slice(1)}
                </>
            )}
        </button>
    );
}; 