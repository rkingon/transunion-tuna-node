import Axios, { AxiosInstance } from 'axios';
import https from 'https';
import { XMLWrapper } from './XMLWrapper';
import { xmlParser } from './lib/xml';
import { createSubjects, Subject } from './Subject';

export interface SystemCredentials {
  id: string;
  password: string;
}

export interface Subscriber {
  industryCode: string;
  memberCode: string;
  prefix: string | number;
  password: string;
}

export interface TransunionClientOptions {
  system: SystemCredentials;
  subscriber: Subscriber;
  certificate: Buffer;
}

export class TransunionClient {
  private readonly axios: AxiosInstance;

  constructor(private readonly options: TransunionClientOptions) {
    const httpsAgent = new https.Agent({
      pfx: this.options.certificate,
      passphrase: this.options.system.password,
      keepAlive: false,
      timeout: 10000,
    });
    this.axios = Axios.create({
      baseURL: 'https://netaccess-test.transunion.com',
      headers: { 'Content-Type': 'text/xml' },
      httpsAgent,
    });
  }

  private async request({
    productCode,
    subjects,
  }: {
    productCode: string;
    subjects: Subject[];
  }) {
    const xml = XMLWrapper({
      system: this.options.system,
      subscriber: this.options.subscriber,
      product: {
        code: productCode,
        body: createSubjects(subjects),
      },
    });
    const response = await this.axios({
      method: 'POST',
      data: xml,
    });
    const parsed = xmlParser.parse(response.data);
    return parsed;
  }

  public async modelReport({ subjects }: { subjects: Subject[] }) {
    const data = await this.request({
      productCode: '08000',
      subjects,
    });
    const record = data?.creditBureau?.product?.subject?.subjectRecord;
    if (record) {
      const creditScore = record.addOnProduct?.scoreModel?.score?.results;
      if (creditScore) {
        return {
          creditScore,
          socialSecurityNumber: record.indicative?.socialSecurity?.number,
        };
      }
    }
    return null;
  }
}
