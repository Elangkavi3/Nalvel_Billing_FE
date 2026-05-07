export function getErrorMessage(error, fallback) {
  const serverData = error?.response?.data;
  const serverMessage =
    (typeof serverData === 'string' ? serverData : '') ||
    serverData?.message ||
    serverData?.error ||
    serverData?.details;

  if (serverMessage) return String(serverMessage);
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
