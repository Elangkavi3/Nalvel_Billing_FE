export function getErrorMessage(error, fallback) {
  const serverData = error?.response?.data;
  const status = error?.response?.status;
  const statusText = error?.response?.statusText;
  const serverMessage =
    (typeof serverData === 'string' ? serverData : '') ||
    serverData?.message ||
    serverData?.error ||
    serverData?.details;

  if (serverMessage) return String(serverMessage);
  if (status) {
    return `${fallback} (HTTP ${status}${statusText ? ` ${statusText}` : ''})`;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
