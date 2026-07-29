import React from "react"; import { Modal } from "./Modal"; export const PurchaseModal: React.FC<{ isOpen: boolean }> = ({ isOpen }) => <Modal isOpen={isOpen}><h3>Store Purchase</h3></Modal>;
