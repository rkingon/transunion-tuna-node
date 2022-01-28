import nock from 'nock'
import { Subject, Subscriber, TransunionClient } from '.'
import modelReportResponse from './__fixtures/modelReportResponse'

const fauxSubscriber: Subscriber = {
	industryCode: 'x',
	memberCode: 'memberCode',
	password: 'password',
	prefix: 'prefix'
}

const TigerWoods: Subject = {
	name: {
		first: 'Tiger',
		last: 'Woods'
	},
	address: {
		street: '2604 Washington Road',
		city: 'Augusta',
		state: 'GA',
		zipCode: '30904'
	}
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
	test('modelReport', async () => {
		nock(client.apiUrl).post('/').reply(200, modelReportResponse)
		const { vantageScore, socialSecurityNumber, tradeLines } = await client.modelReport({
			subjects: [TigerWoods]
		})
		expect(vantageScore).toBe(667)
		expect(socialSecurityNumber).toBe('666484418')
		expect(tradeLines).toHaveLength(0)
	})
})
