const PointsScreen: React.FC = () => {
    return (
        <div className="container-medium">
            <div className="points-hero">
                <div className="points-hero-center">
                <div className="muted mb-4">Gameweek 15 Points</div>
                <div className="points-big">67</div>
                <div className="muted">Average: 54</div>
            </div>

            <div className="points-grid">
                <div className="glass-card">
                    <div className="points-val">1,234</div>
                    <div className="muted">Overall Rank</div>
                </div>
                <div className="glass-card">
                    <div className="points-val up">↑ 2,456</div>
                    <div className="muted">GW Movement</div>
                </div>
            </div>
        </div>

        <div className="card">
            <h3 className="card-title">Top Scorers This Week</h3>
            <div className="stack tight">
            {[
                { name: 'Haaland', team: 'MCI', points: 18 },
                { name: 'Salah', team: 'LIV', points: 15 },
                { name: 'Saka', team: 'ARS', points: 12 },
            ].map((player, i) => (
                <div key={i} className="row tight hoverable">
                <div className="rank-badge">{i + 1}</div>
                <div className="row-main">
                    <div className="row-title">{player.name}</div>
                    <div className="row-sub">{player.team}</div>
                </div>
                <div className="row-right strong purple-text">{player.points}</div>
                </div>
            ))}
            </div>
        </div>
        </div>
    );
};

export default PointsScreen