import React from 'react';
import { useAnalysisContext, ANALYSIS_CONFIG } from '../../context/AnalysisContext';

/**
 * Component for rendering analysis mode tabs (SEO, Accessibility, Links)
 */
export const AnalysisTabs: React.FC = () => {
    const { analysisMode, setAnalysisMode, isAnalyzing } = useAnalysisContext();
    
    // Style for active button
    const getActiveStyle = (mode: 'seo' | 'accessibility' | 'links') => ({
        backgroundColor: ANALYSIS_CONFIG[mode].primaryColor,
        color: 'white',
        border: `2px solid ${ANALYSIS_CONFIG[mode].primaryColor}`
    });
    
    // Style for inactive button - more grayed out appearance
    const getInactiveStyle = (mode: 'seo' | 'accessibility' | 'links') => {
        // Create a lighter version of the primary color for the background
        const lightenColor = (color: string, percent: number) => {
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            
            const lightenAmount = percent / 100;
            const lightR = Math.round(r + (255 - r) * lightenAmount);
            const lightG = Math.round(g + (255 - g) * lightenAmount);
            const lightB = Math.round(b + (255 - b) * lightenAmount);
            
            return `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
        };
        
        const lightBackground = lightenColor(ANALYSIS_CONFIG[mode].primaryColor, 95);
        const lightBorder = lightenColor(ANALYSIS_CONFIG[mode].primaryColor, 70);
        
        return {
            backgroundColor: lightBackground,
            color: '#777',
            border: `1px solid ${lightBorder}`,
            opacity: 0.85
        };
    };
    
    return (
        <div className="analysis-buttons">
            <button 
                className={`analysis-button ${analysisMode === 'seo' ? 'active' : ''}`}
                onClick={() => setAnalysisMode('seo')}
                disabled={isAnalyzing}
                style={analysisMode === 'seo' ? getActiveStyle('seo') : getInactiveStyle('seo')}
            >
                <span className="button-icon">{ANALYSIS_CONFIG.seo.icon}</span> SEO
            </button>
            <button 
                className={`analysis-button ${analysisMode === 'accessibility' ? 'active' : ''}`}
                onClick={() => setAnalysisMode('accessibility')}
                disabled={isAnalyzing}
                style={analysisMode === 'accessibility' ? getActiveStyle('accessibility') : getInactiveStyle('accessibility')}
            >
                <span className="button-icon">{ANALYSIS_CONFIG.accessibility.icon}</span> Accessibility
            </button>
            <button 
                className={`analysis-button ${analysisMode === 'links' ? 'active' : ''}`}
                onClick={() => setAnalysisMode('links')}
                disabled={isAnalyzing}
                style={analysisMode === 'links' ? getActiveStyle('links') : getInactiveStyle('links')}
            >
                <span className="button-icon">{ANALYSIS_CONFIG.links.icon}</span> Links
            </button>
        </div>
    );
}; 