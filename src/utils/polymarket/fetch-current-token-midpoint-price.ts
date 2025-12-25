import axios from "axios"
import { CLOB_BASE_URL } from "../constants"

interface MidpointPriceResponse {
	mid: string
}

export default async function fetchCurrentTokenPrice(tokenId: ClobTokenId): Promise<number | undefined> {
	try {
		const response = await axios.get<MidpointPriceResponse>(`${CLOB_BASE_URL}/midpoint`, {
			params: {
				token_id: tokenId
			}
		})

		return parseFloat(response.data.mid)
	} catch (error) {
		console.error(`Error fetching midpoint price for token ${tokenId}:`, error)
		console.error(error)
		return undefined
	}
}
