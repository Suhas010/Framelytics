import { Analyzer } from "./analyzer.interface";
import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export class SocialAnalyzer implements Analyzer {
    category: SEOCategory = "social";

    analyze(nodes: FramerNode[]): SEOIssue[] {
        const issues: SEOIssue[] = [];
        
        // Check for Open Graph tags
        this.checkOpenGraphTags(nodes, issues);
        
        // Check for Twitter cards
        this.checkTwitterCards(nodes, issues);
        
        // Check specifically for social preview images
        this.checkSocialPreviewImages(nodes, issues);
        
        // Check for social sharing options
        this.checkSocialSharingOptions(nodes, issues);
        
        return issues;
    }
    
    private checkOpenGraphTags(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Required Open Graph tags: og:title, og:type, og:image, og:url
        const requiredOgTags = ["title", "type", "image", "url"];
        const foundOgTags: string[] = [];
        
        nodes.forEach(node => {
            if (node.metadata?.property && node.metadata.property.startsWith("og:")) {
                const ogType = node.metadata.property.replace("og:", "");
                foundOgTags.push(ogType);
            }
        });
        
        const missingOgTags = requiredOgTags.filter(tag => !foundOgTags.includes(tag));
        
        if (missingOgTags.length === requiredOgTags.length) {
            issues.push({
                type: "error",
                message: "No Open Graph tags found",
                category: this.category,
                recommendation: "Add Open Graph tags for better social media sharing",
                priority: "critical",
                externalResourceLink: "https://ogp.me/",
                externalResourceTitle: "Open Graph Protocol"
            });
        } else if (missingOgTags.length > 0) {
            issues.push({
                type: "warning",
                message: `Missing required Open Graph tags: ${missingOgTags.map(tag => `og:${tag}`).join(", ")}`,
                category: this.category,
                recommendation: "Add all required Open Graph tags for optimal social sharing",
                priority: "important",
                externalResourceLink: "https://ogp.me/",
                externalResourceTitle: "Open Graph Protocol"
            });
        }
        
        // Check for og:description
        if (!foundOgTags.includes("description")) {
            issues.push({
                type: "warning",
                message: "Missing og:description tag",
                category: this.category,
                recommendation: "Add og:description for better social media previews",
                priority: "important",
                externalResourceLink: "https://ogp.me/",
                externalResourceTitle: "Open Graph Protocol"
            });
        }
        
        // Check for og:image:alt
        if (foundOgTags.includes("image") && !foundOgTags.includes("image:alt")) {
            issues.push({
                type: "warning",
                message: "Missing og:image:alt tag",
                category: this.category,
                recommendation: "Add alt text for your Open Graph image",
                priority: "important",
                externalResourceLink: "https://ogp.me/",
                externalResourceTitle: "Open Graph Protocol"
            });
        }
    }
    
    private checkTwitterCards(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for Twitter card type
        const twitterCardNode = nodes.find(node => 
            node.metadata?.name === "twitter:card");
            
        if (!twitterCardNode) {
            issues.push({
                type: "warning",
                message: "No Twitter card meta tag found",
                category: this.category,
                recommendation: "Add twitter:card meta tag for Twitter sharing",
                priority: "important",
                externalResourceLink: "https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started",
                externalResourceTitle: "Twitter Cards: Getting Started"
            });
            return;
        }
        
        // Check for essential Twitter tags
        const essentialTwitterTags = ["twitter:title", "twitter:description", "twitter:image"];
        const missingTwitterTags: string[] = [];
        
        essentialTwitterTags.forEach(tag => {
            const found = nodes.some(node => node.metadata?.name === tag);
            if (!found) {
                missingTwitterTags.push(tag);
            }
        });
        
        if (missingTwitterTags.length > 0) {
            issues.push({
                type: "warning",
                message: `Missing Twitter card tags: ${missingTwitterTags.join(", ")}`,
                category: this.category,
                recommendation: "Add all essential Twitter card tags for optimal Twitter sharing",
                priority: "important",
                externalResourceLink: "https://developer.twitter.com/en/docs/twitter-for-websites/cards/guides/getting-started",
                externalResourceTitle: "Twitter Cards: Getting Started"
            });
        }
    }
    
    // New method to specifically check for social preview images
    private checkSocialPreviewImages(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for Open Graph image
        const ogImageNode = nodes.find(node => 
            (node.metadata?.property === "og:image") ||
            (node.name.toLowerCase().includes("og:image")) ||
            (node.name.toLowerCase().includes("og-image")) ||
            (node.name.toLowerCase().includes("opengraph-image")));
            
        // Check for Twitter image
        const twitterImageNode = nodes.find(node => 
            (node.metadata?.name === "twitter:image") ||
            (node.name.toLowerCase().includes("twitter:image")) ||
            (node.name.toLowerCase().includes("twitter-image")));
            
        if (!ogImageNode && !twitterImageNode) {
            issues.push({
                type: "error",
                message: "No social preview images found",
                category: this.category,
                recommendation: "Add social preview images (og:image and twitter:image) to make your content stand out when shared on social media",
                priority: "critical",
                externalResourceLink: "https://blog.hubspot.com/marketing/open-graph-tags-facebook-twitter-linkedin",
                externalResourceTitle: "How to Use Open Graph Tags for Better Social Sharing"
            });
        } else if (!ogImageNode) {
            issues.push({
                type: "warning",
                message: "Missing Open Graph image (og:image)",
                category: this.category,
                recommendation: "Add an og:image tag for better previews on Facebook, LinkedIn, and other platforms",
                priority: "important",
                externalResourceLink: "https://ogp.me/",
                externalResourceTitle: "Open Graph Protocol"
            });
        } else if (!twitterImageNode) {
            issues.push({
                type: "warning",
                message: "Missing Twitter image (twitter:image)",
                category: this.category,
                recommendation: "Add a twitter:image tag for better previews on Twitter",
                priority: "important",
                externalResourceLink: "https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/summary-card-with-large-image",
                externalResourceTitle: "Twitter Summary Card with Large Image"
            });
        }
        
        // Check image dimensions if available
        if (ogImageNode) {
            // Ideal OG image size is 1200x630 pixels
            // This is just a placeholder - in a real implementation, we would check the actual image dimensions
            const hasProperSize = false; // This would be determined by actual image analysis
            
            if (!hasProperSize) {
                issues.push({
                    type: "info",
                    message: "Consider optimizing Open Graph image dimensions",
                    category: this.category,
                    recommendation: "Ideal size for Open Graph images is 1200x630 pixels",
                    priority: "nice-to-have",
                    externalResourceLink: "https://developers.facebook.com/docs/sharing/webmasters/images/",
                    externalResourceTitle: "Facebook Sharing: Images"
                });
            }
        }
    }
    
    private checkSocialSharingOptions(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Look for social sharing buttons or links
        const socialSharingNodes = nodes.filter(node => 
            node.name.toLowerCase().includes("social") || 
            node.name.toLowerCase().includes("share") ||
            node.name.toLowerCase().includes("facebook") ||
            node.name.toLowerCase().includes("twitter") ||
            node.name.toLowerCase().includes("linkedin") ||
            node.name.toLowerCase().includes("pinterest"));
            
        if (socialSharingNodes.length === 0) {
            issues.push({
                type: "info",
                message: "No social sharing options detected",
                category: this.category,
                recommendation: "Consider adding social sharing buttons to increase content distribution",
                priority: "nice-to-have",
                externalResourceLink: "https://developers.facebook.com/docs/plugins/share-button",
                externalResourceTitle: "Facebook: Share Button Plugin"
            });
        }
    }
} 