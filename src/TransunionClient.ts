import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import https from 'https';
import { XMLWrapper } from './XMLWrapper';
import { xmlParser } from './lib/xml';
import { createSubjects, Subject } from './Subject';
import { tradeLinesHandler, TradeLinesHandlerResponse } from './TradeLinesHandler';
import { AddonHandlerResponse, addonProductHandler } from './AddonProductHandler';
import { indicativeHandler, IndicativeResponse } from './IndicativeHandler';

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
  production: boolean;
}

export type RequestOptions<T extends Record<string, unknown> = {}> = T & {
  subscriber?: Partial<Subscriber>;
  subjects: Subject[];
};

export type RequestResponse = AddonHandlerResponse &
  IndicativeResponse &
  TradeLinesHandlerResponse & {
    rawRequest: string;
    rawResponse: string;
  };

export interface RequestErrorResponse {
  error: Error;
  rawRequest: RequestResponse['rawRequest'];
}

export interface CreditLine {}

class RequestError extends Error {
  public rawRequest: string;
  constructor({ rawRequest, message }: { rawRequest: string; message: string }) {
    super(message);
    this.rawRequest = rawRequest;
  }
}

export class TransunionClient {
  private readonly axios: AxiosInstance;

  constructor(private readonly options: TransunionClientOptions) {
    const baseURL =
      options.production === true ? 'https://netaccess.transunion.com' : 'https://netaccess-test.transunion.com';
    const httpsAgent = new https.Agent({
      pfx: this.options.certificate,
      passphrase: this.options.system.password,
      keepAlive: false,
      timeout: 10000,
    });
    this.axios = Axios.create({
      baseURL,
      headers: { 'Content-Type': 'text/xml' },
      httpsAgent,
    });
  }

  private async request({
    productCode,
    subjects,
    subscriber,
  }: {
    productCode: string;
    subjects: Subject[];
    subscriber?: Partial<Subscriber>;
  }) {
    const xml = XMLWrapper({
      system: this.options.system,
      subscriber: {
        ...this.options.subscriber,
        ...subscriber,
      },
      product: {
        code: productCode,
        body: createSubjects(subjects),
      },
      production: this.options.production,
    });
    try {
      const { data }: AxiosResponse<string> = await this.axios({
        method: 'POST',
        data: xml,
      });
      const parsed: Record<string, any> = xmlParser.parse(data);
      const returnResponse: RequestResponse = {
        rawRequest: xml,
        rawResponse: data,
      };
      const record = parsed?.creditBureau?.product?.subject?.subjectRecord;
      if (record) {
        const addons = addonProductHandler(record.addOnProduct);
        const indicative = indicativeHandler(record.indicative);
        const tradeLines = tradeLinesHandler(record.custom?.credit?.trade);
        Object.assign(returnResponse, addons, indicative, tradeLines);
      }
      return returnResponse;
    } catch (err) {
      throw new RequestError({
        message: `${err}`,
        rawRequest: xml,
      });
    }
  }

  public async modelReport({ subscriber, subjects }: RequestOptions) {
    return this.request({
      productCode: '08000',
      subjects,
      subscriber,
    });
  }

  public async creditReport({ subscriber, subjects }: RequestOptions) {
    return this.request({
      productCode: '07000',
      subjects,
      subscriber,
    });
  }
}
