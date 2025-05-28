import { Analyzer } from "./analyzer.interface";
import { FramerNode, SEOIssue, SEOCategory } from "../types/seo-types";

export class AccessibilityAnalyzer implements Analyzer {
    category: SEOCategory = "accessibility";

    analyze(nodes: FramerNode[]): SEOIssue[] {
        const issues: SEOIssue[] = [];
        
        // Check for image alt text
        this.checkImageAltText(nodes, issues);
        
        // Check for ARIA attributes
        this.checkAriaAttributes(nodes, issues);
        
        // Check for form accessibility
        this.checkFormAccessibility(nodes, issues);
        
        // Check for keyboard navigation
        this.checkKeyboardNavigation(nodes, issues);
        
        // Check for color contrast (simplified version)
        this.checkColorContrast(nodes, issues);
        
        // Check for text size
        this.checkTextSize(nodes, issues);
        
        return issues;
    }
    
    private checkImageAltText(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find all image nodes
        const imageNodes = nodes.filter(node => 
            node.type === "image" || 
            node.name.toLowerCase().includes("image") || 
            node.name.toLowerCase().includes("img") ||
            node.name.toLowerCase().includes("picture"));
            
        if (imageNodes.length === 0) return;
        
        // Check each image for alt text
        imageNodes.forEach(imageNode => {
            // Check if alt text exists and is not empty
            if (!imageNode.alt && !imageNode.ariaLabel) {
                issues.push({
                    type: "error",
                    message: `Missing alt text for image "${imageNode.name}"`,
                    category: this.category,
                    element: imageNode.name,
                    elementId: imageNode.id,
                    recommendation: "Add descriptive alt text to all images for screen readers and better accessibility",
                    priority: "critical",
                    externalResourceLink: "https://web.dev/learn/accessibility/images/",
                    externalResourceTitle: "Web.dev: Images and accessibility"
                });
            } else if (imageNode.alt && (imageNode.alt === "image" || imageNode.alt.length < 5)) {
                issues.push({
                    type: "warning",
                    message: `Non-descriptive alt text "${imageNode.alt}" for image "${imageNode.name}"`,
                    category: this.category,
                    element: imageNode.name,
                    elementId: imageNode.id,
                    recommendation: "Use descriptive alt text that conveys the purpose and content of the image",
                    priority: "important",
                    externalResourceLink: "https://web.dev/learn/accessibility/images/",
                    externalResourceTitle: "Web.dev: Images and accessibility"
                });
            }
        });
        
        // Check for decorative images
        const decorativeImages = imageNodes.filter(node => 
            node.alt === "" || 
            node.name.toLowerCase().includes("decorative") ||
            node.name.toLowerCase().includes("background"));
            
        decorativeImages.forEach(imageNode => {
            if (imageNode.alt !== "") {
                issues.push({
                    type: "info",
                    message: `Decorative image "${imageNode.name}" should have empty alt text`,
                    category: this.category,
                    element: imageNode.name,
                    elementId: imageNode.id,
                    recommendation: 'For decorative images, use empty alt text (alt="") to hide them from screen readers',
                    priority: "nice-to-have",
                    externalResourceLink: "https://www.w3.org/WAI/tutorials/images/decorative/",
                    externalResourceTitle: "W3C: Decorative Images"
                });
            }
        });
    }
    
