// import PrismaClientClass from "../../../classes/prisma-client"

// export default async function retrieveAllEmailSubscribers(): Promise<string[]> {
// 	try {
// 		const prismaClient = await PrismaClientClass.getPrismaClient()

// 		const subscribers = await prismaClient.email_update_subscriber.findMany({
// 			select: {
// 				email__encrypted: true,
// 			},
// 			orderBy: {
// 				email_update_subscriber_id: "asc"
// 			}
// 		})

// 		return subscribers.map(subscriber => subscriber.email__encrypted)
// 	} catch (error) {
// 		console.error("Error retrieving email subscribers:", error)
// 		throw error
// 	}
// }
