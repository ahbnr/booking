export {};

declare global {
  interface Map<K, V> {
    getOrDefault(key: K, defaultValue: V): V;
  }
}

// eslint-disable-next-line no-extend-native
Map.prototype.getOrDefault = function <K, V>(key: K, defaultValue: V): V {
  const maybeValue = this.get(key);

  if (maybeValue != null) {
    return maybeValue;
  } else {
    return defaultValue;
  }
};
