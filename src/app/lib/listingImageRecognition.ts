import { EDGE_URL } from '../../lib/supabase';

export interface ListingImageRecognitionResult {
  toolType: string;
  brand: string;
  model: string;
  category: string;
  condition: string;
  suggestedTitle: string;
  suggestedDescription: string;
  confidence: number;
}

export interface AnalyzeListingImagesResponse {
  ok: boolean;
  result: ListingImageRecognitionResult;
  message?: string;
}

export const EMPTY_RECOGNITION_RESULT: ListingImageRecognitionResult = {
  toolType: '',
  brand: '',
  model: '',
  category: '',
  condition: '',
  suggestedTitle: '',
  suggestedDescription: '',
  confidence: 0,
};

function normalizeRecognitionResult(input: any): ListingImageRecognitionResult {
  if (!input || typeof input !== 'object') {
    return EMPTY_RECOGNITION_RESULT;
  }

  return {
    toolType: typeof input.toolType === 'string' ? input.toolType : '',
    brand: typeof input.brand === 'string' ? input.brand : '',
    model: typeof input.model === 'string' ? input.model : '',
    category: typeof input.category === 'string' ? input.category : '',
    condition: typeof input.condition === 'string' ? input.condition : '',
    suggestedTitle: typeof input.suggestedTitle === 'string' ? input.suggestedTitle : '',
    suggestedDescription: typeof input.suggestedDescription === 'string' ? input.suggestedDescription : '',
    confidence: typeof input.confidence === 'number' && Number.isFinite(input.confidence) ? input.confidence : 0,
  };
}

export async function analyzeListingImages(params: {
  imageUrls: string[];
  accessToken?: string;
  listingContext?: {
    title?: string;
    description?: string;
    brand?: string;
    categoryId?: string;
    condition?: string;
  };
}): Promise<AnalyzeListingImagesResponse> {
  const { imageUrls, accessToken, listingContext } = params;

  const response = await fetch(`${EDGE_URL}/analyze-listing-images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ imageUrls, listingContext }),
  });

  if (!response.ok) {
    throw new Error(`Image recognition request failed with status ${response.status}`);
  }

  const data = await response.json();
  return {
    ok: Boolean(data?.ok),
    result: normalizeRecognitionResult(data?.result),
    message: typeof data?.message === 'string' ? data.message : undefined,
  };
}
