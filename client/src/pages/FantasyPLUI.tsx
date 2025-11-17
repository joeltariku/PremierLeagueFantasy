import React, { useState } from 'react';
import { Users, TrendingUp, Trophy, Menu } from 'lucide-react';
import '../FantasyPLUI.css';
import TeamScreen from '../screens/TeamScreen';
import PointsScreen from '../screens/PointsScreen';
import PlayerModal from '../screens/PlayerModal';

interface Player {
    id: number;
    name: string;
    team: string;
    price: number;
    points: number;
    form: number[];
}

export interface Team {
    gk: Player | undefined;
    def1: Player | undefined;
    mid1: Player | undefined;
    att1: Player | undefined;
    att2: Player | undefined;
}

const FantasyPLUI: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<'team' | 'points'>('team');
  const [captain, setCaptain] = useState<number>(2);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  const [team, setTeam] = useState<Team>({
    // gk: { id: 1, name: 'Alisson', team: 'LIV', price: 5.5, points: 45, form: [3, 2, 6, 1, 2] },
    // def1: { id: 2, name: 'Saliba', team: 'ARS', price: 5.0, points: 52, form: [6, 6, 2, 6, 1] },
    // mid1: { id: 3, name: 'Saka', team: 'ARS', price: 9.0, points: 78, form: [8, 5, 2, 9, 12] },
    // att1: { id: 4, name: 'Haaland', team: 'MCI', price: 14.0, points: 134, form: [13, 2, 18, 11, 8] },
    // att2: { id: 5, name: 'Watkins', team: 'AVL', price: 9.0, points: 89, form: [5, 8, 2, 11, 6] },
    gk: undefined,
    def1: undefined,
    mid1: undefined,
    att1: undefined,
    att2: undefined
  });

  const budget = 50.0;
  const spent = Object.values(team).reduce((sum: number, p: Player) => sum + (p?.price || 0), 0);
  const remaining = budget - spent;

  return (
    <div className="app">
      <div className="topnav">
        <div className="topnav-inner">
          <div className="brand">
            <div className="brand-logo"><Trophy size={20} /></div>
            <div>
              <div className="brand-title">Fantasy PL</div>
              <div className="brand-sub">Gameweek 15</div>
            </div>
          </div>

          <div className="nav-actions">
            <button
              onClick={() => setActiveScreen('team')}
              className={[
                'nav-link',
                activeScreen === 'team' ? 'nav-link--active' : '',
              ].join(' ')}
            >
              My Team
            </button>
            <button
              onClick={() => setActiveScreen('points')}
              className={[
                'nav-link',
                activeScreen === 'points' ? 'nav-link--active' : '',
              ].join(' ')}
            >
              Points
            </button>
            <button className="nav-link">Stats</button>
          </div>

          <button className="icon-btn md-hide"><Menu size={22} /></button>
        </div>
      </div>

      <div className="main">
        {activeScreen === 'team' && <TeamScreen team={team} budget={budget} spent={spent} remaining={remaining} captain={captain} setShowPlayerModal={setShowPlayerModal} setCaptain={setCaptain}/>}
        {activeScreen === 'points' && <PointsScreen />}
      </div>

      <div className="bottomnav md-hide">
        <button
          onClick={() => setActiveScreen('team')}
          className={['bottomnav-btn', activeScreen === 'team' ? 'active' : ''].join(' ')}
        >
          <Users size={22} />
          <span>Team</span>
        </button>
        <button
          onClick={() => setActiveScreen('points')}
          className={['bottomnav-btn', activeScreen === 'points' ? 'active' : ''].join(' ')}
        >
          <TrendingUp size={22} />
          <span>Points</span>
        </button>
        <button className="bottomnav-btn">
          <Trophy size={22} />
          <span>Leagues</span>
        </button>
      </div>

      {showPlayerModal && <PlayerModal setShowPlayerModal={setShowPlayerModal} setTeam={setTeam} team={team}  />}
    </div>
  );
};

export default FantasyPLUI;