// Production-ready implementation of class-variance-authority
// This will be mapped directly in the import map

export function cva(base, config) {
  return function(props) {
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

export function cx(...args) {
  return args.filter(Boolean).join(' ');
}

// Export VariantProps for TypeScript compatibility
export const VariantProps = function() {
  return {};
};

// Default export
export default { cva, cx, VariantProps }; 