import { findUserByWhereCondition } from "../../../db-operations/read/find/find-user"

export default async function retrieveUserFromContact(
	loginContact: string,
	loginContactType: EmailOrUsername
): Promise<ExtendedCredentials | null> {
	try {
		const whereCondition: { [key: string]: { equals: string, mode?: "insensitive"  } } = { }

		if (loginContactType === "Username") {
			whereCondition.username = { equals: loginContact, mode: "insensitive" }
		} else {
			whereCondition.email = { equals: loginContact }
		}

		return await findUserByWhereCondition(whereCondition)
	} catch (error) {
		console.error(error)
		throw error
	}
}
