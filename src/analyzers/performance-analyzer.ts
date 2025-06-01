import { Analyzer } from "./analyzer.interface";
import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export class PerformanceAnalyzer implements Analyzer {
    category: SEOCategory = "performance";

    analyze(nodes: FramerNode[]): SEOIssue[] {
        const issues: SEOIssue[] = [];
        
        // Check for excessive JavaScript
        this.checkJavaScriptUsage(nodes, issues);
        
        // Check for image optimization
        this.checkImageOptimization(nodes, issues);
        
        // Check for resource minification
        this.checkResourceMinification(nodes, issues);
        
        // Check for critical rendering path
        this.checkCriticalRenderingPath(nodes, issues);
        
        // Check for render-blocking resources
        this.checkRenderBlockingResources(nodes, issues);
        
        return issues;
    }
    
    private checkJavaScriptUsage(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find all script nodes
        const scriptNodes = nodes.filter(node => 
            node.type === "script" || 
            node.name.toLowerCase().includes("script"));
            
        if (scriptNodes.length > 15) {
            issues.push({
                type: "warning",
                message: `High number of JavaScript resources (${scriptNodes.length})`,
                category: this.category,
                recommendation: "Reduce the number of JavaScript files by bundling them together or removing unnecessary scripts",
                priority: "important",
                externalResourceLink: "https://web.dev/optimize-javascript-execution/",
                externalResourceTitle: "Web.dev: Optimize JavaScript execution"
            });
        }
        
        // Check for defer or async attributes
        const syncScriptNodes = scriptNodes.filter(node => 
            !node.name.toLowerCase().includes("defer") && 
            !node.name.toLowerCase().includes("async"));
            
        if (syncScriptNodes.length > 5) {
            issues.push({
                type: "warning",
                message: "Multiple synchronous JavaScript resources",
                category: this.category,
                recommendation: "Use defer or async attributes for non-critical JavaScript to improve page load time",
                priority: "important",
                externalResourceLink: "https://web.dev/efficiently-load-third-party-javascript/",
                externalResourceTitle: "Web.dev: Efficiently load third-party JavaScript"
            });
        }
    }
    
    private checkImageOptimization(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find all image nodes
        const imageNodes = nodes.filter(node => 
            node.type === "image" || 
            node.name.toLowerCase().includes("image") || 
            node.name.toLowerCase().includes("img"));
            
        // Check for WebP format adoption
        const nonWebPImages = imageNodes.filter(node => 
            !node.name.toLowerCase().includes(".webp"));
            
        if (nonWebPImages.length > 3) {
            issues.push({
                type: "info",
                message: "Consider using WebP image format",
                category: this.category,
                recommendation: "Convert images to WebP format for better compression and faster loading",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/serve-images-webp/",
                externalResourceTitle: "Web.dev: Serve images in next-gen formats"
            });
        }
        
        // Check for responsive images
        const nonResponsiveImages = imageNodes.filter(node => 
            !node.name.toLowerCase().includes("srcset") && 
            !node.name.toLowerCase().includes("sizes"));
            
        if (nonResponsiveImages.length > 3) {
            issues.push({
                type: "warning",
                message: "Non-responsive images detected",
                category: this.category,
                recommendation: "Use srcset and sizes attributes for responsive images to optimize for different devices",
                priority: "important",
                externalResourceLink: "https://web.dev/serve-responsive-images/",
                externalResourceTitle: "Web.dev: Serve responsive images"
            });
        }
    }
    
    private checkResourceMinification(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find CSS and JS resources
        const cssNodes = nodes.filter(node => 
            node.type === "style" || 
            node.name.toLowerCase().includes("style") ||
            node.name.toLowerCase().includes(".css"));
            
        const jsNodes = nodes.filter(node => 
            node.type === "script" || 
            node.name.toLowerCase().includes("script") ||
            node.name.toLowerCase().includes(".js"));
            
        // Check for minification indicators
        const potentiallyUnminifiedCss = cssNodes.filter(node => 
            !node.name.toLowerCase().includes(".min.css") && 
            !node.name.toLowerCase().includes("minified"));
            
        const potentiallyUnminifiedJs = jsNodes.filter(node => 
            !node.name.toLowerCase().includes(".min.js") && 
            !node.name.toLowerCase().includes("minified"));
            
        if (potentiallyUnminifiedCss.length > 0) {
            issues.push({
                type: "warning",
                message: "Potentially unminified CSS resources",
                category: this.category,
                recommendation: "Minify CSS files to reduce file size and improve load times",
                priority: "important",
                externalResourceLink: "https://web.dev/minify-css/",
                externalResourceTitle: "Web.dev: Minify CSS"
            });
        }
        
        if (potentiallyUnminifiedJs.length > 0) {
            issues.push({
                type: "warning",
                message: "Potentially unminified JavaScript resources",
                category: this.category,
                recommendation: "Minify JavaScript files to reduce file size and improve load times",
                priority: "important",
                externalResourceLink: "https://web.dev/unminified-javascript/",
                externalResourceTitle: "Web.dev: Minify JavaScript"
            });
        }
    }
    
    private checkCriticalRenderingPath(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Look for inline CSS
        const inlineStyleNodes = nodes.filter(node => 
            node.name.toLowerCase().includes("style") && 
            !node.name.toLowerCase().includes("link"));
            
        if (inlineStyleNodes.length === 0) {
            issues.push({
                type: "info",
                message: "No inline critical CSS found",
                category: this.category,
                recommendation: "Consider inlining critical CSS to improve above-the-fold content rendering",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/extract-critical-css/",
                externalResourceTitle: "Web.dev: Extract critical CSS"
            });
        }
        
        // Check for preload/prefetch
        const preloadNodes = nodes.filter(node => 
            node.name.toLowerCase().includes("preload") || 
            node.name.toLowerCase().includes("prefetch"));
            
        if (preloadNodes.length === 0) {
            issues.push({
                type: "info",
                message: "No resource preloading detected",
                category: this.category,
                recommendation: "Use preload for critical resources and prefetch for resources needed for future navigations",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/preload-critical-assets/",
                externalResourceTitle: "Web.dev: Preload critical assets"
            });
        }
    }
    
    private checkRenderBlockingResources(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for CSS in head without media queries
        const cssInHeadNodes = nodes.filter(node => 
            node.type === "style" || 
            (node.name.toLowerCase().includes("link") && 
             node.name.toLowerCase().includes("stylesheet")));
             
        const nonMediaCss = cssInHeadNodes.filter(node => 
            !node.name.toLowerCase().includes("media="));
            
        if (nonMediaCss.length > 3) {
            issues.push({
                type: "warning",
                message: "Multiple render-blocking CSS resources",
                category: this.category,
                recommendation: "Use media queries to make non-critical CSS non-render-blocking",
                priority: "important",
                externalResourceLink: "https://web.dev/defer-non-critical-css/",
                externalResourceTitle: "Web.dev: Defer non-critical CSS"
            });
        }
        
        // Check for scripts in head without async/defer
        const scriptsInHeadNodes = nodes.filter(node => 
            node.type === "script" && 
            !node.name.toLowerCase().includes("async") && 
            !node.name.toLowerCase().includes("defer"));
            
        if (scriptsInHeadNodes.length > 0) {
            issues.push({
                type: "warning",
                message: "Render-blocking scripts detected",
                category: this.category,
                recommendation: "Move scripts to the end of the body or use async/defer attributes",
                priority: "important",
                externalResourceLink: "https://web.dev/render-blocking-resources/",
                externalResourceTitle: "Web.dev: Eliminate render-blocking resources"
            });
        }
    }
} 