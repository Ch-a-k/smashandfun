declare module 'next' {
  export type Metadata = {
    title?: string;
    description?: string;
    openGraph?: {
      title?: string;
      description?: string;
      type?: string;
      url?: string;
      images?: Array<{
        url: string;
      }>;
    };
  };
}
