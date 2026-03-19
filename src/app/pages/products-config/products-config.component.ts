import { Component } from '@angular/core';

@Component({
  selector: 'app-products-config',
  templateUrl: './products-config.component.html',
  styleUrls: ['./products-config.component.scss']
})
export class ProductsConfigComponent {
  readonly filters = [
    'Tous les produits',
    'Collections',
    'Promotions'
  ];

  readonly cards = [
    { title: 'Nouveau produit', isCreateCard: true },
    { title: 'Sneaker Atlas' },
    { title: 'Sac Studio 24h' },
    { title: 'Lampe Orbit edition hiver' },
    { title: 'Veste Transit' },
    { title: 'Ecouteurs Echo Mini' },
    { title: 'Chaise Sirocco' },
    { title: 'Montre Meridian' },
    { title: 'Carnet Atelier' },
    { title: 'Lunettes Horizon' },
    { title: 'Bouteille Daily Carry' },
    { title: 'Tapis Nomad' },
    { title: 'Bureau Compact' },
    { title: 'Table d appoint Arc' }
  ];
}
