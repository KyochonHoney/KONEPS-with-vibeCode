import { useSearchParams } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';

// A custom hook to synchronize state with URL query parameters.
export function useQueryState<T>(
  key: string,
  defaultValue: T,
  parser: (val: string | null) => T = (val) => (val as T) ?? defaultValue,
  serializer: (val: T) => string = (val) => String(val)
) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [internalValue, setInternalValue] = useState<T>(() => {
    const paramValue = searchParams.get(key);
    return paramValue !== null ? parser(paramValue) : defaultValue;
  });

  // Update state if URL changes from outside (e.g., browser back/forward)
  useEffect(() => {
    const paramValue = searchParams.get(key);
    const valueFromParam = paramValue !== null ? parser(paramValue) : defaultValue;
    // This check prevents re-renders if the value is already what we expect
    if (serializer(valueFromParam) !== serializer(internalValue)) {
      setInternalValue(valueFromParam);
    }
  }, [searchParams, key, parser, serializer, defaultValue, internalValue]);

  const setQueryValue = useCallback(
    (newValue: T | ((prevState: T) => T)) => {
      const valueToSet = newValue instanceof Function ? newValue(internalValue) : newValue;
      
      // Update the component's internal state
      setInternalValue(valueToSet);

      // Update the URL search parameters
      const newSearchParams = new URLSearchParams(searchParams);
      const serializedValue = serializer(valueToSet);
      const serializedDefaultValue = serializer(defaultValue);

      // If the new value is the default value, remove it from the URL
      if (serializedValue === serializedDefaultValue || serializedValue === '') {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, serializedValue);
      }
      
      // Use replace to avoid adding to browser history
      setSearchParams(newSearchParams, { replace: true });
    },
    [key, defaultValue, serializer, searchParams, setSearchParams, internalValue]
  );

  return [internalValue, setQueryValue] as const;
}
