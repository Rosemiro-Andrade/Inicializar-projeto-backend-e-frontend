import { Maquina } from "./maquina.model";

export interface Stage {
  id: number;
  nome: string;
  maquinas?: Maquina[];
}