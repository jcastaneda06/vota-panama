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

  const updateCandidate = async (candidate: UpdateCandidateDto) => {
    const body = {
      _id: candidate._id,
      fingerprint: candidate.fingerprint,
    };

    const response = await fetch("/api/candidates", {
      headers: headers,
      method: "PUT",
      body: JSON.stringify(body),
    });

    return response.json();
  };

  return {
    getCandidates,
    updateCandidate,
  };
}
