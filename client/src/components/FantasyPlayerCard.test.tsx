import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FantasyPlayerCard from './FantasyPlayerCard'
import userEvent from '@testing-library/user-event'

const player = {
    id: 3,
    name: "Joel",
    team: "Arsenal",
    price: 5.5,
    points: 12,
    form: [1, 2, 3, 4, 5]
}

const setShowPlayerModal = vi.fn()
const setCaptain = vi.fn()

const mockProps = {
    player: player,
    position: "DEF",
    isCaptain: false,
    isLocked: false,
    setShowPlayerModal: setShowPlayerModal,
    setCaptain: setCaptain
}

describe('Testing FantasyPlayerCard component', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })
    describe('testing when player is falsy', () => {
        it('renders div with empty class', () => {
            render(<FantasyPlayerCard {...mockProps} player={undefined}/>)

            const div = screen.getByTestId('empty-playercard')
            expect(div).toBeInTheDocument()
            expect(div).toHaveTextContent('+')
            expect(div).toHaveTextContent('Add Player')
        })
        it('calls setShowPlayerModal with true when isLocked is false', async () =>  {
            render(<FantasyPlayerCard {...mockProps} player={undefined}/>)

            const user = userEvent.setup()
            const div = screen.getByTestId('empty-playercard')
            await user.click(div)

            expect(setShowPlayerModal).toHaveBeenCalledWith(true)
        })
        it("doesn't call setShowPlayerModal when isLocked is true", async () => {
            render(<FantasyPlayerCard {...mockProps} player={undefined} isLocked={true} />)

            const user = userEvent.setup()
            const div = screen.getByTestId('empty-playercard')
            await user.click(div)

            expect(setShowPlayerModal).not.toHaveBeenCalled()

        })
    })
    describe('testing when player is truthy', () => {
        it('only renders captain icon when isCaptain is true and isLocked is false', () => {
            render(<FantasyPlayerCard {...mockProps} isCaptain={true}/>)

            expect(screen.getByTestId('playercard')).toHaveClass('pcard--captain')
            expect(screen.getByTestId('captain-icon')).toBeInTheDocument()
            expect(screen.queryByTestId('lock-icon')).not.toBeInTheDocument()
        })
        it('renders both captain icon and lock icon when both isCaptian and isLocked is true', () => {
            render(<FantasyPlayerCard {...mockProps} isCaptain={true} isLocked={true}/>)

            expect(screen.getByTestId('playercard')).toHaveClass('pcard--locked')
            expect(screen.getByTestId('captain-icon')).toBeInTheDocument()
            expect(screen.getByTestId('lock-icon')).toBeInTheDocument()
        })
        it('renders playercard with proper content', () => {
            render(<FantasyPlayerCard {...mockProps}/>)

            expect(screen.getByTestId('playercard')).toBeInTheDocument()
            expect(screen.getByTestId('playercard-avatar')).toHaveTextContent('J')
            expect(screen.getByTestId('playercard-name')).toHaveTextContent('Joel')
            expect(screen.getByTestId('playercard-team')).toHaveTextContent('Arsenal')
            expect(screen.getByTestId('playercard-price')).toHaveTextContent('5.5m')
            expect(screen.getByTestId('playercard-pts')).toHaveTextContent('12 pts')
        })
        it('calls setCaptain when isLocked is false', async () => {
            render(<FantasyPlayerCard {...mockProps}/>)

            const user = userEvent.setup()
            const div = screen.getByTestId('playercard')
            await user.click(div)

            expect(setCaptain).toHaveBeenCalledWith(3)
        })
        it("doesn't call setCaptain when isLocked is true", async () => {
            render(<FantasyPlayerCard {...mockProps} isLocked={true}/>)

            const user = userEvent.setup()
            const div = screen.getByTestId('playercard')
            await user.click(div)

            expect(setCaptain).not.toHaveBeenCalled()
        })
    })
})