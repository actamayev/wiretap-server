export default function transformRawUserPositions(rawUserPositions: RetrievedUserPositions): SinglePosition[] {
	try {
		return rawUserPositions.positions.map(position => ({
			outcomeId: position.outcome_id,
			marketQuestion: position.outcome.market.question,
			numberOfContractsHeld: position.number_contracts_held,
		}))
	} catch (error) {
		console.error(error)
		throw Error
	}
}
