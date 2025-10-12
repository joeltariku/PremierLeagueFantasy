import { Lock } from "lucide-react";

interface Player {
    id: number;
    name: string;
    team: string;
    price: number;
    points: number;
    form: number[];
}


const FantasyPlayerCard: React.FC<{
    player: Player;
    position: string;
    isCaptain: boolean;
    isLocked?: boolean;
    setShowPlayerModal: (arg: boolean) => void;
    setCaptain: (arg: number) => void;
  }> = ({ player, isCaptain, isLocked, setShowPlayerModal, setCaptain}) => {
    if (!player) {
      return (
        <div
          onClick={() => !isLocked && setShowPlayerModal(true)}
          className="pcard-empty"
        >
          <div className="pcard-empty-avatar"><span>+</span></div>
          <span className="pcard-empty-text">Add Player</span>
        </div>
      );
    }

    const initials = player.name
      .split(' ')
      .map((n: string) => n[0])
      .join('');

    return (
      <div className="pcard-wrap">
        {isCaptain && (
          <div className="pcard-badge">C</div>
        )}
        {isLocked && (
          <div className="pcard-lock"><Lock size={12} /></div>
        )}
        <div
          onClick={() => !isLocked && setCaptain(player.id)}
          className={['pcard', isCaptain ? 'pcard--captain' : '', isLocked ? 'pcard--locked' : ''].join(' ')}
        >
          <div className="pcard-body">
            <div className="pcard-avatar">{initials}</div>
            <div className="pcard-info">
              <div className="pcard-name">{player.name}</div>
              <div className="pcard-team">{player.team}</div>
              <div className="pcard-row">
                <span className="pcard-price">£{player.price}m</span>
                <span className="pcard-pts">{player.points} pts</span>
              </div>
              <div className="pcard-form">
                {player.form.map((pts: number, i: number) => (
                  <div key={i} className="pcard-bar" style={{ height: Math.max(4, pts * 2) }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default FantasyPlayerCard