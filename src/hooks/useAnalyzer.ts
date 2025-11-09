import { SEOAnalyzerService } from '../utils/seo-analyzer.service.fixed';
import { useAnalysisContext, AnalysisMode } from '../context/AnalysisContext';
import { SEOCategory, SEOAnalysisResult } from '../types/seo-types';

/**
 * Utility function to create a delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Custom hook for analyzing frames with the SEO analyzer
 */
export function useAnalyzer() {
    const seoAnalyzer = new SEOAnalyzerService();
    const {
        setIsAnalyzing,
        setSeoResults,
        setAccessibilityResults,
        setLinksResults,
        analysisMode,
    } = useAnalysisContext();

    /**
     * Run analysis on selected nodes
     */
    const runAnalysis = async () => {
        setIsAnalyzing(true);

        try {
            const nodes = await seoAnalyzer.createNodesFromFramerSelection();
            
            // Set up filter based on current mode
            const filter = getFilterForMode(analysisMode);
            
            // Add a delay to simulate processing time (2-3 seconds)
            const simulatedDelay = Math.floor(Math.random() * 1000) + 2000; // 2-3 seconds
            await delay(simulatedDelay);
                
            const result = await seoAnalyzer.analyzeNodes(nodes, { filter });
            
            // Store results in appropriate state based on mode
            storeResults(analysisMode, result);
        } catch (error) {
            console.error(`Error analyzing ${analysisMode}:`, error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    /**
     * Get filter categories based on analysis mode
     */
    const getFilterForMode = (mode: AnalysisMode): SEOCategory[] => {
        switch (mode) {
            case 'seo':
                return [
                    'metadata',
                    'structure',
                    'images',
                    'content',
                    'social',
                    'performance',
                    'mobile',
                    'security',
                    'schema'
                    // 'international' is included via metadata
                ];
            case 'accessibility':
                return ['accessibility'];
            case 'links':
                return ['links'];
            default:
                return [
                    'metadata',
                    'structure',
                    'images',
                    'content',
                    'social',
                    'performance',
                    'mobile',
                    'security',
                    'schema'
                ];
        }
    };

    /**
     * Store results in the appropriate state based on mode
     */
    const storeResults = (mode: AnalysisMode, result: SEOAnalysisResult) => {
        switch (mode) {
            case 'accessibility':
                setAccessibilityResults(result);
                break;
            case 'links':
                setLinksResults(result);
                break;
            default:
                setSeoResults(result);
                break;
        }
    };

    return { runAnalysis };
} 