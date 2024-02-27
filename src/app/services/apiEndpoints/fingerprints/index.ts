import { UpdateCandidateDto } from "@/app/types/Dto/UpdateCandidateDto";

export default function fingerprintEndpoints() {
  const headers = {
    "Content-Type": "application/json",
  };

  const getFingerprint = async (dto: UpdateCandidateDto) => {
    return await fetch("/api/voted", {
      headers: headers,
      method: "POST",
      body: JSON.stringify(dto),
    }).then((response) => response.json());
  };

  return {
    getFingerprint,
  };
}
