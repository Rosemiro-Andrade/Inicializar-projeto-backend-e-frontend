import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Stage } from '../../../core/models/stage.model';
import { Maquina } from '../../../core/models/maquina.model';
import { Registro } from '../../../core/models/registro.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit {

  stages: Stage[] = [];
  dataSelecionada: string = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.carregarDashboard();
  }

  carregarDashboard() {
    this.api.getStages().subscribe((stages: Stage[]) => {
      this.stages = stages;

      stages.forEach(stage => {
        this.api.getMaquinas(stage.id).subscribe((machines: Maquina[]) => {
          stage.maquinas = machines;

          machines.forEach(machine => {
            this.api.getRegistros(machine.id).subscribe((records: Registro[]) => {
              // Adiciona a porcentagem já calculada
              machine.registros = records?.map(r => ({
                ...r,
                porcentagem: r.quantidade_total ? (r.funcionando / r.quantidade_total) * 100 : 0
              }))
              .sort((a, b) =>
                new Date(b.data_registro).getTime() -
                new Date(a.data_registro).getTime()
              );
            });
          });
        });
      });
    });
  }

  getUltimoRegistro(machine: Maquina): Registro | null {
    return machine.registros?.[0] ?? null;
  }

  // Retorna os últimos registros filtrando por data, máximo 2
  getUltimosRegistros(machine: Maquina, max: number = 2): Registro[] {
    let registros = machine.registros ?? [];

    if (this.dataSelecionada) {
      registros = registros.filter(r => {
        const registroDataISO = new Date(r.data_registro).toISOString().split('T')[0]; // yyyy-MM-dd;
        return registroDataISO === this.dataSelecionada;
      });
    }

    return registros.slice(0, max);
  }

  getPercentualStage(stage: Stage): number {
    if (!stage.maquinas) return 0;

    let totalSlots = 0;
    let totalFuncionando = 0;

    stage.maquinas.forEach(machine => {
      const registro = this.getUltimoRegistro(machine);
      if (registro) {
        totalSlots += registro.quantidade_total;
        totalFuncionando += registro.funcionando;
      }
    });

    if (totalSlots === 0) return 0;
    return (totalFuncionando / totalSlots) * 100;
  }

  getCor(porcentagem: number): 'primary' | 'accent' | 'warn' {
    if (porcentagem >= 80) return 'primary';
    if (porcentagem >= 50) return 'accent';
    return 'warn';
  }

  verDetalhes(machine: Maquina) {
    const ultimo = this.getUltimoRegistro(machine);
    alert(`Máquina: ${machine.nome}\nÚltimo registro: ${ultimo?.slot_identificacao ?? '-'} — ${ultimo?.porcentagem ?? 0}%`);
  }

  formatarData(data: string): string {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
  }

  atualizarDashboard() {
    this.carregarDashboard();
  }

  imprimirRegistro(registro: Registro, maquina: Maquina) {
    // Cria uma nova janela para impressão
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Registro</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      h2 { color: #3f51b5; }
      table { width: 100%; border-collapse: collapse; margin-top: 10px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      th { background-color: #f0f0f0; }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');

    // Template string correta
    printWindow.document.write(`<h2>Registro da Máquina: ${maquina.nome}</h2>`);
    printWindow.document.write('<table>');
    printWindow.document.write('<tr><th>Slot</th><td>' + registro.slot_identificacao + '</td></tr>');
    printWindow.document.write('<tr><th>Funcionando</th><td>' + registro.funcionando + '</td></tr>');
    printWindow.document.write('<tr><th>Total</th><td>' + registro.quantidade_total + '</td></tr>');
    printWindow.document.write('<tr><th>%</th><td>' + registro.porcentagem.toFixed(0) + '%</td></tr>');
    printWindow.document.write('<tr><th>Módulo</th><td>' + registro.modulo + '</td></tr>');
    printWindow.document.write('<tr><th>Data</th><td>' + this.formatarData(registro.data_registro) + '</td></tr>');
    printWindow.document.write('</table>');

    printWindow.document.write('</body></html>');
    printWindow.document.close();

    // Espera a janela carregar e imprime
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  imprimirMaquina(maquina: Maquina) {
    if (!maquina.registros || maquina.registros.length === 0) {
      alert('Não há registros para imprimir!');
      return;
    }

    const printWindow = window.open('', '', 'width=1000,height=800');
    if (!printWindow) return;

    printWindow.document.write('<html><head><title>Registros da Máquina</title>');
    printWindow.document.write('<style>');
    printWindow.document.write(`
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { color: #3f51b5; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
      th { background-color: #f0f0f0; }
    `);
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');

    printWindow.document.write(`<h1>Registros da Máquina: ${maquina.nome}</h1>`);

    printWindow.document.write('<table>');
    printWindow.document.write(`
      <thead>
        <tr>
          <th>Slot</th>
          <th>Funcionando</th>
          <th>Total</th>
          <th>%</th>
          <th>Módulo</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>
    `);

    // Itera pelos últimos registros (já filtrados ou limitados)
    maquina.registros.forEach(registro => {
      printWindow.document.write(`
        <tr>
          <td>${registro.slot_identificacao}</td>
          <td>${registro.funcionando}</td>
          <td>${registro.quantidade_total}</td>
          <td>${registro.porcentagem.toFixed(0)}%</td>
          <td>${registro.modulo}</td>
          <td>${this.formatarData(registro.data_registro)}</td>
        </tr>
      `);
    });

    printWindow.document.write('</tbody></table>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();

    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
}