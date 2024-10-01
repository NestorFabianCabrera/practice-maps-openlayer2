import { Injectable } from '@angular/core';
import { Feature, Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import { Zoom, ZoomSlider } from 'ol/control';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Point } from 'ol/geom';
import Overlay from 'ol/Overlay';
import {Icon, Style} from "ol/style";
@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map: Map | undefined;
  private popup: Overlay | undefined;


  PARQUEADEROS:string = 'https://cdn-icons-png.flaticon.com/512/51/51778.png'
  COLEGIOS:string = 'https://cdn-icons-png.flaticon.com/512/2830/2830316.png'
  IGLESIAS:string = 'https://cdn-icons-png.flaticon.com/512/5438/5438502.png'


  public points = [
    { coords: [-72.49851467998661, 7.89754017896397], name: 'Gopenux Lab S.A.S', img: this.COLEGIOS, type: 'Colegio'},
    { coords: [-72.50179469393022, 7.881632887437397], name: 'Medellín', img: this.PARQUEADEROS, type: 'Parqueadero' },
    { coords: [-72.47875566741348, 7.922412075339184], name: 'Jardin Plaza', img: this.IGLESIAS, type: 'Centro Comercial' }
  ];

  constructor() {}

  initializeMap(target: string): Map {
    this.popup = new Overlay({
      element: document.getElementById('popup')!,
      autoPan: false
    });
    this.map = new Map({
      target: target,
      layers: [
        new TileLayer({
          source: new OSM({
            attributions: []
          })
        }),
        this.createPointLayer(),
      ],
      view: new View({
        center: fromLonLat([-72.50563619614115, 7.896104455742502]),
        zoom: 14,
      }),
      controls: [
        new Zoom(),
        new ZoomSlider()
      ]
    });


    this.map.addOverlay(this.popup);

    this.map.on('singleclick', (event) => {
      if (!this.map) return;
      const feature = this.map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      if (feature) {
        const coordinates = (feature.getGeometry() as Point).getCoordinates(); // Asegurar que es un Point
        this.popup!.setPosition(coordinates); // Coloco la posición del punto en el popup
        const popupElement = this.popup!.getElement();
        if (popupElement) {
          popupElement.innerHTML = `<div><h4 class="titlePopup">${feature.get('name')}</h4>
           <p><strong>Tipo:</strong> ${this.points.find(point => point.name === feature.get('name'))!.type}</p>
           <p><strong>Coordenadas:</strong></p>
           <ul>
           <li>Latitud: ${this.points.find(point => point.name === feature.get('name'))!.coords[1]}</li>
           <li>Longitud: ${this.points.find(point => point.name === feature.get('name'))!.coords[0]}</li>
          </ul>
            </div>`;
          popupElement.style.display = 'block';
        }
      } else {
        this.popup!.getElement()!.style.display = 'none';
      }

    });

    this.map.on('pointermove', (event) => {
      if (this.map) {
        const feature = this.map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
        if (this.map.getTargetElement()) {
          this.map.getTargetElement().style.cursor = feature ? 'pointer' : '';
        }
      }
    });

    return this.map;
  }
  createPointLayer(): VectorLayer {
    const vectorSource = new VectorSource();
    this.points.forEach(point => {
      const pointFeature = new Feature({
        geometry: new Point(fromLonLat(point.coords)),
        name: point.name
      });
      pointFeature.setStyle(new Style({

        image: new Icon({
          src: point.img,
          scale: 0.059
        })
      }));
      vectorSource.addFeature(pointFeature);
    });
    return new VectorLayer({
      source: vectorSource
    });
  }
}
