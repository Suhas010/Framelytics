import React from 'react';

/**
 * Component for rendering the footer with attribution
 */
export const Footer: React.FC = () => {
    return (
        <div className="footer">
            <div className="made-with-love">
                Made with <span className="heart">❤️</span> by <a href="https://github.com/suhas010" target="_blank" rel="noopener noreferrer">Suhas R More</a>
            </div>
        </div>
    );
}; 