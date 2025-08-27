export type BidFile = {
  name: string;
  url: string;
  status: string; // e.g., 'uploaded', 'processing', 'failed'
};

export type BidDetail = {
  id: string;
  title: string;
  body: string;
  files: BidFile[];
  meta: Record<string, any>; // For additional metadata
  starred: boolean;
  downloaded: boolean;
};