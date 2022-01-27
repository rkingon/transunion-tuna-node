import { Subscriber, TransunionClient } from '.'

const fauxSubscriber: Subscriber = {
	industryCode: 'x',
	memberCode: 'memberCode',
	password: 'password',
	prefix: 'prefix'
}

describe('TransunionClient', () => {
	let client: TransunionClient
	beforeAll(() => {
		client = new TransunionClient({
			system: {
				id: 'id',
				password: 'password'
			},
			certificate: Buffer.from('asdf', 'utf-8'),
			creditReportSubscriber: fauxSubscriber,
			modelReportSubscriber: fauxSubscriber,
			production: false
		})
	})
	it('works', () => {
		expect(client).toBeInstanceOf(TransunionClient)
	})
})
