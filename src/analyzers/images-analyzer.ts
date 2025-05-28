import { Analyzer } from "./analyzer.interface";
import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export class ImagesAnalyzer implements Analyzer {
    category: SEOCategory = "images";

    analyze(nodes: FramerNode[]): SEOIssue[] {
        const issues: SEOIssue[] = [];
        
        // Find all image nodes
        const imageNodes = nodes.filter(node => 
            node.type === "image" || 
            node.name.toLowerCase().includes("image") || 
            node.name.toLowerCase().includes("img") ||
            node.name.toLowerCase().includes("picture") ||
            node.name.toLowerCase().includes("icon") ||
            node.name.toLowerCase().includes("photo"));
            
        if (imageNodes.length === 0) {
            issues.push({
                type: "info",
                message: "No images found on the page",
                category: this.category,
                recommendation: "Consider adding relevant images to enhance content and SEO",
                priority: "nice-to-have",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/guidelines/google-images",
                externalResourceTitle: "Google: Google Images best practices"
            });
            return issues;
        }
        
        // Check for missing alt text
        this.checkAltText(imageNodes, issues);
        
        // Check for image filenames
        this.checkImageFilenames(imageNodes, issues);
        
        // Check for lazy loading
        this.checkLazyLoading(imageNodes, issues);
        
        // Check for image dimensions
        this.checkImageDimensions(imageNodes, issues);
        
        return issues;
    }
    
    private checkAltText(imageNodes: FramerNode[], issues: SEOIssue[]): void {
        const imagesWithoutAlt = imageNodes.filter(node => 
            !node.alt && 
            !node.name.includes("decorative") && 
            !node.name.includes("background"));
            
        if (imagesWithoutAlt.length > 0) {
            issues.push({
                type: "error",
                message: `${imagesWithoutAlt.length} image${imagesWithoutAlt.length > 1 ? 's' : ''} without alt text`,
                category: this.category,
                element: "img",
                recommendation: "Add descriptive alt text to all non-decorative images for accessibility and SEO",
                priority: "critical",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/guidelines/google-images#use-descriptive-alt-text",
                externalResourceTitle: "Google: Use descriptive alt text"
            });
            
            // List problematic images
            imagesWithoutAlt.forEach((node, index) => {
                if (index < 5) { // Limit to first 5 to avoid overwhelming the report
                    issues.push({
                        type: "info",
                        message: `Image '${node.name}' is missing alt text`,
                        category: this.category,
                        element: node.name,
                        elementId: node.id,
                        priority: "critical",
                        recommendation: "Add descriptive alt text that explains the image content"
                    });
                }
            });
            
            if (imagesWithoutAlt.length > 5) {
                issues.push({
                    type: "info",
                    message: `And ${imagesWithoutAlt.length - 5} more images without alt text`,
                    category: this.category,
                    priority: "important"
                });
            }
        }
        
        // Check for poor quality alt text
        const shortAltTextImages = imageNodes.filter(node => 
            node.alt && node.alt.length < 5 && 
            !node.name.includes("decorative") && 
            !node.name.includes("background"));
            
        if (shortAltTextImages.length > 0) {
            issues.push({
                type: "warning",
                message: `${shortAltTextImages.length} image${shortAltTextImages.length > 1 ? 's have' : ' has'} very short alt text`,
                category: this.category,
                element: "img",
                recommendation: "Use descriptive alt text that clearly explains the image content",
                priority: "important",
                externalResourceLink: "https://moz.com/learn/seo/alt-text",
                externalResourceTitle: "Moz: Image Alt Text"
            });
        }
    }
    
    private checkImageFilenames(imageNodes: FramerNode[], issues: SEOIssue[]): void {
        // Look for generic filenames like "image1.jpg" or "DSC0001.jpg"
        const genericFilenameRegex = /^(image|img|photo|pic|dsc|untitled|screenshot)[0-9]+\.(jpg|jpeg|png|gif|webp|svg)$/i;
        
        const imagesWithGenericFilenames = imageNodes.filter(node => {
            const filename = node.name.split('/').pop() || node.name;
            return genericFilenameRegex.test(filename);
        });
        
        if (imagesWithGenericFilenames.length > 0) {
            issues.push({
                type: "warning",
                message: `${imagesWithGenericFilenames.length} image${imagesWithGenericFilenames.length > 1 ? 's have' : ' has'} generic filenames`,
                category: this.category,
                recommendation: "Use descriptive filenames for images (e.g., 'red-sports-car.jpg' instead of 'image1.jpg')",
                priority: "nice-to-have",
                externalResourceLink: "https://developers.google.com/search/docs/advanced/guidelines/google-images#file-names",
                externalResourceTitle: "Google: Choose descriptive filenames"
            });
        }
    }
    
    private checkLazyLoading(imageNodes: FramerNode[], issues: SEOIssue[]): void {
        // In Framer, we can't directly check for lazy loading attributes, but we can recommend it
        if (imageNodes.length > 3) {
            issues.push({
                type: "info",
                message: "Multiple images detected - consider implementing lazy loading",
                category: this.category,
                recommendation: "Add loading=\"lazy\" attribute to images that appear below the fold",
                priority: "important",
                externalResourceLink: "https://web.dev/browser-level-image-lazy-loading/",
                externalResourceTitle: "Web.dev: Browser-level image lazy-loading for the web"
            });
        }
    }
    
    private checkImageDimensions(imageNodes: FramerNode[], issues: SEOIssue[]): void {
        // Check if image dimensions are defined
        const imagesWithoutDimensions = imageNodes.filter(node => 
            !node.style?.width || !node.style?.height);
            
        if (imagesWithoutDimensions.length > 0) {
            issues.push({
                type: "warning",
                message: `${imagesWithoutDimensions.length} image${imagesWithoutDimensions.length > 1 ? 's lack' : ' lacks'} explicit dimensions`,
                category: this.category,
                recommendation: "Set explicit width and height attributes on images to prevent layout shifts",
                priority: "important",
                externalResourceLink: "https://web.dev/optimize-cls/#images-without-dimensions",
                externalResourceTitle: "Web.dev: Optimize Cumulative Layout Shift - Images without dimensions"
            });
        }
    }
} 