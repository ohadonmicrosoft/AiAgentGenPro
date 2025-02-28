// Simple shim for class-variance-authority
export function cva(base, variants) {
  return function(props) {
    let className = base || '';
    if (variants && props) {
      Object.keys(variants).forEach(key => {
        if (props[key] && variants[key] && variants[key][props[key]]) {
          className += ' ' + variants[key][props[key]];
        }
      });
    }
    return className;
  };
}

export function cx() {
  return Array.from(arguments).filter(Boolean).join(' ');
}

// Default export for ES modules
export default { cva, cx }; 