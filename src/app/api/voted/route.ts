import { UpdateCandidateDto } from "@/app/types/Dto/UpdateCandidateDto";
import { Fingerprint } from "@/app/types/Fingerprint";
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
    .collection<Fingerprint>(Collections.FINGERPRINTS)
    .findOne<Fingerprint>({
      $and: [{ fingerprint: dto.fingerprint }, { ipAddress: dto.ipAddress }],
    });

  if (response) return new Response(JSON.stringify(true));
  return new Response(JSON.stringify(false));
}
