import isNull from "lodash/isNull"
import PrismaClientClass from "../../../classes/prisma-client"
import fetchPolymarketPrice from "../../../utils/polymarket/fetch-current-price"

// eslint-disable-next-line max-lines-per-function
export default async function retrieveSpecificClobPositions(
	wiretapFundUuid: FundsUUID,
	clobToken: ClobTokenId
): Promise<SinglePosition[]| []> {
	try {
		const prismaClient = await PrismaClientClass.getPrismaClient()

		const rawUserPositions = await prismaClient.position.findMany({
			where: {
				wiretap_fund_uuid: wiretapFundUuid,
				clob_token_id: clobToken
			},
			select: {
				clob_token_id: true,
				number_shares_held: true,
				average_cost_per_share: true,
				created_at: true,
				outcome: {
					select: {
						outcome: true,
						market: {
							select: {
								question: true,
								event: {
									select: {
										event_slug: true,
										image_url: true
									}
								}
							}
						}
					}
				}
			}
		})

		if (isNull(rawUserPositions)) return []

		return await Promise.all(rawUserPositions.map(async (position) => ({
			clobToken: position.clob_token_id as ClobTokenId,
			outcome: position.outcome.outcome as OutcomeString,
			marketQuestion: position.outcome.market.question,
			numberOfSharesHeld: position.number_shares_held,
			costBasisPerShareUsd: position.average_cost_per_share,
			currentMarketPricePerShareUsd: await fetchPolymarketPrice(position.clob_token_id as ClobTokenId) as number,
			positionCreatedAt: position.created_at,
			polymarketSlug: position.outcome.market.event.event_slug as EventSlug,
			polymarketImageUrl: position.outcome.market.event.image_url as string
		})))
	} catch (error) {
		console.error(error)
		throw error
	}
}
