declare global {
	type DeterministicEncryptedString = string & { __type: "DeterministicEncryptedString" }
	type NonDeterministicEncryptedString = string & { __type: "NonDeterministicEncryptedString" }
}

export {}
