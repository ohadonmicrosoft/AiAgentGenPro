// Local implementation of class-variance-authority
// This is a simplified version that provides the basic functionality

export function cva(base: string, config?: any) {
  return function(props?: Record<string, any>) {
    if (!props) return base || '';
    
    let className = base || '';
    const { variants, defaultVariants } = config || {};
    
    if (variants && (props || defaultVariants)) {
      // Apply variants from props
      Object.keys(variants).forEach(variantName => {
        const variantValue = props[variantName] || defaultVariants?.[variantName];
        if (variantValue && variants[variantName] && variants[variantName][variantValue]) {
          className += ' ' + variants[variantName][variantValue];
        }
      });
    }
    
    // Add any additional className from props
    if (props.className) {
      className += ' ' + props.className;
    }
    
    return className.trim();
  };
}

export function cx(...args: any[]) {
  return args.filter(Boolean).join(' ');
}

// Types for TypeScript compatibility
export interface VariantProps<T extends (...args: any) => any> {
  [key: string]: any;
}

export default { cva, cx }; 