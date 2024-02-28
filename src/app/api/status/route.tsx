import config from "@/config/config";

export async function GET() {
  const { outOfService } = config();

  return new Response(JSON.stringify({ result: outOfService }));
}
