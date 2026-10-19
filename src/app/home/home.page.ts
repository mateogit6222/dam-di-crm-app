import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import { Cliente } from '../models/cliente.model';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, 
  IonLabel, IonItemSliding, IonItemOptions, IonItemOption, IonIcon, 
  IonButton, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToast,
  IonButtons // <--- AÑADIDO AQUÍ
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline, imagesOutline, logOutOutline } from 'ionicons/icons';

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
    IonButton, IonInput, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonToast,
    IonButtons // <--- AÑADIDO EN LOS IMPORTS
  ],
})
export class HomePage implements OnInit {
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  clientes: Cliente[] = [];
  clienteForm: FormGroup;
  loginForm: FormGroup;
  
  editingClienteId: number | string | null = null;
  toastMessage = '';
  isToastOpen = false;

  currentUser = this.supabaseService.currentUser;

  constructor() {
    addIcons({ createOutline, trashOutline, imagesOutline, logOutOutline });
    
    this.clienteForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      ciudad: ['', Validators.required],
      fecha_alta: ['', Validators.required]
    });

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async ngOnInit() {
    await this.loadClientes();
  }

  async loadClientes() {
    try {
      this.clientes = await this.supabaseService.getClientes();
    } catch (e: any) {
      this.showToast('Error cargando clientes: ' + e.message);
    }
  }

  async login() {
    if (this.loginForm.invalid) return;
    try {
      const { email, password } = this.loginForm.value;
      await this.supabaseService.login(email, password);
      this.showToast('¡Sesión iniciada correctamente!');
      this.loginForm.reset();
    } catch (e: any) {
      this.showToast('Error de login: ' + e.message);
    }
  }

  async logout() {
    try {
      await this.supabaseService.logout();
      this.showToast('Sesión cerrada');
    } catch (e: any) {
      this.showToast('Error al cerrar sesión: ' + e.message);
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
      this.showToast('Error (¿Estás logueado?): ' + e.message);
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

  goToGaleria() {
    this.router.navigate(['/galeria']);
  }

  setToastOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.isToastOpen = true;
  }
}