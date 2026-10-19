import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  public currentUser = signal<User | null>(null);
  public userRole = signal<'admin' | 'user' | null>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.initSession();
  }

  private async initSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      this.currentUser.set(session.user);
      await this.loadRole(session.user.id);
    }
  }

  // --- MÉTODO DE LOGIN AÑADIDO ---
  async login(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) {
      this.currentUser.set(data.user);
      await this.loadRole(data.user.id);
    }
  }

  private async loadRole(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    if (!error && data) {
      this.userRole.set(data.role);
    }
  }

  async getClientes(): Promise<Cliente[]> {
  const { data, error } = await this.supabase.from('clientes').select('*').order('created_at', { ascending: false });
  
  // Añade estos logs para inspeccionar en la consola del navegador (F12)
  console.log('Datos recibidos de Supabase:', data);
  console.log('Error de Supabase (si lo hay):', error);

  if (error) throw error;
  return data || [];
}

  async createCliente(cliente: Cliente): Promise<void> {
    const { error } = await this.supabase.from('clientes').insert([{ 
      nombre: cliente.nombre, 
      ciudad: cliente.ciudad, 
      fecha_alta: cliente.fecha_alta 
    }]);
    if (error) throw error;
  }

  async updateCliente(id: number | string, cliente: Partial<Cliente>): Promise<void> {
    const { error } = await this.supabase.from('clientes').update(cliente).eq('id', id);
    if (error) throw error;
  }

  async deleteCliente(id: number | string): Promise<void> {
    const { error } = await this.supabase.from('clientes').delete().eq('id', id);
    if (error) throw error;
  }
  
  async logout() {
  const { error } = await this.supabase.auth.signOut();
  if (error) throw error;
  this.currentUser.set(null);
  this.userRole.set(null);
}

async getGaleriaImages(): Promise<string[]> {
  const { data, error } = await this.supabase.storage.from('galeria').list('', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' }
  });
  if (error) throw error;
  
  const imageUrls: string[] = [];
  if (data) {
    for (const file of data) {
      if (file.name !== '.emptyFolderPlaceholder') {
        const { data: publicUrlData } = this.supabase.storage
          .from('galeria')
          .getPublicUrl(file.name);
        imageUrls.push(publicUrlData.publicUrl);
      }
    }
  }
  return imageUrls;
}

}