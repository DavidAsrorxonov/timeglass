export function useLocalStorage<T>(key: string, initialValue: T) {
  const setStoredValue = (value: T) => {
    void key;
    void value;
  };

  return [initialValue, setStoredValue] as const;
}
