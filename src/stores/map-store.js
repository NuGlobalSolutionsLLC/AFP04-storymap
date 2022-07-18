import { defineStore } from 'pinia';

const TEMPLATES = {
  tce: {
    label: 'Trichloroethylene',
    analyte: 'Trichloroethylene',
    limits: [5, 50, 100, 400, 1000, 5000, 10000],
    colors: ['rgba(0,255,0,1.0)', 'rgba(0,255,197,1.0)', 'rgba(233,255,190,1.0)', 'rgba(255,255,0,1.0)',
             'rgba(255,235,175,1.0)', 'rgba(255,170,0,1.0)', 'rgba(255,0,0,1.0)', 'rgba(132,0,168,1.0)']
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
  },
  chromiumVI: {
    label: 'Chromium',
    analyte:  'Chromium (VI)',
    color: 'black',
    opacity: 1,
    limits: [0, 12, 56],
    colors: ['rgba(56,168,0,1.0)', 'rgba(139,209,0,1.0)',
             'rgba(255,128,0,1.0)', 'rgba(255,0,0,1.0)'],
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
  chromium: {
    label: 'Chromium',
    analyte:  'Chromium (Total)',
    color: 'black',
    opacity: 1,
    limits: [100, 3650, 9040, 19000],
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
  },
  c13: {
    label: 'c13',
    analyte:  null,
    color: 'black',
    opacity: 1,
    limits: [-29, -27, -26, -24, -21],
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
  },
  sotce: {
    label: 'Trichloroethylene',
    analyte:  'Trichloroethylene',
    color: 'black',
    opacity: 1,
    limits: [12, 100, 1000, 10000, 50000, 100000],
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
  sodce: {
    label: 'Dichloroethylene',
    analyte:  'cis-1,2-Dichloroethylene',
    color: 'black',
    opacity: 1,
    limits: [100, 500, 900],
    colors: ['rgba(0,255,0,1.0)', 'rgba(255,255,0,1.0)',
             'rgba(255,128,0,1.0)', 'rgba(255,0,0,1.0)'],
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
  sovinyl: {
    label: 'Vinyl chloride',
    analyte:  'Vinyl chloride',
    color: 'black',
    opacity: 1,
    limits: [0, 5],
    colors: ['rgba(0,200,0,1.0)', 'rgba(255,255,0,1.0)',
             'rgba(255,0,0,1.0)'],
    tooltip: feature => {
      const props = feature.feature.properties
      return `Well ID: ${props.Well_ID}<br>Result: ${props.Result} μg/kg<br/>Date: ${props.SDate}`
    },
    units: 'μg/kg',
    hoverStyle: {
      // fillColor: '#CCCCFF',
      fillOpacity: .8,
      radius: 10
    }
  },
  setce: {
    label: 'Trichloroethylene',
    analyte: 'Trichloroethylene',
    color: 'black',
    opacity: 1,
    limits: [0, 44],
    colors: ['rgba(0,200,0,1.0)', 'rgba(255,255,0,1.0)',
             'rgba(255,0,0,1.0)'],
    tooltip: feature => {
      const props = feature.feature.properties
      return `Well ID: ${props.Well_ID}<br>Result: ${props.Result} μg/kg<br/>Date: ${props.SDate}`
    },
    units: 'μg/kg',
    hoverStyle: {
      // fillColor: '#CCCCFF',
      fillOpacity: .8,
      radius: 10
    }
  },
  swtce: {
    label: 'Trichloroethylene',
    analyte: 'Trichloroethylene',
    color: 'black',
    opacity: 1,
    limits: [1000, 10000, 100000, 500000, 10000000],
    colors: ['rgba(0,255,0,1.0)', 'rgba(233,255,190,1.0)',
             'rgba(255,255,0,1.0)', 'rgba(255,170,0,1.0)', 'rgba(255,0,0,1.0)',
             'rgba(132,0,168,1.0)'],
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
  swdce: {
    label: 'Dichloroethylene',
    analyte:  'cis-1,2-Dichloroethylene',
    color: 'black',
    opacity: 1,
    limits: [70, 100, 140, 260, 430],
    colors: ['rgba(0,255,0,1.0)', 'rgba(233,255,190,1.0)',
             'rgba(255,255,0,1.0)', 'rgba(255,170,0,1.0)', 'rgba(255,0,0,1.0)',
             'rgba(132,0,168,1.0)'],
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
  swvinyl: {
    label: 'Vinyl chloride',
    analyte:  'Vinyl chloride',
    color: 'black',
    opacity: 1,
    limits: [2, 200, 2000, 20000, 200000],
    colors: ['rgba(0,255,0,1.0)', 'rgba(233,255,190,1.0)',
             'rgba(255,255,0,1.0)', 'rgba(255,170,0,1.0)', 'rgba(255,0,0,1.0)',
             'rgba(132,0,168,1.0)'],
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
    sections: {
      chemdata: {
        legend: true,
        color: 'black',
        opacity: 1,
        hoverStyle: {
          // fillColor: '#CCCCFF',
          fillOpacity: .8,
          radius: 10
        },
        units: 'μg/L',
        tooltip: feature => {
          const props = feature.feature.properties
          return `Well ID: ${props.Well_ID}<br>Result: ${props.Result} μg/L<br/>Date: ${props.SDate}`
        },
      },
      transects: {
        legend: false,
        color: '#e0f525',
        fillColor: '#f4d442',
        weight: 5,
        radius: 6,
        fillOpacity: 1,
        popup: feature => {
          const props = feature.feature.properties
          return `
            <h6>${props.name}</h6>
            <p><img width="600" height="400" src="${props.urlhtml}" alt="${props.Name}"></p>
          `
        },
      }
    },
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
          },
          {
            label: 'Chromium VI in GW',
            file: 'GWChromiumVI28.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.chromiumVI
          },
          {
            label: 'Total Chromium in GW',
            file: 'GWTotalChromium27.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.chromium
          },
          {
            label: 'C13 Data in GW',
            file: 'GWC13Data26.json',
            class: 'chemdata',
            active: false,
            matrix: 'GW',
            template: TEMPLATES.c13
          },
          {
            label: 'TCE in SO',
            file: 'SOTCE24.json',
            class: 'chemdata',
            active: false,
            matrix: 'SO',
            template: TEMPLATES.sotce
          },
          {
            label: 'Cis 1,2-DCE in SO',
            file: 'SOcis12DCE23.json',
            class: 'chemdata',
            active: false,
            matrix: 'SO',
            template: TEMPLATES.sodce
          },
          {
            label: 'Vinyl chloride in SO',
            file: 'SOVC22.json',
            class: 'chemdata',
            active: false,
            matrix: 'SO',
            template: TEMPLATES.sovinyl
          },
          {
            label: 'TCE in SE',
            file: 'SETCE21.json',
            class: 'chemdata',
            active: false,
            matrix: 'SE',
            template: TEMPLATES.setce
          },
          {
            label: 'TCE in SW',
            file: 'SWTCE20.json',
            class: 'chemdata',
            active: false,
            matrix: 'SW',
            template: TEMPLATES.swtce
          },
          {
            label: 'Cis 1,2-DCE in SW',
            file: 'SWcis12DCE19.json',
            class: 'chemdata',
            active: false,
            matrix: 'SW',
            template: TEMPLATES.swdce
          },
          {
            label: 'Vinyl chloride in SW',
            file: 'SWVC18.json',
            class: 'chemdata',
            active: false,
            matrix: 'SW',
            template: TEMPLATES.swvinyl
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
            class: 'transects',
            hoverStyle: {
              weight: 7,
              color: '#e1e3dc'
            }
          },
          {
            label: 'East Parking Lot & B181 CSM',
            file: 'TranLineEastParkL15.json',
            active: false,
            class: 'transects',
            template: {
              fillColor: 'transparent',
              tooltip: feature => {
                return feature.feature.properties.name
              },
              color: '#f56725',
              weight: 5,
              popup: feature => {
                const props = feature.feature.properties
                return `
                  <h6>${props.name}</h6>
                  <p>Click <a href="${props.url}" target="_blank"><b>here</b></a> to open Cross-Section Interactive Page.</p>
                `
              },
              popupOptions: {
                minWidth: 500,
                className: 'east-parking-lot-transect'
              }
            },
            hoverStyle: {
              weight: 7,
              color: '#e1e3dc'
            }
          },
          {
            label: 'Series 1 - Transect',
            file: 'transectlines0.json',
            active: false,
            class: 'transects'
          },
          {
            label: 'Series 2 - Transect',
            file: 'TranLineSeries214.json',
            active: false,
            class: 'transects'
          },
          {
            label: 'Series 3 - Transect',
            file: 'TranLineSeries313.json',
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
        return feature.properties.Result <= limit
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