    private checkAriaAttributes(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for proper ARIA roles
        nodes.forEach(node => {
            if (node.role) {
                // Valid ARIA roles list (simplified)
                const validRoles = [
                    "button", "checkbox", "dialog", "gridcell", "link", "menuitem", 
                    "menuitemcheckbox", "menuitemradio", "option", "progressbar", 
                    "radio", "scrollbar", "searchbox", "slider", "spinbutton", 
                    "switch", "tab", "tabpanel", "textbox", "treeitem"
                ];
                
                if (!validRoles.includes(node.role.toLowerCase())) {
                    issues.push({
                        type: "warning",
                        message: `Potentially invalid ARIA role "${node.role}" on element "${node.name}"`,
                        category: this.category,
                        element: node.name,
                        elementId: node.id,
                        recommendation: "Use valid ARIA roles from the WAI-ARIA specification",
                        priority: "important",
                        externalResourceLink: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles",
                        externalResourceTitle: "MDN: ARIA Roles"
                    });
                }
            }
            
            // Check for interactive elements without accessible names
            const isInteractive = node.role === "button" || 
                node.role === "link" || 
                node.name.toLowerCase().includes("button") || 
                node.name.toLowerCase().includes("link");
                
            if (isInteractive && !node.ariaLabel && !node.text) {
                issues.push({
                    type: "error",
                    message: `Interactive element "${node.name}" has no accessible name`,
                    category: this.category,
                    element: node.name,
                    elementId: node.id,
                    recommendation: "Add text content or aria-label to all interactive elements",
                    priority: "critical",
                    externalResourceLink: "https://web.dev/learn/accessibility/aria-html/#accessible-names",
                    externalResourceTitle: "Web.dev: Accessible names"
                });
            }
        });
    }
    
    private checkFormAccessibility(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find all form elements
        const formNodes = nodes.filter(node => 
            node.name.toLowerCase().includes("form") || 
            node.role === "form");
            
        if (formNodes.length === 0) return;
        
        // Find all input elements
        const inputNodes = nodes.filter(node => 
            node.name.toLowerCase().includes("input") || 
            node.name.toLowerCase().includes("textfield") || 
            node.name.toLowerCase().includes("textarea") || 
            node.name.toLowerCase().includes("select") ||
            node.role === "textbox" ||
            node.role === "searchbox" ||
            node.role === "combobox");
            
        // Check if inputs have associated labels
        inputNodes.forEach(inputNode => {
            const hasAssociatedLabel = nodes.some(node => 
                node.name.toLowerCase().includes("label") && 
                node.name.toLowerCase().includes(inputNode.name.toLowerCase()));
                
            if (!hasAssociatedLabel && !inputNode.ariaLabel) {
                issues.push({
                    type: "error",
                    message: `Input "${inputNode.name}" has no associated label`,
                    category: this.category,
                    element: inputNode.name,
                    elementId: inputNode.id,
                    recommendation: "Associate a label with every form control or use aria-label",
                    priority: "critical",
                    externalResourceLink: "https://web.dev/learn/accessibility/forms/",
                    externalResourceTitle: "Web.dev: Accessible forms"
                });
            }
        });
        
        // Check for form validation guidance
        const hasErrorMessage = nodes.some(node => 
            node.name.toLowerCase().includes("error") || 
            node.name.toLowerCase().includes("validation") ||
            node.name.toLowerCase().includes("helper"));
            
        if (inputNodes.length > 0 && !hasErrorMessage) {
            issues.push({
                type: "warning",
                message: "Form may lack error validation messages",
                category: this.category,
                recommendation: "Include clear error messages and validation guidance for form inputs",
                priority: "important",
                externalResourceLink: "https://web.dev/learn/accessibility/forms/#error-reporting",
                externalResourceTitle: "Web.dev: Form error reporting"
            });
        }
    }
    
    private checkKeyboardNavigation(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Check for visible focus indicators
        const hasFocusStyles = nodes.some(node => 
            node.name.toLowerCase().includes("focus") || 
            (node.style && Object.keys(node.style).some(key => key.includes("focus"))));
            
        if (!hasFocusStyles) {
            issues.push({
                type: "warning",
                message: "No visible focus indicators detected",
                category: this.category,
                recommendation: "Add visible focus indicators for keyboard navigation",
                priority: "important",
                externalResourceLink: "https://web.dev/learn/accessibility/focus/",
                externalResourceTitle: "Web.dev: Focus"
            });
        }
        
        // Check for skip links
        const hasSkipLink = nodes.some(node => 
            node.name.toLowerCase().includes("skip") && 
            node.name.toLowerCase().includes("navigation"));
            
        if (!hasSkipLink) {
            issues.push({
                type: "info",
                message: "No skip navigation link detected",
                category: this.category,
                recommendation: "Add a 'Skip to main content' link at the beginning of the page for keyboard users",
                priority: "nice-to-have",
                externalResourceLink: "https://web.dev/learn/accessibility/focus/#skip-navigation",
                externalResourceTitle: "Web.dev: Skip navigation"
            });
        }
    }
    
