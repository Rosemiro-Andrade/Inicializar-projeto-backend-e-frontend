export interface Registro {
  id: number;
  maquina_id: number;
  quantidade_total: number;
  slot_identificacao: string;
  funcionando: number;
  modulo: string;
  data_registro: string;
  porcentagem: number;
}