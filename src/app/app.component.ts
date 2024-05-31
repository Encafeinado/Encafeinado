import { Component, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnDestroy, AfterViewInit {
  modalRef!: NgbModalRef;
  openedModal = false;
  title = 'Proyecto_Aroma';
  watchId: number | undefined;
  routingControl: any;
  showCancelButton: boolean = false; // Variable para controlar la visibilidad del botón de cancelar ruta
  destinationName!: string;
  userLocationIcon: L.Icon;
  map!: L.Map;
  targetMarker!: L.Marker;
  userLocationMarker!: L.Marker;
  
  
  constructor(
    private modalService: NgbModal,
) {
  this.userLocationIcon = L.icon({
    iconUrl: 'assets/IconsMarker/cosechaUser.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}

  ngAfterViewInit(): void {
    const map = new L.Map('map').setView([6.150155571503784, -75.61905204382627], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const aromaIcon = L.icon({
      iconUrl: 'assets/IconsMarker/cafeteriaAroma.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const baulIcon = L.icon({
      iconUrl: 'assets/IconsMarker/cafeteriaCoffe.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const lealIcon = L.icon({
      iconUrl: 'assets/IconsMarker/cafeteriaLeal.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const aromaMarker = L.marker([6.15150999618405, -75.61369180892304], { icon: aromaIcon })
      .addTo(map)
      .bindPopup('Aroma Café Sabaneta');

    const baulMarker = L.marker([6.149950147326389, -75.61758096298057], { icon: baulIcon })
      .addTo(map)
      .bindPopup('Viejo Baul');

    const lealMarker = L.marker([6.150555615946403, -75.61797956390538], { icon: lealIcon })
      .addTo(map)
      .bindPopup('Leal Coffee');

    map.fitBounds([
      [aromaMarker.getLatLng().lat, aromaMarker.getLatLng().lng],
      [baulMarker.getLatLng().lat, baulMarker.getLatLng().lng],
      [lealMarker.getLatLng().lat, lealMarker.getLatLng().lng],
    ]);

    const userLocationMarker = L.marker([0, 0], { icon: this.userLocationIcon })
      .addTo(map)
      .bindPopup('Tu ubicación actual');

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        userLocationMarker.setLatLng([userLat, userLng]);
        map.setView([userLat, userLng], map.getZoom());

        map.fitBounds([
          [aromaMarker.getLatLng().lat, aromaMarker.getLatLng().lng],
          [baulMarker.getLatLng().lat, baulMarker.getLatLng().lng],
          [lealMarker.getLatLng().lat, lealMarker.getLatLng().lng],
          [userLocationMarker.getLatLng().lat, userLocationMarker.getLatLng().lng],
        ]);
      },
      (error) => {
        console.error('Error al obtener la ubicación del usuario:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    aromaMarker.on('click', () => {
      this.showRouteConfirmation(map, aromaMarker, userLocationMarker, 'Aroma Café Sabaneta');
    });

    baulMarker.on('click', () => {
      this.showRouteConfirmation(map, baulMarker, userLocationMarker, 'Viejo Baul');
    });

    lealMarker.on('click', () => {
      this.showRouteConfirmation(map, lealMarker, userLocationMarker, 'Leal Coffee');
    });
  }

  showRouteConfirmation(map: L.Map, targetMarker: L.Marker, userLocationMarker: L.Marker, destinationName: string): void {
    this.destinationName = destinationName;
    this.targetMarker = targetMarker; // Asignar el marcador de destino
    this.userLocationMarker = userLocationMarker; // Asignar el marcador de ubicación del usuario
    this.map = map; // Asignar el mapa
    this.openModal(); // Abrir el modal
  }

  showRouteGuia(): void {
    if (this.map && this.targetMarker && this.userLocationMarker && this.destinationName) {
      this.showRoute(
        this.map,
        this.userLocationMarker.getLatLng().lat,
        this.userLocationMarker.getLatLng().lng,
        this.targetMarker.getLatLng().lat,
        this.targetMarker.getLatLng().lng,
        this.targetMarker.options.icon as L.Icon // Aseguramos que el icono no es undefined
      );
      this.showCancelButton = true;
      console.log('Botón de cancelar ruta visible:', this.showCancelButton);  
      this.openedModal = false
      setTimeout(() => {
        this.modalRef.close();
      }, 1500);
    } else {
      console.error('Error: No se han inicializado los marcadores o el mapa.');
    }
  }
  

  // Método para mostrar la ruta
  showRoute(map: L.Map, startLat: number, startLng: number, endLat: number, endLng: number, icon: L.Icon): void {
    this.routingControl = (L as any).Routing.control({
      waypoints: [L.latLng(startLat, startLng), L.latLng(endLat, endLng)],
      routeWhileDragging: true,
      createMarker: (i: number, waypoint: any, n: number) => {
        if (i === n - 1) {
          return L.marker(waypoint.latLng, { icon: icon });
        } else {
          return L.marker(waypoint.latLng, { icon: this.userLocationIcon }); // Usar this para acceder a userLocationIcon
        }
      }
    }).addTo(map);
  }

  cancelRoute() {
    const confirmation = confirm('¿Estás seguro de que quieres cancelar la ruta?');
    if (confirmation) {
      if (this.routingControl) {
        this.routingControl.remove();
        this.showCancelButton = false;
      }
    }
  }
  ngOnDestroy(): void {
    if (this.watchId !== undefined) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }
  
  @ViewChild('createModal', { static: true }) createModal: any;
  openModal() {
    if (!this.openedModal) {
       
        this.openedModal = true;
        
        this.modalRef = this.modalService.open(this.createModal, { centered: true, backdrop: 'static' });

        this.modalRef.result.then(
            (result) => {
                if (result === 'Yes') {
                    this.openedModal = false;
 
                } else {

                }
            },
            (reason) => {
                this.openedModal = false;
            }
        );
    }
  }
}