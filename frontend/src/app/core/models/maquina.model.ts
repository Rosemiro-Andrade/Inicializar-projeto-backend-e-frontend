import { Registro } from './registro.model';

export interface Maquina {
  id: number;
  stage_id: number;
  nome: string;
  registros?: Registro[];
}