import React, { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
    title: string;
    issueCount: number;
    children: ReactNode;
    defaultExpanded?: boolean;
}

/**
 * Component for creating a collapsible section with a header and content
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
    title, 
    issueCount, 
    children, 
    defaultExpanded = false 
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    
    return (
        <div className="collapsible-section">
            <div 
                className="section-header" 
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2>
                    {title} 
                    <span className="issue-count">{issueCount}</span>
                </h2>
                <div className="section-toggle">{isExpanded ? '▼' : '▶'}</div>
            </div>
            
            {isExpanded && (
                <div className="section-content">
                    {children}
                </div>
            )}
        </div>
    );
}; 