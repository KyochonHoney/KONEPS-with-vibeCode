export type Bid = {
  id: string;
  title: string;
  org: string;
  budget: number;
  deadline: string;
  starred: boolean;
  downloaded: boolean;
};

export type PageInfo = {
  page: number;
  size: number;
  total: number;
};

export type BidsResponse = {
  items: Bid[];
  pageInfo: PageInfo;
};