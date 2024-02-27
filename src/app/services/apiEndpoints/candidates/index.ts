import { UpdateCandidateDto } from "@/app/types/Dto/UpdateCandidateDto";

export default function candidateEndpoints() {
  const headers = {
    "Content-Type": "application/json",
  };

  const getCandidates = async () => {
    const response = await fetch("/api/candidates", {
      headers: headers,
      method: "GET",
    });

    return response.json();
  };

  const updateCandidate = async (dto: UpdateCandidateDto) => {
    const response = await fetch("/api/candidates", {
      headers: headers,
      method: "PUT",
      body: JSON.stringify(dto),
    });

    return response.json();
  };

  return {
    getCandidates,
    updateCandidate,
  };
}
