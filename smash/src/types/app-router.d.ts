declare module 'next/navigation' {
  export type PageProps<T = Record<string, string>> = {
    params: T;
    searchParams?: { [key: string]: string | string[] | undefined };
  };
}

declare module 'next' {
  export interface Metadata {
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
  }
}