    private checkColorContrast(nodes: FramerNode[], issues: SEOIssue[]): void {
        // This is a simplified version as we can't perform actual contrast calculations
        // without knowing the rendered colors
        
        // Look for text nodes with potentially low contrast
        const textNodes = nodes.filter(node => 
            node.type === "text" || 
            node.name.toLowerCase().includes("text") ||
            node.name.toLowerCase().includes("paragraph") ||
            node.name.toLowerCase().includes("heading"));
            
        let potentialContrastIssue = false;
        
        for (const textNode of textNodes) {
            if (textNode.style?.color && textNode.style?.backgroundColor) {
                // In a real implementation, we would calculate contrast ratio
                // For now, we'll just flag light colors on light backgrounds or dark on dark
                const color = textNode.style.color.toLowerCase();
                const backgroundColor = textNode.style.backgroundColor.toLowerCase();
                
                if ((color.includes("light") && backgroundColor.includes("light")) ||
                    (color.includes("white") && backgroundColor.includes("light")) ||
                    (color.includes("yellow") && backgroundColor.includes("white")) ||
                    (color.includes("dark") && backgroundColor.includes("dark")) ||
                    (color.includes("black") && backgroundColor.includes("dark"))) {
                    potentialContrastIssue = true;
                    issues.push({
                        type: "warning",
                        message: `Potential contrast issue in "${textNode.name}"`,
                        category: this.category,
                        element: textNode.name,
                        elementId: textNode.id,
                        recommendation: "Ensure text has sufficient contrast with its background (minimum ratio of 4.5:1)",
                        priority: "important",
                        externalResourceLink: "https://web.dev/learn/accessibility/color-contrast/",
                        externalResourceTitle: "Web.dev: Color and contrast"
                    });
                }
            }
        }
        
        if (!potentialContrastIssue) {
            // General check for contrast awareness
            issues.push({
                type: "info",
                message: "Verify color contrast in your design",
                category: this.category,
                recommendation: "Use a contrast checker tool to ensure all text meets WCAG standards (4.5:1 for normal text, 3:1 for large text)",
                priority: "important",
                externalResourceLink: "https://web.dev/learn/accessibility/color-contrast/",
                externalResourceTitle: "Web.dev: Color and contrast"
            });
        }
    }
    
    private checkTextSize(nodes: FramerNode[], issues: SEOIssue[]): void {
        // Find text nodes with small font sizes
        const smallTextNodes = nodes.filter(node => 
            node.style?.fontSize && node.style.fontSize < 12);
            
        if (smallTextNodes.length > 0) {
            issues.push({
                type: "warning",
                message: "Text size may be too small for some users",
                category: this.category,
                recommendation: "Use a minimum font size of 12px, preferably 16px for body text",
                priority: "important",
                externalResourceLink: "https://web.dev/learn/accessibility/typography/#font-size",
                externalResourceTitle: "Web.dev: Typography and accessibility"
            });
            
            // Highlight one example of small text
            if (smallTextNodes[0]) {
                issues.push({
                    type: "info",
                    message: `Small text found in "${smallTextNodes[0].name}" (${smallTextNodes[0].style?.fontSize}px)`,
                    category: this.category,
                    element: smallTextNodes[0].name,
                    elementId: smallTextNodes[0].id,
                    recommendation: "Increase font size for better readability",
                    priority: "nice-to-have"
                });
            }
        }
        
        // Check for text that doesn't use relative units
        // This is a placeholder as we can't actually check the unit type from style values
        issues.push({
            type: "info",
            message: "Consider using relative units for text sizing",
            category: this.category,
            recommendation: "Use relative units like rem or em instead of pixels to support user font size preferences",
            priority: "nice-to-have",
            externalResourceLink: "https://web.dev/learn/accessibility/typography/#responsive-typography",
            externalResourceTitle: "Web.dev: Responsive typography"
        });
    }
} 