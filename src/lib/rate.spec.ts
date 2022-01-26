import { rate } from './rate'

it('returns interest rate from monthly payment', () => {
	const speciman = rate(36, 600, 20000)
	expect(speciman).toBe('0.05065')
})
