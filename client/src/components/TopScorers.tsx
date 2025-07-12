import { useEffect, useState } from "react";
import PlayerCard, { type Player } from "./Playercard";
import playerService from '../services/getPlayers.ts'


const TopScorers = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [players, setPlayers] = useState<any[]>([]);
    const [topScorers, setTopScorers] = useState<Player[]>([])

    useEffect(() => {
        const fetchTopScorers = async () => {
            try {
                console.log('Getting top scorers');
                const topScorers = await playerService.getTopScorers(2021, 39);
                console.log('topScorers: ', topScorers)
                setPlayers(topScorers.response);
            } catch (error) {
                console.error("Error fetching top scorers:", error);
            }
        };

    fetchTopScorers();
    }, [])

    useEffect(() => {
        const transformed = players.map(playerInfo => ({
            name: playerInfo.player.name,
            goals: playerInfo.statistics[0].goals.total,
            photo: playerInfo.player.photo,
            team_logo: playerInfo.statistics[0].team.logo,
            team_name: playerInfo.statistics[0].team.name,
            id: playerInfo.player.id,
        }));
        setTopScorers(transformed);
    }, [players]);

    const playersPerPage = 10;
    const totalPages = Math.ceil(topScorers.length / playersPerPage);
    const startIdx = (currentPage - 1) * playersPerPage;
    const currentPlayers = topScorers.slice(startIdx, startIdx + playersPerPage);

    const handleNext = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrev = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    }; 
    return (
        <>
            {currentPlayers.map((player, ind) => {
                return (
                    <PlayerCard player={player} key={ind} />
                )
            })}
            <div style={{ marginTop: '1rem' }}>
                <button onClick={handlePrev} disabled={currentPage === 1}>
                Previous
                </button>

                <span style={{ margin: '0 10px' }}>
                Page {currentPage} of {totalPages}
                </span>

                <button onClick={handleNext} disabled={currentPage === totalPages}>
                Next
                </button>
            </div>

        </>
    )
}

export default TopScorers