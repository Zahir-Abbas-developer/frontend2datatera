import { toast } from 'react-toastify';

export default function catchAsync(fn) {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (err) {
      console.log('Error', err);

      // Better error message handling
      let errorMessage = 'An error occurred';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      // Show toast with error message
      toast.error(errorMessage);

      // Return a default value (empty object) instead of undefined
      return {};
    }
  };
}
