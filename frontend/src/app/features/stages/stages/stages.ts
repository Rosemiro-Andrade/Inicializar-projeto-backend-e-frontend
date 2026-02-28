import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stages.html',
  styleUrls: ['./stages.scss']
})
export class Stages implements OnInit {

  stages: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getStages().subscribe(data => {
      this.stages = data;
    });
  }
}
