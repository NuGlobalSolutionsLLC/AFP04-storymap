import { defineStore } from 'pinia';

const TEMPLATES = {
  tce: {
    label: 'Trichloroethylene',
    stroke: 'black',
    opacity: 1,
    limits: [5, 50, 100, 400, 1000, 5000, 10000],
    colors: ['rgba(0,255,0,1.0)', 'rgba(0,255,197,1.0)', 'rgba(233,255,190,1.0)', 'rgba(255,255,0,1.0)',
             'rgba(255,235,175,1.0)', 'rgba(255,170,0,1.0)', 'rgba(255,0,0,1.0)', 'rgba(132,0,168,1.0)'],
    tooltip: feature => {
      `Well ID: ${feature.properties.Well_ID}<br>Result: ${feature.properties.Result} μg/L<br/>Date: ${feature.properties.SDate}`
    }
  }
}


export const useMapStore = defineStore('map-store', {
  state: () => ({
    leftDrawerOpen: true,
    layers: [
      {
        label: 'Layer List',
        icon: 'layers',
        mode: 'single-select',
        childs: [
          {
            label: 'TCE in GW',
            file: 'GWTCE46.json',
            class: 'chemdata',
            active: true,
            template: TEMPLATES.tce
          },
          {
            label: 'TCE > 1990 in GW',
            file: 'GWTCEafter199045.json',
            class: 'chemdata',
            active: false,
            template: TEMPLATES.tce
          }
        ]
      },
      {
        label: 'Transects',
        icon: 'stacked_line_chart',
        childs: [
          {
            label: '4D View',
            file: 'TranLine4DView17.json',
            active: false,
            class: 'transects'
          },
          {
            label: 'Test',
            file: 'TranLine4DView17s.json',
            active: false,
            class: 'transects'
          }
        ]
      },
      {
        label: 'Well Characteristics, Soil Type, Base Topo',
        icon: 'commit',
        childs: []
      },
      {
        label: 'Base Infrastructure',
        icon: 'fence',
        childs: []
      }
      ,
      {
        label: 'Photos / Videos',
        icon: 'photo_camera',
        childs: []
      }
      ,
      {
        label: 'Registered Images',
        icon: 'satellite_alt',
        childs: []
      }
    ]
  })
  // getters: {
  //   doubleCount: (state) => state.counter * 2,
  // },
  // actions: {
  //   increment() {
  //     this.counter++;
  //   },
  // },
});
