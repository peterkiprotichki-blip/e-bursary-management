import { Component, OnInit } from '@angular/core';

interface BursaryProgram {
  id: string;
  name: string;
  year: string;
  budget: number;
  allocated: number;
  status: 'active' | 'closed';
  description: string;
}

@Component({
  selector: 'app-programs-list',
  templateUrl: './programs-list.component.html',
  styleUrls: ['./programs-list.component.scss']
})
export class ProgramsListComponent implements OnInit {
  programs: BursaryProgram[] = [
    { id: '1', name: 'University & College Funding Scheme', year: '2026', budget: 15000000, allocated: 4500000, status: 'active', description: 'Bursary funding targeting tertiary education students.' },
    { id: '2', name: 'Primary School Students Support Fund', year: '2026', budget: 12000000, allocated: 2800000, status: 'active', description: 'Education support for primary school learners in need of bursary assistance.' },
    { id: '3', name: 'Secondary School Ward Allocation', year: '2026', budget: 10000000, allocated: 2300000, status: 'active', description: 'High school tuition fee funding allocated per ward.' },
    { id: '4', name: 'Special Disability Support Grant', year: '2026', budget: 3000000, allocated: 900000, status: 'active', description: 'Grant scheme targeting physically challenged students.' }
  ];

  selectedProg: BursaryProgram | null = null;
  isEdit = false;
  
  formName = '';
  formYear = '2026';
  formBudget = 0;
  formDescription = '';
  formStatus: 'active' | 'closed' = 'active';

  ngOnInit() {}

  openModal(prog?: BursaryProgram) {
    if (prog) {
      this.isEdit = true;
      this.selectedProg = prog;
      this.formName = prog.name;
      this.formYear = prog.year;
      this.formBudget = prog.budget;
      this.formDescription = prog.description;
      this.formStatus = prog.status;
    } else {
      this.isEdit = false;
      this.selectedProg = {} as any;
      this.formName = '';
      this.formYear = '2026';
      this.formBudget = 0;
      this.formDescription = '';
      this.formStatus = 'active';
    }
  }

  closeModal() {
    this.selectedProg = null;
  }

  saveProgram() {
    if (!this.formName.trim()) return;

    if (this.isEdit && this.selectedProg) {
      const idx = this.programs.findIndex((p) => p.id === this.selectedProg!.id);
      if (idx !== -1) {
        this.programs[idx] = {
          ...this.programs[idx],
          name: this.formName,
          year: this.formYear,
          budget: this.formBudget,
          description: this.formDescription,
          status: this.formStatus
        };
      }
    } else {
      this.programs.push({
        id: Date.now().toString(),
        name: this.formName,
        year: this.formYear,
        budget: this.formBudget,
        allocated: 0,
        status: this.formStatus,
        description: this.formDescription
      });
    }
    this.closeModal();
  }

  deleteProgram(id: string) {
    if (confirm('Are you sure you want to delete this program?')) {
      this.programs = this.programs.filter((p) => p.id !== id);
    }
  }
}
