import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Cliente } from '../models/cliente.model';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, 
  IonLabel, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, 
  IonButton, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToast 
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, 
    IonLabel, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, 
    IonButton, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToast
  ],
})
export class HomePage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);

  clientes: Cliente[] = [];
  clienteForm: FormGroup;
  
  // CORREGIDO AQUÍ para aceptar number, string o null
  editingClienteId: number | string | null = null;
  
  toastMessage = '';
  isToastOpen = false;

  isAdmin = this.supabaseService.userRole;

  constructor() {
    addIcons({ createOutline, trashOutline });
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ciudad: ['', Validators.required],
      fecha_alta: ['', Validators.required]
    });
  }

  async ngOnInit() {
    try {
      // Puedes poner aquí tu usuario y contraseña de prueba si lo necesitas
      // await this.supabaseService.login('juan@gmail.com', 'tu_contraseña');
    } catch (e) {
      console.log('Aviso de login:', e);
    }
    await this.loadClientes();
  }

  async loadClientes() {
    try {
      this.clientes = await this.supabaseService.getClientes();
    } catch (e: any) {
      this.showToast('Error cargando clientes: ' + e.message);
    }
  }

  async saveCliente() {
    if (this.clienteForm.invalid) return;

    try {
      const formValue = this.clienteForm.value;
      if (this.editingClienteId !== null) {
        await this.supabaseService.updateCliente(this.editingClienteId, formValue);
        this.showToast('Cliente actualizado');
      } else {
        await this.supabaseService.createCliente(formValue);
        this.showToast('Cliente insertado');
      }
      this.resetForm();
      await this.loadClientes();
    } catch (e: any) {
      this.showToast('Error de guardado: ' + e.message);
    }
  }

  editCliente(cliente: Cliente) {
    this.editingClienteId = cliente.id!;
    this.clienteForm.patchValue({
      nombre: cliente.nombre,
      ciudad: cliente.ciudad,
      fecha_alta: cliente.fecha_alta
    });
  }

  async deleteCliente(id: number | string) {
    try {
      await this.supabaseService.deleteCliente(id);
      this.showToast('Cliente eliminado');
      await this.loadClientes();
    } catch (e: any) {
      this.showToast('Error eliminando: ' + e.message);
    }
  }

  resetForm() {
    this.clienteForm.reset();
    this.editingClienteId = null;
  }

  setToastOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.isToastOpen = true;
  }
}