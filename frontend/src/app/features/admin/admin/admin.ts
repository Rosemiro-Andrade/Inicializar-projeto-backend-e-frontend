import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatCardModule
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss']
})
export class AdminComponent implements OnInit {

  tokenAdmin = '';

  novoRegistro = {
    stage_id: null as number | null,
    stage_nome: '',       // <- novo
    maquina_id: null as number | null,
    maquina_nome: '',     // <- novo
    quantidade_total: 0,
    funcionando: 0,
    modulo: '',
    slot_identificacao: ''
  };

  stages: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.carregarStages();
  }

  atualizarDashboard() {
    if (!this.tokenAdmin) {
      alert('Digite o token!');
      return;
    }

    this.api.atualizarDashboard(this.tokenAdmin).subscribe({
      next: (res: any) => alert(res.message),
      error: () => alert('Token inválido!')
    });
  }

  carregarStages() {
    this.api.getStages().subscribe(data => {
      this.stages = data;

      this.stages.forEach(stage => {
        this.api.getMaquinas(stage.id).subscribe((maquinas: any[]) => {
          stage.maquinas = maquinas || [];
        });
      });
    });
  }

  criarStage(nome: string) {
    if (!nome) {
      alert('Digite um nome para o Stage!');
      return null;
    }

    return this.api.createStage({ nome });
  }

  criarMaquina(stageId: number, nome: string) {
    if (!nome) {
      alert('Digite um nome para a Máquina!');
      return null;
    }

    return this.api.createMaquina({ nome, stage_id: stageId });
  }

  criarRegistro() {
    // 1️⃣ Criar Stage se necessário
    if (!this.novoRegistro.stage_id && this.novoRegistro.stage_nome) {
      const stageResult = this.criarStage(this.novoRegistro.stage_nome);
      if (stageResult) {
        stageResult.subscribe(resStage => {
          this.novoRegistro.stage_id = resStage.id;
          this.novoRegistro.stage_nome = '';
          this.criarRegistro(); // chamar de novo para criar máquina/registros
        });
        return;
      }
    }

    if (!this.novoRegistro.stage_id) {
      alert('Selecione ou digite um Stage!');
      return;
    }

    // 2️⃣ Criar Máquina se necessário
    if (!this.novoRegistro.maquina_id && this.novoRegistro.maquina_nome) {
      const maquinaResult = this.criarMaquina(this.novoRegistro.stage_id, this.novoRegistro.maquina_nome);
      if (maquinaResult) {
        maquinaResult.subscribe(resMaquina => {
          this.novoRegistro.maquina_id = resMaquina.id;
          this.novoRegistro.maquina_nome = '';
          this.salvarRegistro();
        });
        return;
      }
    }

    if (!this.novoRegistro.maquina_id) {
      alert('Selecione ou digite uma Máquina!');
      return;
    }

    // 3️⃣ Criar Registro
    this.salvarRegistro();
  }

  salvarRegistro() {
    if (!this.novoRegistro.maquina_id) return;

    this.api.createRegistro(this.novoRegistro).subscribe(() => {
      alert('Registro criado com sucesso!');
      // Resetar formulário
      this.novoRegistro = {
        stage_id: null,
        stage_nome: '',
        maquina_id: null,
        maquina_nome: '',
        quantidade_total: 0,
        funcionando: 0,
        modulo: '',
        slot_identificacao: ''
      };
      this.carregarStages();
    });
  }
}