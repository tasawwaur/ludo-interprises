import React, { useState } from 'react';
import TournamentHomePage from './TournamentHomePage';
import RegistrationPage from './RegistrationPage';
import TournamentDetailsPage from './TournamentDetailsPage';
import BracketPage from './BracketPage';
import LeaderboardPage from './LeaderboardPage';
import RewardsPage from './RewardsPage';
import ResultPage from './ResultPage';
import { TournamentItem } from '../types/tournament.types';
import { useTournament } from '../hooks/useTournament';
import { useRegistration } from '../hooks/useRegistration';

interface TournamentPageProps {
  onBack?: () => void;
  onJoinMatch?: (mode: string) => void;
}

type TournamentSubView =
  | 'HOME'
  | 'REGISTRATION'
  | 'DETAILS'
  | 'BRACKET'
  | 'LEADERBOARD'
  | 'REWARDS'
  | 'RESULT';

export const TournamentPage: React.FC<TournamentPageProps> = ({ onBack, onJoinMatch }) => {
  const [currentView, setCurrentView] = useState<TournamentSubView>('HOME');
  const [selectedTour, setSelectedTour] = useState<TournamentItem | null>(null);

  const { tournaments } = useTournament();
  const { joinTournament, isRegistered } = useRegistration();

  const handleSelectTournament = (id: string) => {
    const tour = tournaments.find((t) => t.id === id);
    if (tour) {
      setSelectedTour(tour);
      if (isRegistered(id)) {
        setCurrentView('DETAILS');
      } else {
        setCurrentView('REGISTRATION');
      }
    }
  };

  const handleJoinTournament = async (id: string) => {
    const success = await joinTournament(id);
    if (success) {
      const tour = tournaments.find((t) => t.id === id);
      if (tour) {
        setSelectedTour(tour);
        setCurrentView('DETAILS');
      }
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'HOME':
        return (
          <TournamentHomePage
            onBack={onBack}
            onSelectTournament={handleSelectTournament}
            onJoinTournament={handleJoinTournament}
          />
        );

      case 'REGISTRATION':
        if (!selectedTour) return null;
        return (
          <RegistrationPage
            tournament={selectedTour}
            onBack={() => setCurrentView('HOME')}
            onRegisterSuccess={() => handleJoinTournament(selectedTour.id)}
          />
        );

      case 'DETAILS':
        if (!selectedTour) return null;
        return (
          <TournamentDetailsPage
            tournament={selectedTour}
            onBack={() => setCurrentView('HOME')}
            onJoin={() => setCurrentView('REGISTRATION')}
            onViewBracket={() => setCurrentView('BRACKET')}
          />
        );

      case 'BRACKET':
        return (
          <BracketPage
            onBack={() => setCurrentView('DETAILS')}
            onFinishedTournament={() => setCurrentView('RESULT')}
            onJoinMatch={onJoinMatch}
          />
        );

      case 'LEADERBOARD':
        if (!selectedTour) return null;
        return (
          <LeaderboardPage
            tournamentId={selectedTour.id}
            onBack={() => setCurrentView('DETAILS')}
          />
        );

      case 'REWARDS':
        if (!selectedTour) return null;
        return (
          <RewardsPage
            tournamentId={selectedTour.id}
            onBack={() => setCurrentView('DETAILS')}
          />
        );

      case 'RESULT':
        return <ResultPage onBack={() => setCurrentView('HOME')} />;

      default:
        return null;
    }
  };

  return <div className="w-full h-full">{renderView()}</div>;
};
export default TournamentPage;
