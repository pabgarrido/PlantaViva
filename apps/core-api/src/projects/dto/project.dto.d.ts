declare class LocationDto {
    lat: number;
    lng: number;
    label: string;
}
export declare class CreateProjectDto {
    name: string;
    location?: LocationDto;
}
export declare class UpdateProjectDto {
    name?: string;
    location?: LocationDto;
}
export {};
//# sourceMappingURL=project.dto.d.ts.map