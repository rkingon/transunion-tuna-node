import { XMLParser, XMLBuilder } from 'fast-xml-parser'

export const xmlParser = new XMLParser({
	parseTagValue: false
})
export const xmlBuilder = new XMLBuilder({})
