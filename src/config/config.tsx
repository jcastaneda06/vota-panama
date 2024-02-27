const config = () => {
  const serverUrl = process.env.CONNECTION_STRING;
  const dbName = process.env.DB_NAME;
  const visitorApi = process.env.NEXT_PUBLIC_VISITOR_API;

  return {
    serverUrl,
    dbName,
    visitorApi,
  };
};

export default config;
