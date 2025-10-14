import React, { useState, ReactNode } from 'react';
import { SEOIssuePriority } from '../../types/seo-types';

interface CollapsibleSectionProps {
    title: string;
    issueCount: number;
    children: ReactNode;
    defaultExpanded?: boolean;
    priority?: SEOIssuePriority;
}

// Priority color mapping - muted versions
const PRIORITY_COLORS = {
    'critical': '#DC6B6B',    // Muted Red
    'important': '#E8A855',   // Muted Orange/Yellow
    'nice-to-have': '#6B9BD8' // Muted Blue
};

/**
 * Component for creating a collapsible section with a header and content
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
    title, 
    issueCount, 
    children, 
    defaultExpanded = false,
    priority
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    
    // Get background color based on priority
    const backgroundColor = priority ? PRIORITY_COLORS[priority] : 'var(--secondary-color)';
    
    return (
        <div className="collapsible-section" style={{ borderColor: backgroundColor }}>
            <div 
                className="section-header" 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ backgroundColor }}
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