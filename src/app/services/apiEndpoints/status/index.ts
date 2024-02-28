export default function statusEndpoints() {
  const headers = {
    "Content-Type": "application/json",
  };

  const getServerStatus = async () => {
    return await fetch("/api/status", { headers: headers }).then((response) =>
      response.json()
    );
  };

  return {
    getServerStatus,
  };
}
