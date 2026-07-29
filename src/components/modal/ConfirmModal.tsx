import React from "react"; import { Modal } from "./Modal"; export const ConfirmModal: React.FC<{ isOpen: boolean }> = ({ isOpen }) => <Modal isOpen={isOpen}><h3>Confirm Action</h3></Modal>;
