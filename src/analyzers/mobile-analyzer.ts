import { Analyzer } from "./analyzer.interface";
import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export class MobileAnalyzer implements Analyzer {
    category: SEOCategory = "mobile";

    analyze(nodes: FramerNode[]): SEOIssue[] {
        const issues: SEOIssue[] = [];
        
        // Check for viewport meta tag
        this.checkViewportMetaTag(nodes, issues);
        
        // Check for tap targets
        this.checkTapTargets(nodes, issues);
        
        // Check for font sizing
        this.checkFontSizing(nodes, issues);
        
        // Check for mobile-friendly media queries
        this.checkMediaQueries(nodes, issues);
        
        // Check for mobile-specific issues
        this.checkMobileSpecificIssues(nodes, issues);
        
        return issues;
    }
    
    private checkViewportMetaTag(nodes: FramerNode[], issues: SEOIssue[]): void {
        const viewportNode = nodes.find(node => 
            (node.metadata?.name === "viewport") ||
            (node.name.toLowerCase().includes("meta") && node.name.toLowerCase().includes("viewport")));
            
        if (!viewportNode) {
            issues.push({
                type: "error",
                message: "Missing viewport meta tag",
                category: this.category,
                recommendation: "Add a viewport meta tag for proper mobile rendering: <meta name='viewport' content='width=device-width, initial-scale=1'>",
                priority: "critical",
                externalResourceLink: "https://web.dev/responsive-web-design-basics/#set-the-viewport",
                externalResourceTitle: "Web.dev: Set the viewport"
            });
            return;
        }
        
        const viewportContent = viewportNode.metadata?.content || "";
        
        if (!viewportContent.includes("width=device-width")) {
            issues.push({
                type: "error",
                message: "Viewport meta tag missing width=device-width",
                category: this.category,
                recommendation: "Add width=device-width to your viewport meta tag for responsive design",
                priority: "critical",
                externalResourceLink: "https://developers.google.com/search/mobile-sites/mobile-seo/responsive-design",
                externalResourceTitle: "Google: Responsive design"
            });
        }
        
        if (!viewportContent.includes("initial-scale=1")) {
            issues.push({
                type: "warning",
                message: "Viewport meta tag missing initial-scale=1",
                category: this.category,
                recommendation: "Add initial-scale=1 to your viewport meta tag for proper scaling",
                priority: "important",
                externalResourceLink: "https://developers.google.com/search/mobile-sites/mobile-seo/responsive-design",
                externalResourceTitle: "Google: Responsive design"
            });
        }
        
        if (viewportContent.includes("user-scalable=no") || 
            viewportContent.includes("maximum-scale=1") || 
            viewportContent.includes("minimum-scale=1 maximum-scale=1")) {
            issues.push({
                type: "error",
                message: "Viewport prevents zooming",
                category: this.category,
                recommendation: "Remove user-scalable=no, maximum-scale=1, or similar restrictions to allow users to zoom",
                priority: "critical",
                externalResourceLink: "https://web.dev/meta-viewport/",
                externalResourceTitle: "Web.dev: Accessible viewport"
            });
        }
    }
    
    private checkTapTargets(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find interactive elements
        const interactiveNodes = nodes.filter(node => 
            node.type === "button" || 
            (node.type === "a" && node.href) ||
            node.name.toLowerCase().includes("button") || 
            node.name.toLowerCase().includes("link") || 
            node.name.toLowerCase().includes("clickable"));
            
        // Check for tap target size
        const smallTapTargets = interactiveNodes.filter(node => {
            const width = node.style?.width || 0;
            const height = node.style?.height || 0;
            
            // Google's recommendation is at least 48x48px for tap targets
            return (width > 0 && width < 48) || (height > 0 && height < 48);
        });
        
        if (smallTapTargets.length > 0) {
            issues.push({
                type: "warning",
                message: `${smallTapTargets.length} small tap targets detected`,
                category: this.category,
                recommendation: "Ensure tap targets are at least 48x48px in size with adequate spacing",
                priority: "important",
                externalResourceLink: "https://web.dev/tap-targets/",
                externalResourceTitle: "Web.dev: Tap targets are sized appropriately"
            });
        }
        
        // Check for tap target spacing
        // This is a simplified check that looks for small gaps between elements
        // In a real implementation, we would do a more sophisticated spatial analysis
        let potentiallyCloseTargets = false;
        
        for (let i = 0; i < interactiveNodes.length; i++) {
            for (let j = i + 1; j < interactiveNodes.length; j++) {
                const node1 = interactiveNodes[i];
                const node2 = interactiveNodes[j];
                
                // Check if both nodes have position data
                if (node1.style?.width && node1.style?.height && 
                    node2.style?.width && node2.style?.height) {
                    // This is a simplified check that assumes we have access to position data
                    // which isn't fully implemented in the current FramerNode type
                    potentiallyCloseTargets = true;
                    break;
                }
            }
            
            if (potentiallyCloseTargets) break;
        }
        
        if (potentiallyCloseTargets) {
            issues.push({
                type: "warning",
                message: "Potentially crowded tap targets",
                category: this.category,
                recommendation: "Ensure at least 8px of space between tap targets for better usability",
                priority: "important",
                externalResourceLink: "https://web.dev/tap-targets/",
                externalResourceTitle: "Web.dev: Tap targets are sized appropriately"
            });
        }
    }
    
    private checkFontSizing(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find text nodes
        const textNodes = nodes.filter(node => 
            node.type === "text" || 
            node.name.toLowerCase().includes("text") || 
            node.name.toLowerCase().includes("paragraph") || 
            node.name.toLowerCase().includes("heading"));
            
        // Check for small font sizes
        const smallFontNodes = textNodes.filter(node => {
            const fontSize = node.style?.fontSize || 0;
            // Generally 16px is considered the minimum readable font size on mobile
            return fontSize > 0 && fontSize < 16;
        });
        
        if (smallFontNodes.length > 0) {
            issues.push({
                type: "warning",
                message: `${smallFontNodes.length} text element${smallFontNodes.length > 1 ? 's' : ''} with small font size`,
                category: this.category,
                recommendation: "Use a minimum font size of 16px for body text to ensure readability on mobile devices",
                priority: "important",
                externalResourceLink: "https://web.dev/font-size/",
                externalResourceTitle: "Web.dev: Ensure text remains visible during font loading"
            });
        }
        
        // Check for non-responsive font sizing
        const nonResponsiveFontNodes = textNodes.filter(node => {
            const fontSize = node.style?.fontSize || 0;
            // If font size is specified in px units rather than em, rem, or vw
            return fontSize > 0 && node.name.toLowerCase().includes("px") && 
                   !node.name.toLowerCase().includes("em") && 
                   !node.name.toLowerCase().includes("rem") && 
                   !node.name.toLowerCase().includes("vw");
        });
        
        if (nonResponsiveFontNodes.length > 3) {
            issues.push({
                type: "info",
                message: "Consider using relative font sizes",
                category: this.category,
                recommendation: "Use relative units like em, rem, or vw instead of px for better scaling across devices",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/responsive-web-design-basics/#responsive-text",
                externalResourceTitle: "Web.dev: Responsive text"
            });
        }
    }
    
    private checkMediaQueries(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Look for media query indicators in stylesheets
        const styleNodes = nodes.filter(node => 
            node.type === "style" || 
            node.name.toLowerCase().includes("style") ||
            node.name.toLowerCase().includes(".css"));
            
        const mediaQueryIndicators = ["@media", "media=", "media query", "responsive"];
        let hasMediaQueries = false;
        
        for (const node of styleNodes) {
            if (mediaQueryIndicators.some(indicator => 
                node.name.toLowerCase().includes(indicator) || 
                (node.text && node.text.toLowerCase().includes(indicator)))) {
                hasMediaQueries = true;
                break;
            }
        }
        
        if (!hasMediaQueries && styleNodes.length > 0) {
            issues.push({
                type: "warning",
                message: "No media queries detected",
                category: this.category,
                recommendation: "Use media queries to adapt your layout for different screen sizes",
                priority: "important",
                externalResourceLink: "https://web.dev/responsive-web-design-basics/#media-queries",
                externalResourceTitle: "Web.dev: Media queries"
            });
        }
    }
    
    private checkMobileSpecificIssues(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for fixed width layouts
        const fixedWidthNodes = nodes.filter(node => {
            const width = node.style?.width || 0;
            // Look for container elements with fixed width above 600px
            return width > 600 && !node.name.toLowerCase().includes("%") && 
                   !node.name.toLowerCase().includes("vw") && 
                   (node.name.toLowerCase().includes("container") || 
                    node.name.toLowerCase().includes("wrapper") || 
                    node.name.toLowerCase().includes("layout") || 
                    node.name.toLowerCase().includes("section"));
        });
        
        if (fixedWidthNodes.length > 0) {
            issues.push({
                type: "warning",
                message: "Fixed-width layout detected",
                category: this.category,
                recommendation: "Use percentage or viewport-relative units for width instead of fixed pixel values",
                priority: "important",
                externalResourceLink: "https://web.dev/responsive-web-design-basics/#flexible-images",
                externalResourceTitle: "Web.dev: Flexible grids"
            });
        }
        
        // Check for horizontal scrolling
        const potentialOverflowNodes = nodes.filter(node => {
            const width = node.style?.width || 0;
            // Look for elements that might be wider than typical viewport
            return width > 480 && 
                   (node.name.toLowerCase().includes("table") || 
                    node.name.toLowerCase().includes("gallery") || 
                    node.name.toLowerCase().includes("slider") || 
                    node.name.toLowerCase().includes("horizontal"));
        });
        
        if (potentialOverflowNodes.length > 0) {
            issues.push({
                type: "warning",
                message: "Potential horizontal scrolling issues",
                category: this.category,
                recommendation: "Ensure content doesn't overflow the viewport by using responsive techniques for wide content",
                priority: "important",
                externalResourceLink: "https://web.dev/content-width/",
                externalResourceTitle: "Web.dev: Content fits the viewport"
            });
        }
        
        // Check for touch event listeners
        const potentiallyMissingTouchEvents = nodes.filter(node => 
            node.name.toLowerCase().includes("click") && 
            !node.name.toLowerCase().includes("touch"));
            
        if (potentiallyMissingTouchEvents.length > 3) {
            issues.push({
                type: "info",
                message: "Consider implementing touch events",
                category: this.category,
                recommendation: "Ensure interactive elements respond to touch events, not just mouse events",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/touch-events/",
                externalResourceTitle: "Web.dev: Touch events"
            });
        }
    }
} 