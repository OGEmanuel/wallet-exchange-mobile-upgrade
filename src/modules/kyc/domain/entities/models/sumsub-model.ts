export interface SumsubTokenModel {
  token?: string | null;
  userId?: string | null;
}

export type SumsubVerificationReviewResult = "RED" | "GREEN";

export interface SumsubVerificationModel {
  IDENTITY?: Identity;
  SELFIE?: Selfie;
}

export interface Identity {
  reviewResult?: ReviewResult;
  country?: string;
  idDocType?: string;
  imageIds?: number[];
  imageReviewResults?: IDENTITYImageReviewResults;
  forbidden?: boolean;
  masked?: boolean;
  digital?: boolean;
  imageStatuses?: string[];
  attemptId?: string;
}

export interface IDENTITYImageReviewResults {
  "1467614997"?: The1467614997;
}

export interface The1467614997 {
  moderationComment?: string;
  clientComment?: string;
  reviewAnswer?: SumsubVerificationReviewResult;
  rejectLabels?: string[];
  reviewRejectType?: string;
  buttonIds?: string[];
}

export interface ReviewResult {
  moderationComment?: string;
  reviewAnswer?: SumsubVerificationReviewResult;
  reviewRejectType?: string;
}

export interface Selfie {
  reviewResult?: ReviewResult;
  country?: string;
  idDocType?: string;
  imageIds?: number[];
  imageReviewResults?: SELFIEImageReviewResults;
  forbidden?: boolean;
  masked?: boolean;
  digital?: boolean;
  imageStatuses?: string[];
  attemptId?: string;
}

export interface SELFIEImageReviewResults {
  "1681549305"?: The1467614997;
}
