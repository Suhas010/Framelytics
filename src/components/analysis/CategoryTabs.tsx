import React from 'react';
import { SEOCategory } from '../../types/seo-types';

interface CategoryTabsProps {
    categories: SEOCategory[];
    selectedCategory: SEOCategory | 'all';
    onSelectCategory: (category: SEOCategory | 'all') => void;
}

/**
 * Component for displaying category tabs for filtering issues
 */
export const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
    categories, 
    selectedCategory, 
    onSelectCategory 
}) => {
    // Format category name for display
    const formatCategoryName = (category: SEOCategory) => {
        return category.charAt(0).toUpperCase() + category.slice(1);
    };
    
    return (
        <div className="category-tabs">
            {categories.map(category => (
                <button 
                    key={category} 
                    className={selectedCategory === category ? 'active' : ''}
                    onClick={() => onSelectCategory(category)}
                >
                    {formatCategoryName(category)}
                </button>
            ))}
        </div>
    );
}; 