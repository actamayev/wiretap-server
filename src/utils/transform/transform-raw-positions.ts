export default function transformRawUserPositions(rawUserPositions: RetrievedUserPositions): SinglePosition[] {
	try {
		return rawUserPositions.positions.map(position => ({
			contractUUID: position.contract_uuid as ContractUUID,
			numberOfContractsHeld: position.number_contracts_held
		}))
	} catch (error) {
		console.error(error)
		throw Error
	}
}
