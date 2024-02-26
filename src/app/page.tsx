"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Spin, message } from "antd";
import { FC, useEffect, useState } from "react";
import { Candidate } from "./types/Candidate";
import candidateEndpoints from "./services/apiEndpoints/candidates";
import { MongoUpdateOneResponse } from "@/lib/collections/collections";
import { UpdateCandidateDto } from "./types/Dto/UpdateCandidateDto";
// @ts-ignore
import getBrowserFingerprint from "get-browser-fingerprint";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Participants } from "./components/organisms/participants/Participants";
import fingerprintEndpoints from "./services/apiEndpoints/fingerprints";
import {
  WhatsappShareButton,
  WhatsappIcon,
  FacebookShareButton,
  FacebookIcon,
  RedditShareButton,
  RedditIcon,
  TwitterShareButton,
  XIcon,
  TelegramShareButton,
  TelegramIcon,
} from "react-share";

type TooltipPayload = {
  name: string; // Assuming this is the candidate's name
  value: number; // Assuming this represents the number of votes
  payload: {
    // You can include more specific data here if needed
    name: string;
    votes: number;
  };
};

type CustomTooltipProps = {
  color?: string;
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
};

const Home: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [messageApi, contextHolder] = message.useMessage();
  const [fingerprint, setFingerprint] = useState<number>(0);

  const { getCandidates, updateCandidate } = candidateEndpoints();
  const { getFingerprint } = fingerprintEndpoints();

  const SHARE_TEXT =
    "Participa en la simulación de votacion de candidatos presidenciales 2024 🇵🇦";

  const handleModal = (id: string) => {
    setSelectedCandidate(id);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fingerprint = getBrowserFingerprint();
    setFingerprint(fingerprint);
  }, []);

  const fingerprintQuery = useQuery<number>({
    queryKey: ["fingerprint", fingerprint],
    enabled: !!fingerprint,
    queryFn: async () => {
      if (fingerprint) return await getFingerprint(fingerprint);
    },
  });

  const candidatesQuery = useQuery<Candidate[]>({
    queryKey: ["candidates"],
    queryFn: async () => getCandidates(),
  });

  const candidatesMutation = useMutation({
    mutationFn: async (payload: UpdateCandidateDto) =>
      await updateCandidate(payload),
  });

  const handleVote = async () => {
    if (!selectedCandidate) return;

    const payload = {
      _id: selectedCandidate,
      fingerprint: fingerprint,
    } satisfies UpdateCandidateDto;

    const response: MongoUpdateOneResponse =
      await candidatesMutation.mutateAsync(payload);

    if (response.result) {
      messageApi.open({
        type: "success",
        content: "Voto registrado exitosamente",
        duration: 2.5,
      });
      setIsModalOpen(false);
    } else {
      messageApi.open({
        type: "error",
        content: "Usted ya ha votado",
        duration: 2.5,
      });
      setIsModalOpen(false);
    }
  };

  const CustomTooltip: FC<CustomTooltipProps> = ({
    active,
    payload,
    label,
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg bg-white p-4 shadow-md text-sm">
          <p className=" text-gray-500">{label}</p>
          <p className="text-gray-400 font-bold">{`Votos: ${payload[0].value}`}</p>
          {/* Add more details from the payload if necessary */}
        </div>
      );
    }

    return null;
  };

  if (candidatesQuery.isLoading || fingerprintQuery.isLoading)
    return <Spin fullscreen size="large" />;

  return (
    <main className="flex md:m-auto p-4 md:max-w-[800px] md:justify-center">
      {contextHolder}
      {!fingerprintQuery.data ? (
        <Participants
          candidates={candidatesQuery.data || []}
          handleModal={handleModal}
          handleVote={handleVote}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <h1 className=" text-sky-900 font-bold text-xl text-center">
            🇵🇦 Gracias por participar. Diga no al clientelismo.
          </h1>
          <div className="flex flex-col gap-2">
            <p>Resultados de las elecciones simuladas:</p>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={
                  candidatesQuery.data?.map((c) => ({
                    name: c.name,
                    votes: c.votes,
                  })) || []
                }
                margin={{ left: -30 }} // Increase bottom margin
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-90}
                  textAnchor="end"
                  height={175}
                  tick={{ fontSize: 14 }}
                />{" "}
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="votes" fill="#8884d8">
                  {candidatesQuery.data?.map((_, index) => (
                    <Cell key={index} fill="#2AB3B0" />
                  )) || []}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className=" text-xs text-center">
              ¡Comparte la votacion con tus amigos para llegar a mas personas y
              tener resultados más reales!
            </p>
            <div className="flex gap-2 justify-center">
              <WhatsappShareButton
                title={SHARE_TEXT}
                url={window.location.href}
              >
                <WhatsappIcon size={32} round />
              </WhatsappShareButton>
              <FacebookShareButton
                title={SHARE_TEXT}
                url={window.location.href}
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <TwitterShareButton title={SHARE_TEXT} url={window.location.href}>
                <XIcon size={32} round />
              </TwitterShareButton>
              <RedditShareButton title={SHARE_TEXT} url={window.location.href}>
                <RedditIcon size={32} round />
              </RedditShareButton>
              <TelegramShareButton
                title={SHARE_TEXT}
                url={window.location.href}
              >
                <TelegramIcon size={32} round />
              </TelegramShareButton>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;
