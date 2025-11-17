import { X } from "lucide-react";
import { useState } from "react";
import type { Team } from "../pages/FantasyPLUI";

const PlayerModal: React.FC<{
    setShowPlayerModal: (arg: boolean) => void;
    setTeam: (team: Team) => void;
    team: Team;
}> = ({ setShowPlayerModal, setTeam, team }) => {
    const [filter, setFilter] = useState<'ALL' | 'GK' | 'DEF' | 'MID' | 'ATT'>('ALL');

    const availablePlayers = [
        { id: 10, name: 'Ederson', team: 'MCI', price: 5.0, points: 43, pos: 'GK', form: [2, 6, 1, 2, 6] },
        { id: 11, name: 'Ramsdale', team: 'ARS', price: 4.5, points: 38, pos: 'GK', form: [1, 2, 2, 6, 3] },
        { id: 20, name: 'Van Dijk', team: 'LIV', price: 6.5, points: 58, pos: 'DEF', form: [6, 8, 2, 6, 6] },
        { id: 21, name: 'Walker', team: 'MCI', price: 5.5, points: 47, pos: 'DEF', form: [2, 6, 6, 1, 2] },
        { id: 30, name: 'De Bruyne', team: 'MCI', price: 12.0, points: 92, pos: 'MID', form: [11, 2, 8, 13, 5] },
        { id: 31, name: 'Salah', team: 'LIV', price: 13.0, points: 126, pos: 'MID', form: [15, 8, 11, 6, 13] },
        { id: 40, name: 'Kane', team: 'BAY', price: 11.0, points: 103, pos: 'ATT', form: [8, 11, 6, 5, 12] },
        { id: 41, name: 'Isak', team: 'NEW', price: 8.5, points: 76, pos: 'ATT', form: [6, 2, 8, 11, 5] },
    ];

    return (
        <div className="modal-overlay">
        <div className="modal">
            <div className="modal-header">
            <h3>Select Player</h3>
            <button className="icon-btn" onClick={() => setShowPlayerModal(false)}>
                <X size={20} />
            </button>
            </div>

            <div className="modal-tabs">
            {(['ALL', 'GK', 'DEF', 'MID', 'ATT'] as const).map((pos) => (
                <button
                key={pos}
                onClick={() => setFilter(pos)}
                className={[
                    'tab',
                    filter === pos ? 'tab--active' : '',
                ].join(' ')}
                >
                {pos}
                </button>
            ))}
            </div>

            <div className="modal-list">
            {availablePlayers
                .filter((p) => filter === 'ALL' || p.pos === filter)
                .map((player) => (
                <div
                    key={player.id}
                    onClick={() => {
                    setTeam({ ...team, gk: player });
                    setShowPlayerModal(false);
                    }}
                    className="player-row"
                >
                    <div className="player-row-avatar">{player.name.split(' ').map((n) => n[0]).join('')}</div>
                    <div className="player-row-main">
                    <div className="player-row-name">{player.name}</div>
                    <div className="player-row-sub">{player.team} • {player.pos}</div>
                    </div>
                    <div className="player-row-right">
                    <div className="player-row-price">£{player.price}m</div>
                    <div className="player-row-pts">{player.points} pts</div>
                    </div>
                </div>
                ))}
            </div>
        </div>
        </div>
    );
};

export default PlayerModal