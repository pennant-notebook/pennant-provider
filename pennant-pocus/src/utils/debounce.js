export function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
      const context = this;

      const later = () => {
          timeout = null;
          func.apply(context, args);
      };

      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
  };
};
