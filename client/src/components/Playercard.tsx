export interface Player {
    name: string,
    goals: number,
    photo: string,
    team_logo: string,
    team_name: string,
    //id: string,
}

interface Props {
  player: Player
}

const PlayerCard: React.FC<Props> = ({ player }) => {

    return (
        <div className="player-card">
            <img src={player.photo} className="player-photo" />
            <div className="player-container">
                <div className="player-name">{player.name}</div>
                    <div className="team-info">
                        <img src={player.team_logo} className="team-logo" loading="lazy"/>
                        <div className="team-name">
                            {player.team_name}
                        </div>
                    </div>
            </div>
        </div>
    )
}

export default PlayerCard