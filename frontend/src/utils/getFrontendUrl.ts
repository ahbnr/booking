export default function getFrontendUrl(): string {
  if (process.env.PUBLIC_URL != null && process.env.PUBLIC_URL !== '') {
    return process.env.PUBLIC_URL;
  } else {
    return `${window.location.protocol}//${window.location.host}`;
  }
}
