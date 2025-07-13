import Header from "../components/Header"
import { Top5List } from "../components/Top5List"

const HomePage = () => {
    return (
        <>
            <Header text="Premier League Dashboard" />
            <div className="dashboard-container">
                <Top5List />
                <Top5List />
                <Top5List />
                <Top5List />
            </div>
        </>
    )
}

export default HomePage