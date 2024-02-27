import { UpdateCandidateDto } from "@/app/types/Dto/UpdateCandidateDto";
import { Collections } from "@/lib/collections/collections";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: Request) {
  const { db } = await connectToDatabase();

  if (!req.body) {
    return new Response(
      JSON.stringify({ error: "Invalid request", req: req.json() })
    );
  }

  const dto: UpdateCandidateDto = await req.json();

  const response = await db
    .collection(Collections.FINGERPRINTS)
    .findOne({ fingerprint: dto.fingerprint });

  if (response) return new Response(JSON.stringify(true));
  return new Response(JSON.stringify(false));
}
