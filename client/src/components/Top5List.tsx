import PlayerCard2 from "./Playercard2";

export const Top5List = () => {
    const players = [
        {
            "name": "Kylian Mbappe",
            "stats": 30,
            "photo": "https://media.api-sports.io/football/players/278.png",
            "team_logo": "https://media.api-sports.io/football/teams/85.png",
            "team_name": "Paris Saint Germain",
            "rank": 1
        }, 
        {
            "name": "Kylian Mbappe",
            "stats": 30,
            "photo": "https://media.api-sports.io/football/players/278.png",
            "team_logo": "https://media.api-sports.io/football/teams/85.png",
            "team_name": "Paris Saint Germain",
            "rank": 2
        },
        {
            "name": "Kylian Mbappe",
            "stats": 30,
            "photo": "https://media.api-sports.io/football/players/278.png",
            "team_logo": "https://media.api-sports.io/football/teams/85.png",
            "team_name": "Paris Saint Germain",
            "rank": 3
        },
        {
            "name": "Kylian Mbappe",
            "stats": 30,
            "photo": "https://media.api-sports.io/football/players/278.png",
            "team_logo": "https://media.api-sports.io/football/teams/85.png",
            "team_name": "Paris Saint Germain",
            "rank": 4
        },
        {
            "name": "Kylian Mbappe",
            "stats": 30,
            "photo": "https://media.api-sports.io/football/players/278.png",
            "team_logo": "https://media.api-sports.io/football/teams/85.png",
            "team_name": "Paris Saint Germain",
            "rank": 5
        }
    ];
    return (
        <div className="top5-outer">
            <h2>Goals</h2>
            <div className="top5">
                {players.map((player, ind) => (
                    <PlayerCard2 key={ind} player={player} />
                ))}
            </div>
        </div>
    )
}
