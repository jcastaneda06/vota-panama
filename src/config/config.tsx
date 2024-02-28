const config = () => {
  const serverUrl = process.env.CONNECTION_STRING;
  const dbName = process.env.DB_NAME;
  const visitorApi = process.env.NEXT_PUBLIC_VISITOR_API;
  const outOfService = process.env.OUT_OF_SERVICE === "true";

  return {
    serverUrl,
    dbName,
    visitorApi,
    outOfService,
  };
};

export default config;
