declare module 'json-kifu-format' {
    export class JKFPlayer {
        static parse(kif: string): JKFPlayer;
        static parseKIF(kif: string): JKFPlayer;
        static parseKI2(kif: string): JKFPlayer;

        kifu: any;
        tesuu: number;

        getMaxPly(): number;
        forward(): boolean;
        backward(): boolean;
        goto(ply: number): void;
        getState(): {
            board: ({ color?: number; kind: string } | null)[][];
            hands: [Record<string, number>, Record<string, number>];
        };
        getMoveFormat(ply: number): { move?: { to?: { x: number; y: number } } };
    }
}
