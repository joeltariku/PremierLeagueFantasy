export interface Player {
    name: string,
    stats: number,
    team_logo: string,
    team_name: string,
    rank: number,
    photo: string
}

interface Props {
  player: Player
}

const PlayerCard2: React.FC<Props> = ({ player }) => {

    return (
        <div className="playercard">
            <div className="playercard-rank">{player.rank}</div>
            <img src={player.team_logo} className="playercard-team-logo" />
            <div className="playercard-names-container">
                <div className="playercard-player-name">{player.name}</div>
                <div className="playercard-team-name">{player.team_name}</div>
            </div>
            <div className="playercard-stats">{player.stats}</div>
        </div>
    )
}

export default PlayerCard2