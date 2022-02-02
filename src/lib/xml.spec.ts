import { xmlParser } from './xml'

interface ParsedXML {
	root: {
		ssn: string
	}
}

it('treats ssn as a string', () => {
	const ssn = '012345678'
	const xml = `<root><ssn>${ssn}</ssn></root>`
	const parsed: ParsedXML = xmlParser.parse(xml)
	expect(parsed.root.ssn).toBe(ssn)
})
