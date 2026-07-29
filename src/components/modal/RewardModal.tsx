import React from "react"; import { Modal } from "./Modal"; export const RewardModal: React.FC<{ isOpen: boolean }> = ({ isOpen }) => <Modal isOpen={isOpen}><h3>🎉 Claim Reward!</h3></Modal>;
