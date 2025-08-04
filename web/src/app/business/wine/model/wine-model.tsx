export interface WineModel {
    id: number;
    name: string;
    country: string;
    winery: string;
    region: string;
    subregion: string;
    variety: string;
    sweetness: number;
    body: number;
    tannin: number;
    acidity: number;
    image: string | null;
    description: string | null;
}
export const createWineModel = (data: Partial<WineModel>): WineModel => {
    return {
        id: data.id ?? 0,
        name: data.name ?? '',
        country: data.country ?? '',
        winery: data.winery ?? '',
        region: data.region ?? '',
        subregion: data.subregion ?? '',
        variety: data.variety ?? '',
        sweetness: data.sweetness ?? 0,
        body: data.body ?? 0,
        tannin: data.tannin ?? 0,
        acidity: data.acidity ?? 0,
        image: data.image ?? null,
        description: data.description ?? null,
    };
};
