import { xmlBuilder } from './lib/xml'

export interface Subject {
	name: {
		first: string
		middle?: string
		last: string
	}
	address: {
		status?: 'current'
		street: string
		city: string
		state: string
		zipCode: string | number
	}
	socialSecurityNumber?: string
	dateOfBirth?: string
}

export const createSubjects = (subjects: Subject[]): string => {
	let xml = ''
	let i = 1
	for (const subject of subjects) {
		const name = {
			person: {
				first: subject.name.first,
				middle: subject.name.middle,
				last: subject.name.last
			}
		}
		const address = {
			status: subject.address.status,
			street: {
				unparsed: subject.address.street
			},
			location: {
				city: subject.address.city,
				state: subject.address.state,
				zipCode: subject.address.zipCode
			}
		}
		let socialSecurity
		if (subject.socialSecurityNumber) {
			socialSecurity = {
				number: subject.socialSecurityNumber.replace(/\D/g, '')
			}
		}
		xml += xmlBuilder.build({
			subject: {
				number: i++,
				subjectRecord: {
					indicative: {
						name,
						address,
						socialSecurity,
						dateOfBirth: subject.dateOfBirth
					}
				}
			}
		})
	}
	return xml
}
