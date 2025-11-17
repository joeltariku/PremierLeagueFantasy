import { render, screen } from "@testing-library/react"
import { describe, vi } from "vitest"
import TeamScreen from "./TeamScreen"

const mockTeam = {
    gk: {
        id: 1,
        name: "Raya",
        team: "Arsenal",
        price: 4.5,
        points: 13,
        form: [1, 3, 2, 1, 3]
    }, 
    def1: {
        id: 2,
        name: 'Van Digk',
        team: "Liverpool",
        price: 6.0,
        points: 10,
        form: [2, 2, 2, 2, 2]
    },
    mid1: {
        id: 3,
        name: "Palmer",
        team: "Chelsea", 
        price: 5.5,
        points: 8,
        form: [1, 1, 2, 2, 2]
    },
    att1: {
        id: 4,
        name: "Haaland",
        team: "Man City",
        price: 8.5,
        points: 20,
        form: [3, 3, 3, 3, 3]
    },
    att2: {
        id: 5,
        name: "Saka",
        team: "Arsenal",
        price: 5.5,
        points: 13,
        form: [1, 3, 4, 2, 1]
    }
}

const setShowPlayerModal = vi.fn()
const setCaptain = vi.fn()

const mockProps = {
    team: mockTeam,
    budget: 50,
    spent: 30,
    remaining: 20,
    captain: 1,
    setShowPlayerModal: setShowPlayerModal,
    setCaptain: setCaptain
}

describe('Testing TeamScreen component', () => {
    it('renders everything in hero', () => {
        render(<TeamScreen {...mockProps}/>)

        const hero = screen.getByTestId('hero')
        expect(hero).toHaveTextContent('Gameweek 15')
        expect(hero).toHaveTextContent('My Team')
    })
})