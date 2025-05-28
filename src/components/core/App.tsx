import React from 'react';
import { framer } from 'framer-plugin';
import { useAnalysisContext, ANALYSIS_CONFIG } from '../../context/AnalysisContext';
import { AnalysisTabs } from './AnalysisTabs';
import { AnalyzeButton } from './AnalyzeButton';
import { AnalysisResults } from '../analysis/AnalysisResults';
import { ProjectInfoForm } from '../forms/ProjectInfoForm';
import { Footer } from '../layout/Footer';

// Configure Framer UI
framer.showUI({
    position: "top right",
    width: 400,
    height: 700,
});

/**
 * Main application component
 */
export const App: React.FC = () => {
    const { 
        showProjectInfoForm, 
        getCurrentResults,
        analysisMode
    } = useAnalysisContext();
    
    return (
        <main className="seo-analyzer" style={{'--primary-color': ANALYSIS_CONFIG[analysisMode].primaryColor, '--secondary-color': ANALYSIS_CONFIG[analysisMode].secondaryColor} as React.CSSProperties}>
            <h1>Framer Analyzer</h1>
            
            {showProjectInfoForm ? (
                <ProjectInfoForm />
            ) : (
                <>
                    <AnalysisTabs />
                    
                    {!getCurrentResults() && (
                        <AnalyzeButton />
                    )}
                    
                    {getCurrentResults() && (
                        <AnalysisResults />
                    )}
                    
                    <Footer />
                </>
            )}
        </main>
    );
}; 