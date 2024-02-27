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
import config from "@/config/config";
import { Visitor } from "./types/Visitor";
import { UserOutlined } from "@ant-design/icons";

const VisitorApi = require("visitorapi");

type TooltipPayload = {
  name: string;
  value: number;
  payload: {
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
  const { visitorApi } = config();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [messageApi, contextHolder] = message.useMessage();
  const [fingerprint, setFingerprint] = useState<number>(0);
  const [ipAddress, setIpAddress] = useState<string>("");
  const [reducedVotes, setReducedVotes] = useState<number>(0);

  const { getCandidates, updateCandidate } = candidateEndpoints();
  const { getFingerprint } = fingerprintEndpoints();

  const SHARE_TEXT =
    "Participa en la simulación de votacion de candidatos presidenciales 2024 🇵🇦";

  useEffect(() => {
    const fingerprint = getBrowserFingerprint();
    setFingerprint(fingerprint);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    VisitorApi(visitorApi, (data: Visitor) => {
      setIpAddress(data.ipAddress);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const hasVotedQuery = useQuery<number>({
    queryKey: ["hasVoted", fingerprint, ipAddress],
    queryFn: async () => {
      if (fingerprint) return await getFingerprint({ fingerprint });
    },
  });

  const candidatesQuery = useQuery<Candidate[]>({
    queryKey: ["candidates"],
    queryFn: async () => getCandidates(),
    refetchOnWindowFocus: false,
  });

  const candidatesMutation = useMutation({
    mutationFn: async (payload: UpdateCandidateDto) =>
      await updateCandidate(payload),
  });

  useEffect(() => {
    if (candidatesQuery.data) {
      const reducedVotes = candidatesQuery.data.reduce(
        (acc, curr) => acc + curr.votes,
        0
      );
      setReducedVotes(reducedVotes);
    }
  }, [candidatesQuery.data]);

  const handleVote = async () => {
    if (!selectedCandidate) return;

    const payload = {
      candidateId: selectedCandidate,
      fingerprint: fingerprint,
    } satisfies UpdateCandidateDto;

    const response: MongoUpdateOneResponse =
      await candidatesMutation.mutateAsync(payload);

    if (response.result) {
      messageApi
        .open({
          type: "success",
          content: "Voto registrado exitosamente",
          duration: 2.5,
        })
        .then(() => {
          hasVotedQuery.refetch();
          candidatesQuery.refetch();
        });
    } else {
      messageApi.open({
        type: "error",
        content: "Usted ya ha votado",
        duration: 2.5,
      });
    }
    setIsModalOpen(false);
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

  if (
    candidatesQuery.isLoading ||
    hasVotedQuery.isLoading ||
    hasVotedQuery.isRefetching
  )
    return <Spin fullscreen size="large" />;

  return (
    <main className="flex flex-col md:m-auto gap-4 p-4 md:max-w-[800px] h-full overflow-auto">
      {contextHolder}
      {!hasVotedQuery.data ? (
        <Participants
          candidates={candidatesQuery.data || []}
          setSelectedCandidate={setSelectedCandidate}
          handleVote={handleVote}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      ) : (
        <div className="flex flex-col gap-4 flex-1">
          <h1 className=" text-sky-900 font-bold text-xl text-center">
            🇵🇦 Gracias por participar. Diga no al clientelismo.
          </h1>
          <div className="flex flex-col gap-2">
            <div className="flex-1">
              <p className="text-gray-500">
                Resultados de las elecciones simuladas:
              </p>
              <ResponsiveContainer height={400}>
                <BarChart
                  data={
                    candidatesQuery.data?.map((c) => ({
                      name: c.name,
                      votes: c.votes,
                    })) || []
                  }
                  margin={{ left: -30, bottom: -40 }}
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
                  <Bar dataKey="votes">
                    {candidatesQuery.data?.map((c, index) => (
                      <Cell key={index} fill={c.color} />
                    )) || []}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sky-900 flex text-center justify-center gap-2">
              <UserOutlined />
              {reducedVotes}
            </div>
            <div className="flex-1">
              <p className="text-center text-lg font-bold mb-2 text-gray-500">
                ¡Ayudanos a llegar a mas personas! 🙂
              </p>
              <p className=" text-xs text-center mb-4 text-gray-500">
                ¡Comparte la votacion con tus amigos para llegar a mas personas
                y tener resultados más reales!
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
                <TwitterShareButton
                  title={SHARE_TEXT}
                  url={window.location.href}
                >
                  <XIcon size={32} round />
                </TwitterShareButton>
                <RedditShareButton
                  title={SHARE_TEXT}
                  url={window.location.href}
                >
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
        </div>
      )}
      <div className="flex text-center justify-center items-center gap-1 text-sm text-sky-900 mb-4">
        Developed by
        <a
          className="border px-2 py-1 rounded border-sky-900 hover:bg-sky-900 hover:text-white transition-all duration-300 ease-in-out"
          href="https://www.instagram.com/gsus6_/"
          target="_blank"
          rel="noopener noreferrer"
        >
          {" "}
          @gsus6_
        </a>
      </div>
    </main>
  );
};

export default Home;
