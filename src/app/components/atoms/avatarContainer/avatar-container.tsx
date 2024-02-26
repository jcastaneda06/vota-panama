import { FC, PropsWithChildren } from "react";

type AvatarContainerProps = {
  onClick: () => void;
};

const AvatarContainer: FC<PropsWithChildren<AvatarContainerProps>> = (
  props
) => {
  const { children, onClick } = props;
  return <div onClick={onClick}>{children}</div>;
};

export default AvatarContainer;
