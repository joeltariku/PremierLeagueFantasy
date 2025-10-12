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
    player: Player | undefined;
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
          data-testid="empty-playercard"
        >
          <div className="pcard-empty-avatar" data-testid="empty-avatar"><span>+</span></div>
          <span className="pcard-empty-text">Add Player</span>
        </div>
      );
    }

    const initials = player.name
      .split(' ')
      .map((n: string) => n[0])
      .join('');

    return (
      <div className="pcard-wrap" data-testid="playercard-wrap">
        {isCaptain && (
          <div className="pcard-badge" data-testid="captain-icon">C</div>
        )}
        {isLocked && (
          <div className="pcard-lock" data-testid="lock-icon"><Lock size={12} /></div>
        )}
        <div
          onClick={() => !isLocked && setCaptain(player.id)}
          className={['pcard', isCaptain ? 'pcard--captain' : '', isLocked ? 'pcard--locked' : ''].join(' ')}
          data-testid="playercard"
        >
          <div className="pcard-body" data-testid="playercard-body">
            <div className="pcard-avatar" data-testid="playercard-avatar">{initials}</div>
            <div className="pcard-info" data-testid="playercard-info">
              <div className="pcard-name" data-testid="playercard-name">{player.name}</div>
              <div className="pcard-team" data-testid="playercard-team">{player.team}</div>
              <div className="pcard-row" data-testid="playercard-row">
                <span className="pcard-price" data-testid="playercard-price">£{player.price}m</span>
                <span className="pcard-pts" data-testid="playercard-pts">{player.points} pts</span>
              </div>
              <div className="pcard-form" data-testid="playercard-form">
                {player.form.map((pts: number, i: number) => (
                  <div key={i} className="pcard-bar" data-testid="playercard-bar" style={{ height: Math.max(4, pts * 2) }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default FantasyPlayerCard