import { Star } from "lucide-react";
import FantasyPlayerCard from "../components/FantasyPlayerCard";
import type { Team } from "../pages/FantasyPLUI";

const TeamScreen: React.FC<{
    team: Team;
    budget: number;
    spent: number;
    remaining: number;
    captain: number;
    setShowPlayerModal: (arg: boolean) => void;
    setCaptain: (arg: number) => void;
}> = ({ team, budget, spent, remaining, captain, setShowPlayerModal, setCaptain }) => {
    const isLocked = false;

    return (
      <div className="container-narrow">
        <div className="hero" data-testid="hero">
          <div className="hero-top">
            <div>
              <div className="hero-sub">Gameweek 15</div>
              <div className="hero-title">My Team</div>
            </div>
            <div className="hero-deadline">
              <div className="hero-sub">Deadline</div>
              <div className="hero-deadline-time">2h 34m</div>
            </div>
          </div>

          <div className="hero-grid">
            <div>
              <div className="hero-sub">Budget</div>
              <div className="hero-val">£{budget.toFixed(1)}m</div>
            </div>
            <div>
              <div className="hero-sub">Remaining</div>
              <div className="hero-val hero-val--green">£{remaining.toFixed(1)}m</div>
            </div>
            <div>
              <div className="hero-sub">GW Points</div>
              <div className="hero-val">0</div>
            </div>
          </div>

          <div className="progress">
            <div className="progress-bar" style={{ width: `${(spent / budget) * 100}%` }} />
          </div>
        </div>

        <div className="pitch">
          <div className="pitch-lines">
            <div className="pitch-line-mid" />
            <div className="pitch-circle" />
          </div>

          <div className="pitch-content">
            <div className="pitch-row center">
              <FantasyPlayerCard player={team.gk} position="GK" isCaptain={captain === team.gk?.id} isLocked={isLocked} setShowPlayerModal={setShowPlayerModal} setCaptain={setCaptain}/>
            </div>

            <div className="pitch-row gap">
                <FantasyPlayerCard player={team.def1} position="DEF" isCaptain={captain === team.def1?.id} isLocked={isLocked} setShowPlayerModal={setShowPlayerModal} setCaptain={setCaptain}/>
                <FantasyPlayerCard player={team.mid1} position="MID" isCaptain={captain === team.mid1?.id} isLocked={isLocked} setShowPlayerModal={setShowPlayerModal} setCaptain={setCaptain}/>
            </div>

            <div className="pitch-row gap">
                <FantasyPlayerCard player={team.att1} position="ATT" isCaptain={captain === team.att1?.id} isLocked={isLocked} setShowPlayerModal={setShowPlayerModal} setCaptain={setCaptain}/>
                <FantasyPlayerCard player={team.att2} position="ATT" isCaptain={captain === team.att2?.id} isLocked={isLocked} setShowPlayerModal={setShowPlayerModal} setCaptain={setCaptain} />
            </div>
          </div>
        </div>

        <div className="actions">
          <button className="btn btn-primary" onClick={() => setShowPlayerModal(true)}>Pick Team</button>
          <button className="btn btn-outline">Auto Pick</button>
        </div>

        <div className="caption">
          <Star size={16} className="caption-icon" />
          Tap a player to make them captain (2× points)
        </div>
      </div>
    );
  };

export default TeamScreen