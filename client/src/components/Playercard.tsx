const PlayerCard = () => {
    const player = {
        "firstname": "Kylian",
        "lastname": "Mbappe",
        "goals": 30,
        "photo": "https://media.api-sports.io/football/players/278.png",
        "team_logo": "https://media.api-sports.io/football/teams/85.png",
        "team_name": "Paris Saint Germain"
    }

    return (
        <div className="player-card">
            <img src={player.photo} className="player-photo" />
            <div className="player-container">
                <div className="player-name">{player.firstname} {player.lastname}</div>
                    <div className="team-info">
                        <img src={player.team_logo} className="team-logo"/>
                        <div className="team-name">
                            {player.team_name}
                        </div>
                    </div>
            </div>
        </div>
    )
}

export default PlayerCard