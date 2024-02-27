import { Candidate } from "@/app/types/Candidate";
import { connectToDatabase } from "../../../lib/mongodb";
import { NextResponse } from "next/server";
import { Collections } from "@/lib/collections/collections";
import { ObjectId, WithId } from "mongodb";
import { UpdateCandidateDto } from "@/app/types/Dto/UpdateCandidateDto";

export async function GET() {
  const { db } = await connectToDatabase();
  var response = await db
    .collection<Candidate>(Collections.CANDIDATES)
    .find()
    .toArray();
  return NextResponse.json<WithId<Candidate>[]>(response);
}

export async function PUT(req: Request) {
  if (!req.body) {
    return new Response(JSON.stringify({ error: "Invalid request" }));
  }

  const { db } = await connectToDatabase();
  const fingerprint: UpdateCandidateDto = await req.json();

  try {
    const exists = await db.collection(Collections.FINGERPRINTS).findOne({
      $or: [
        { fingerprint: fingerprint.fingerprint },
        { ipAddress: fingerprint.ipAddress },
        { location: fingerprint.location },
      ],
    });

    if (exists) {
      return new Response(JSON.stringify({ result: false }));
    }

    const addFingerprint = await db
      .collection(Collections.FINGERPRINTS)
      .insertOne({
        fingerprint: fingerprint.fingerprint,
        ipAddress: fingerprint.ipAddress,
        location: fingerprint.location,
      });

    const updateResult = await db
      .collection<Candidate>(Collections.CANDIDATES)
      .updateOne(
        // @ts-ignore
        { _id: new ObjectId(fingerprint.candidateId) },
        { $inc: { votes: 1 } }
      );

    // get the updated document
    if (addFingerprint.insertedId && updateResult.modifiedCount >= 1)
      return new Response(JSON.stringify({ result: true }));

    return new Response(JSON.stringify({ result: false }));
  } catch (error) {
    console.error(error);
    throw new Response(JSON.stringify({ error: "Database operation failed" }));
  }
}
