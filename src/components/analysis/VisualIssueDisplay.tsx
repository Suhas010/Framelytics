import React, { useState } from 'react';
import { SEOIssue } from '../../types/seo-types';

interface VisualIssueDisplayProps {
    issue: SEOIssue;
}

/**
 * Component for displaying visual information about an issue (screenshots or position)
 */
export const VisualIssueDisplay: React.FC<VisualIssueDisplayProps> = ({ issue }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    
    // Check if we have visual information
    const hasVisualInfo = issue.elementPosition || issue.screenshot;
    
    if (!hasVisualInfo) return null;
    
    // Handle image load success
    const handleImageLoad = () => {
        setImageLoaded(true);
    };
    
    // Handle image load error
    const handleImageError = () => {
        setImageError(true);
        console.error("Failed to load screenshot for element:", issue.element);
    };
    
    /**
     * Highlight the element in Framer
     */
    const highlightElementInFramer = () => {
        if (!issue.elementId) return;
        
        try {
            // In a real implementation, this would use Framer's API to:
            // 1. Select the element with the given ID
            // 2. Scroll to it
            // 3. Highlight it visually
            
            // For now, we'll just log that we want to highlight it
            console.log(`Highlighting element: ${issue.elementId}`);
            
            // Example of what this might look like with a real API:
            // framer.selectNode(issue.elementId);
            // framer.scrollToNode(issue.elementId);
            // framer.highlightNode(issue.elementId);
        } catch (error) {
            console.error("Failed to highlight element:", error);
        }
    };
    
    return (
        <div className="issue-visual">
            {issue.screenshot && !imageError && (
                <div className="issue-screenshot">
                    <div className="screenshot-title">Element Screenshot:</div>
                    <img 
                        src={issue.screenshot} 
                        alt={`Screenshot of ${issue.element || 'element'}`}
                        width="100%"
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        style={{ display: imageLoaded ? 'block' : 'none' }}
                    />
                    {!imageLoaded && (
                        <div className="screenshot-loading">
                            Loading screenshot...
                        </div>
                    )}
                </div>
            )}
            
            {(issue.elementPosition && (!issue.screenshot || imageError)) && (
                <div className="issue-element-position">
                    <div className="position-title">Element Position:</div>
                    <div 
                        className="position-indicator"
                        style={{
                            position: "relative",
                            width: "100%",
                            height: "100px",
                            border: "1px dashed #ccc",
                            borderRadius: "4px",
                            overflow: "hidden"
                        }}
                    >
                        <div 
                            style={{
                                position: "absolute",
                                left: `${issue.elementPosition.x / 10}%`,
                                top: `${issue.elementPosition.y / 10}%`,
                                width: `${issue.elementPosition.width / 5}px`,
                                height: `${issue.elementPosition.height / 5}px`,
                                backgroundColor: "rgba(255, 0, 0, 0.2)",
                                border: "1px solid rgba(255, 0, 0, 0.5)",
                                borderRadius: "2px"
                            }}
                        />
                        <div 
                            className="element-label"
                            style={{
                                position: "absolute",
                                left: "5px",
                                top: "5px",
                                fontSize: "10px",
                                backgroundColor: "rgba(0,0,0,0.5)",
                                color: "white",
                                padding: "2px 4px",
                                borderRadius: "2px"
                            }}
                        >
                            {issue.element}
                        </div>
                    </div>
                </div>
            )}
            
            <div className="issue-highlight-info">
                <button 
                    className="highlight-element-btn"
                    onClick={highlightElementInFramer}
                >
                    Highlight in Framer
                </button>
            </div>
        </div>
    );
}; 