import React, { createContext, useContext, ReactNode, useState } from 'react';
import { SEOAnalysisResult, SEOCategory } from '../types/seo-types';

// Analysis mode types
export type AnalysisMode = 'seo' | 'accessibility' | 'links';

// Analysis configuration for different modes
export const ANALYSIS_CONFIG = {
    'seo': {
        primaryColor: '#0055FF',
        secondaryColor: '#E6F0FF',
        icon: '🔍',
        footerText: 'Based on Google Search Console best practices & SEO guidelines'
    },
    'accessibility': {
        primaryColor: '#9333EA',
        secondaryColor: '#F3E8FF',
        icon: '♿',
        footerText: 'Following WCAG 2.1 accessibility standards'
    },
    'links': {
        primaryColor: '#16A34A',
        secondaryColor: '#DCFCE7',
        icon: '🔗',
        footerText: 'Checks for broken links, redirects, and link integrity'
    }
};

// Priority emoji map
export const PRIORITY_EMOJI = {
    "critical": "🔴",
    "important": "🟡",
    "nice-to-have": "🔵"
};

// Project info interface
export interface ProjectInfo {
    name: string;
    stageUrl: string;
    productionUrl: string;
    description: string;
    team: string;
}

// Context interface
interface AnalysisContextType {
    analysisMode: AnalysisMode;
    setAnalysisMode: (mode: AnalysisMode) => void;
    seoResults: SEOAnalysisResult | null;
    setSeoResults: (results: SEOAnalysisResult | null) => void;
    accessibilityResults: SEOAnalysisResult | null;
    setAccessibilityResults: (results: SEOAnalysisResult | null) => void;
    linksResults: SEOAnalysisResult | null;
    setLinksResults: (results: SEOAnalysisResult | null) => void;
    seoCategory: SEOCategory | 'all';
    setSeoCategory: (category: SEOCategory | 'all') => void;
    accessibilityCategory: SEOCategory | 'all';
    setAccessibilityCategory: (category: SEOCategory | 'all') => void;
    linksCategory: SEOCategory | 'all';
    setLinksCategory: (category: SEOCategory | 'all') => void;
    isAnalyzing: boolean;
    setIsAnalyzing: (isAnalyzing: boolean) => void;
    projectInfo: ProjectInfo;
    setProjectInfo: (info: ProjectInfo) => void;
    showProjectInfoForm: boolean;
    setShowProjectInfoForm: (show: boolean) => void;
    getCurrentResults: () => SEOAnalysisResult | null;
    getCurrentCategory: () => SEOCategory | 'all';
    setCurrentCategory: (category: SEOCategory | 'all') => void;
    resetResults: () => void;
}

// Default project info
const defaultProjectInfo: ProjectInfo = {
    name: '',
    stageUrl: '',
    productionUrl: '',
    description: '',
    team: ''
};

// Create the context
const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

// Provider component
export function AnalysisProvider({ children }: { children: ReactNode }) {
    // Analysis mode state
    const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('seo');
    
    // Results state
    const [seoResults, setSeoResults] = useState<SEOAnalysisResult | null>(null);
    const [accessibilityResults, setAccessibilityResults] = useState<SEOAnalysisResult | null>(null);
    const [linksResults, setLinksResults] = useState<SEOAnalysisResult | null>(null);
    
    // Category selection state
    const [seoCategory, setSeoCategory] = useState<SEOCategory | 'all'>('all');
    const [accessibilityCategory, setAccessibilityCategory] = useState<SEOCategory | 'all'>('all');
    const [linksCategory, setLinksCategory] = useState<SEOCategory | 'all'>('all');
    
    // Other state
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [projectInfo, setProjectInfo] = useState<ProjectInfo>(defaultProjectInfo);
    const [showProjectInfoForm, setShowProjectInfoForm] = useState(false);
    
    // Handle analysis mode change
    const handleAnalysisModeChange = (mode: AnalysisMode) => {
        setAnalysisMode(mode);
        // Reset the category to 'all' when changing modes to ensure all results are displayed
        switch (mode) {
            case 'accessibility':
                setAccessibilityCategory('all');
                break;
            case 'links':
                setLinksCategory('all');
                break;
            default:
                setSeoCategory('all');
                break;
        }
    };
    
    // Get current results based on active tab
    const getCurrentResults = () => {
        switch (analysisMode) {
            case 'accessibility':
                return accessibilityResults;
            case 'links':
                return linksResults;
            default:
                return seoResults;
        }
    };
    
    // Get current category based on active tab
    const getCurrentCategory = () => {
        switch (analysisMode) {
            case 'accessibility':
                return accessibilityCategory;
            case 'links':
                return linksCategory;
            default:
                return seoCategory;
        }
    };
    
    // Set category for current mode
    const setCurrentCategory = (category: SEOCategory | 'all') => {
        switch (analysisMode) {
            case 'accessibility':
                setAccessibilityCategory(category);
                break;
            case 'links':
                setLinksCategory(category);
                break;
            default:
                setSeoCategory(category);
                break;
        }
    };
    
    // Reset results for current mode
    const resetResults = () => {
        switch (analysisMode) {
            case 'accessibility':
                setAccessibilityResults(null);
                break;
            case 'links':
                setLinksResults(null);
                break;
            default:
                setSeoResults(null);
                break;
        }
    };
    
    return (
        <AnalysisContext.Provider value={{
            analysisMode,
            setAnalysisMode: handleAnalysisModeChange,
            seoResults,
            setSeoResults,
            accessibilityResults,
            setAccessibilityResults,
            linksResults,
            setLinksResults,
            seoCategory,
            setSeoCategory,
            accessibilityCategory,
            setAccessibilityCategory,
            linksCategory,
            setLinksCategory,
            isAnalyzing,
            setIsAnalyzing,
            projectInfo,
            setProjectInfo,
            showProjectInfoForm,
            setShowProjectInfoForm,
            getCurrentResults,
            getCurrentCategory,
            setCurrentCategory,
            resetResults
        }}>
            {children}
        </AnalysisContext.Provider>
    );
}

// Custom hook for using the Analysis context
export function useAnalysisContext() {
    const context = useContext(AnalysisContext);
    if (context === undefined) {
        throw new Error('useAnalysisContext must be used within an AnalysisProvider');
    }
    return context;
} 