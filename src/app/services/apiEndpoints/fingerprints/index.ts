export default function fingerprintEndpoints() {
  const headers = {
    "Content-Type": "application/json",
  };

  const getFingerprint = async (fingerprint: number) => {
    return await fetch("/api/fingerprints", {
      headers: headers,
      method: "POST",
      body: JSON.stringify({ fingerprint: fingerprint }),
    }).then((response) => response.json());
  };

  return {
    getFingerprint,
  };
}
