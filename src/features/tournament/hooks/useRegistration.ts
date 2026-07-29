import { useRegistrationStore } from '../store/registration.store';
import { RegistrationService } from '../services/RegistrationService';

export const useRegistration = () => {
  const registeredTournamentIds = useRegistrationStore((s) => s.registeredTournamentIds);

  const isRegistered = (id: string) => registeredTournamentIds.includes(id);

  return {
    registeredTournamentIds,
    isRegistered,
    joinTournament: RegistrationService.joinTournament,
    leaveTournament: RegistrationService.leaveTournament,
  };
};
export default useRegistration;
