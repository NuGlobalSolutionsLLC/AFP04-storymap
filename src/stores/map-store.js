import { defineStore } from 'pinia';

const TEMPLATES = {
  tce: {
    label: 'Trichloroethylene',
    analyte: 'Trichloroethylene',
    color: 'black',
    opacity: 1,
    limits: [5, 50, 100, 400, 1000, 5000, 10000],
    colors: ['rgba(0,255,0,1.0)', 'rgba(0,255,197,1.0)', 'rgba(233,255,190,1.0)', 'rgba(255,255,0,1.0)',
             'rgba(255,235,175,1.0)', 'rgba(255,170,0,1.0)', 'rgba(255,0,0,1.0)', 'rgba(132,0,168,1.0)'],
    tooltip: feature => {
      const props = feature.feature.properties
      return `Well ID: ${props.Well_ID}<br>Result: ${props.Result} μg/L<br/>Date: ${props.SDate}`
    },
    units: 'μg/L',
    hoverStyle: {
      // fillColor: '#CCCCFF',
      fillOpacity: .8,
      radius: 10
    }
  },
  cis: {
    label: 'Dichloroethylene',
    analyte:  'cis-1,2-Dichloroethylene',
    color: 'black',
    opacity: 1,
    limits: [5, 70, 700, 7000, 10000, 70000, 140000],
    colors: ['rgba(0,255,0,1.0)', 'rgba(0,255,0,1.0)', 'rgba(233,255,190,1.0)',
             'rgba(255,255,0,1.0)', 'rgba(255,235,175,1.0)', 'rgba(255,170,0,1.0)',
             'rgba(255,0,0,1.0)', 'rgba(132,0,168,1.0)'],
    tooltip: feature => {
      const props = feature.feature.properties
      return `Well ID: ${props.Well_ID}<br>Result: ${props.Result} μg/L<br/>Date: ${props.SDate}`
    },
    units: 'μg/L',
    hoverStyle: {
      // fillColor: '#CCCCFF',
      fillOpacity: .8,
      radius: 10
    }
  },
  vinyl: {
    label: 'Vinyl chloride',
    analyte:  'Vinyl chloride',
    color: 'black',
    opacity: 1,
    limits: [2, 20, 200, 1000, 20000, 100000],
    colors: ['rgba(0,255,0,1.0)', 'rgba(233,255,190,1.0)',
             'rgba(255,255,0,1.0)', 'rgba(255,235,175,1.0)', 'rgba(255,170,0,1.0)',
             'rgba(255,0,0,1.0)', 'rgba(132,0,168,1.0)'],
    tooltip: feature => {
      const props = feature.feature.properties
      return `Well ID: ${props.Well_ID}<br>Result: ${props.Result} μg/L<br/>Date: ${props.SDate}`
    },
    units: 'μg/L',
    hoverStyle: {
      // fillColor: '#CCCCFF',
      fillOpacity: .8,
      radius: 10
    }
  },
  ethane: {
    label: 'Ethane',
    analyte:  'Ethane',
    color: 'black',
    opacity: 1,
    limits: [2, 20, 200, 1000, 20000, 100000],
    colors: ['rgba(0,255,0,1.0)', 'rgba(233,255,190,1.0)',
             'rgba(255,255,0,1.0)', 'rgba(255,235,175,1.0)', 'rgba(255,170,0,1.0)',
             'rgba(255,0,0,1.0)', 'rgba(132,0,168,1.0)'],
    tooltip: feature => {
      const props = feature.feature.properties
      return `Well ID: ${props.Well_ID}<br>Result: ${props.Result} μg/L<br/>Date: ${props.SDate}`
    },
    units: 'μg/L',
    hoverStyle: {
      // fillColor: '#CCCCFF',
      fillOpacity: .8,
      radius: 10
    }
  },
  ethene: {
    label: 'Ethene',
    analyte:  'Ethene',
    color: 'black',
    opacity: 1,
    limits: [60, 259, 586, 1240],
    colors: ['rgba(56,168,0,1.0)', 'rgba(139,209,0,1.0)',
             'rgba(255,255,0,1.0)', 'rgba(255,128,0,1.0)', 'rgba(255,0,0,1.0)'],
    tooltip: feature => {
      const props = feature.feature.properties
      return `Well ID: ${props.Well_ID}<br>Result: ${props.Result} μg/L<br/>Date: ${props.SDate}`
    },
    units: 'μg/L',
    hoverStyle: {
      // fillColor: '#CCCCFF',
      fillOpacity: .8,
      radius: 10
    }
  }
}


export const useMapStore = defineStore('map-store', {
  state: () => ({
    leftDrawerOpen: true,
    templates: TEMPLATES,
    selectedFeature: null,
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
            matrix: 'GW',
            template: TEMPLATES.tce
          },
          {
            label: 'TCE > 1990 in GW',
            file: 'GWTCEafter199045.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.tce
          },
          {
            label: 'TCE > 2000 in GW',
            file: 'GWTCEafter200044.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.tce
          },
          {
            label: 'TCE > 2016 in GW',
            file: 'GWTCEafter201654.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.tce
          },
          {
            label: 'TCE Max in GW',
            file: 'GWTCEMax43.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.tce
          },
          {
            label: 'TCE Terrace Alluvial in GW',
            file: 'GWTCETerrace42.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.tce
          },
          {
            label: 'TCE Walnut in GW',
            file: 'GWTCEWalnut41.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.tce
          },
          {
            label: 'TCE Upper Paluxy in GW',
            file: 'GWTCEUpperP40.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.tce
          },
          {
            label: 'TCE Middle Paluxy in GW',
            file: 'GWTCEMiddleP39.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.tce
          },
          {
            label: 'TCE Lower Paluxy in GW',
            file: 'GWTCELowerP38.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.tce
          },
          {
            label: 'Cis 1,2-DCE in GW',
            file: 'GWcis12DCE37.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.cis
          },
          {
            label: 'Cis 1,2-DCE > 2000 in GW',
            file: 'GWcis12DCEafter200036.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.cis
          },
          {
            label: 'Vinyl chloride in GW',
            file: 'GWVC35.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.vinyl
          },
          {
            label: 'Vinyl chloride > 2000 in GW',
            file: 'GWVCafter200034.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.vinyl
          },
          {
            label: 'Ethane in GW',
            file: 'GWEthane32.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.ethane
          },
          {
            label: 'Ethene in GW',
            file: 'GWEthene33.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.ethene
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
  }),
  getters: {
    getSelectedFeatureStyle: (state) => {
      const feature = state.selectedFeature.feature
      const template = state.selectedFeature.options
      const step = template.limits.find(limit => {
        return feature.properties.Result < limit
      })
      const index = template.limits.indexOf(step)
      const color = index !== -1 ? template.colors[index] : template.colors[template.colors.length - 1]
      return Object.assign(template, {
        fillColor: color,
        fillOpacity: 1,
        radius: 6,
        weight: 1
      })
    }
  },
  // actions: {
  //   increment() {
  //     this.counter++;
  //   },
  // },
});
