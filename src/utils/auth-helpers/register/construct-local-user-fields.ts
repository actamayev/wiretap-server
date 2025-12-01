import Encryptor from "../../../classes/encryptor"

export default async function constructLocalUserFields(
	registerInformation: IncomingRegisterRequest,
	hashedPassword: HashedString
): Promise<NewLocalUserFields> {
	try {
		const encryptor = new Encryptor()
		const encryptedEmail = await encryptor.deterministicEncrypt(registerInformation.email, "EMAIL_ENCRYPTION_KEY")

		return {
			username: registerInformation.username,
			password: hashedPassword,
			auth_method: "WIRETAP",
			email__encrypted: encryptedEmail
		}
	} catch (error) {
		console.error("Error adding user", error)
		throw error
	}
}
