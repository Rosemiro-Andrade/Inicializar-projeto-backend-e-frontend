import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Stage } from '../../../core/models/stage.model';
import { Maquina } from '../../../core/models/maquina.model';
import { Registro } from '../../../core/models/registro.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatProgressBarModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  stages: Stage[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getStages().subscribe((stages: Stage[]) => {
      this.stages = stages;

      stages.forEach(stage => {
        this.api.getMaquinas(stage.id).subscribe((machines: Maquina[]) => {
          stage.maquinas = machines;

          machines.forEach(machine => {
            this.api.getRegistros(machine.id).subscribe((records: Registro[]) => {
              // Inicializa sempre como array para evitar undefined
              machine.registros = records || [];
            });
          });
        });
      });
    });
  }

  // Retorna o último registro da máquina (ou null se não houver)
  getUltimoRegistro(machine: Maquina): Registro | null {
    return machine.registros?.[0] ?? null;
  }

  // Calcula média da porcentagem do Stage
  getPercentualStage(stage: Stage): number {
    if (!stage.maquinas) return 0;

    let totalSlots = 0;
    let totalFuncionando = 0;

    stage.maquinas.forEach(machine => {
      const registro = machine.registros?.[0]; // pega o último registro);
      if (registro) {
        totalSlots += registro.quantidade_total;
        totalFuncionando += registro.funcionando;
      }
    });

    if (totalSlots === 0) return 0; // evita divisão por zero
    return (totalFuncionando / totalSlots) * 100;
  }

  // Define cor da barra de progresso
  getCor(porcentagem: number): string {
    if (porcentagem >= 80) return 'primary';
    if (porcentagem >= 50) return 'accent';
    return 'warn';
  }

  // Função clicável para exibir detalhes da máquina
  verDetalhes(machine: Maquina) {
    const ultimo = this.getUltimoRegistro(machine);
    alert(`Máquina: ${machine.nome}\nÚltimo registro: ${ultimo?.slot_identificacao ?? '-'} — ${ultimo?.porcentagem ?? 0}%`);
  }

  atualizarDashboard() {
    this.ngOnInit(); // recarrega tudo
  }
}