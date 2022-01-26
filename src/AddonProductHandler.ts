export interface AddonProduct {
  [x: string]: any;
  code: string;
  status: string;
}

export interface AddonHandlerResponse {
  vantageScore?: number;
}

export function addonProductHandler(_addonProducts: AddonProduct | AddonProduct[]): AddonHandlerResponse {
  const response: AddonHandlerResponse = {};
  const addonProducts: AddonProduct[] = [_addonProducts].flat();
  for (const addonProduct of addonProducts) {
    switch (addonProduct.code) {
      case '00V60': {
        response.vantageScore = addonProduct.scoreModel?.score?.results;
        break;
      }
    }
  }
  return response;
}
