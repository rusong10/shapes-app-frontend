import { Shape } from "./shapes";

export interface ShapeUpdateMessage {
    action: "created" | "updated" | "deleted";
    shape?: Shape;
    shape_id?: number;
}