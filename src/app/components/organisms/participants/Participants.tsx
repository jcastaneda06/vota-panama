import { Avatar, Col, Modal, Row, Tooltip } from "antd";
import { FC } from "react";
import AvatarContainer from "../../atoms/avatarContainer/avatar-container";
import { Candidate } from "@/app/types/Candidate";
import { ExclamationCircleOutlined, OpenAIOutlined } from "@ant-design/icons";

type ParticipantsProps = {
  candidates: Candidate[];
  handleVote: () => void;
  isModalOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  setIsModalOpen: (value: boolean) => void;
  setSelectedCandidate: (value: string | null) => void;
};

export const Participants: FC<ParticipantsProps> = (props) => {
  const {
    candidates,
    handleVote,
    isModalOpen,
    setIsModalOpen,
    setSelectedCandidate,
  } = props;

  const handleModal = (candidateId: string) => {
    setSelectedCandidate(candidateId);
    setIsModalOpen(true);
  };

  return (
    <div className="flex  flex-col items-center gap-4 ">
      <h1 className=" text-sky-900 font-bold text-xl text-center">
        🇵🇦 Si las elecciones fueran hoy, ¿por quién votaría?
      </h1>
      <h2>Toque o haga click sobre su candidato de preferencia</h2>
      <Row gutter={16} className="text-center">
        {candidates.map((candidate: Candidate) => (
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
            <p className="text-sm text-start">
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
            <ExclamationCircleOutlined /> Confirmación
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
          Al votar por un candidato no podrá volver a realizar su voto. ¿Está
          seguro de que quiere continuar?
        </p>
      </Modal>
    </div>
  );
};
