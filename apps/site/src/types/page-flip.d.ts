declare module "page-flip" {
  export class PageFlip {
    constructor(element: HTMLElement, config: Record<string, unknown>);
    loadFromHTML(elements: NodeListOf<HTMLElement>): void;
    flipNext(): void;
    flipPrev(): void;
    getPageCount(): number;
    on(event: string, callback: (e: { data: number }) => void): void;
    destroy(): void;
  }
  export type PageFlipInstance = InstanceType<typeof PageFlip>;
}
