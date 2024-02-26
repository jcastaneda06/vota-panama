"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Avatar, Col, Modal, Row, Spin, Tooltip, message } from "antd";
import { FC, useState } from "react";
import { Candidate } from "./types/Candidate";
import AvatarContainer from "./components/atoms/avatarContainer/avatar-container";
import { ExclamationCircleOutlined, OpenAIOutlined } from "@ant-design/icons";
import candidateEndpoints from "./services/apiEndpoints/candidates";
import { MongoUpdateOneResponse } from "@/lib/collections/collections";
import { Bar } from "react-chartjs-2";
import { UpdateCandidateDto } from "./types/Dto/UpdateCandidateDto";
// @ts-ignore
import getBrowserFingerprint from "get-browser-fingerprint";

const Home: FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [messageApi, contextHolder] = message.useMessage();
  const { getCandidates, updateCandidate } = candidateEndpoints();

  const handleModal = (id: string) => {
    setSelectedCandidate(id);
    setIsModalOpen(true);
  };

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
      fingerprint: getBrowserFingerprint(),
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

  if (candidatesQuery.isLoading) return <Spin fullscreen size="large" />;

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 p-4">
      {contextHolder}
      <h1 className=" text-sky-900 font-bold text-xl text-center">
        🇵🇦 Si las elecciones fueran hoy, ¿por quién votaría?
      </h1>
      <h2>Toque o haga click sobre su candidato de preferencia</h2>
      <Row gutter={16} className="text-center">
        {candidatesQuery.data?.map((candidate: Candidate) => (
          <Col key={candidate._id} span={6} className="mb-4">
            <AvatarContainer onClick={() => handleModal(candidate._id)}>
              <Avatar src={candidate.src} size={64} />
            </AvatarContainer>
            <p className="text-sm">{candidate.name}</p>
          </Col>
        ))}
      </Row>
      <Tooltip title="Texto generado por Inteligencia Artificial" arrow>
        <div className="flex align-top justify-start gap-2">
          <OpenAIOutlined style={{ height: 16 }} />
          <div>
            <p className="text-sm">
              Votar por un candidato nuevo ofrece la posibilidad de innovación y
              cambio frente a la corrupción y los vicios del sistema
              establecido.
            </p>
          </div>
        </div>
      </Tooltip>
      <Modal
        title={
          <div>
            <ExclamationCircleOutlined /> Confirmacion
          </div>
        }
        open={isModalOpen}
        onOk={() => handleVote()}
        onCancel={() => setIsModalOpen(false)}
        okType="default"
        okText="Votar"
        cancelText="Cancelar"
      >
        <p>
          Al votar por un candidato no podra volver a relaizar su voto. ¿Está
          seguro de que quiere continuar?
        </p>
      </Modal>
    </main>
  );
};

export default Home;
