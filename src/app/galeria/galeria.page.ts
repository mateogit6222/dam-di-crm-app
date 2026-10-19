import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../services/supabase.service';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
  IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
  IonImg, IonToast, IonItem, IonLabel 
} from '@ionic/angular';

@Component({
  selector: 'app-galeria',
  templateUrl: './galeria.page.html',
  styleUrls: ['./galeria.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, 
    IonBackButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent, 
    IonImg, IonToast, IonItem, IonLabel
  ]
})
export class GaleriaPage implements OnInit {
  private supabaseService = inject(SupabaseService);
  images: string[] = [];
  toastMessage = '';
  isToastOpen = false;

  async ngOnInit() {
    await this.loadImages();
  }

  async loadImages() {
    try {
      this.images = await this.supabaseService.getGaleriaImages();
    } catch (e: any) {
      this.showToast('Error cargando imágenes: ' + e.message);
    }
  }

  showToast(msg: string) {
    this.toastMessage = msg;
    this.isToastOpen = true;
  }
}