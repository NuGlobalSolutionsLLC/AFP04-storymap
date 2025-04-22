import { defineStore } from "pinia";
import { useRouter } from "vue-router";
const router = useRouter();

const makeLayer = (label, file) => {
  return {
    label: label,
    file: file,
    class: "a",
    active: false,
  };
};

const makeStyle = (custom) => {
  if (!custom) custom = {};
  return Object.assign(
    {
      weight: 3,
      color: "#f2ee00",
      opacity: 1,
      fill: "#FFF0",
      fillOpacity: 0,
    },
    custom
  );
};

const makeRedStyle = () => {
  return () => {
    return makeStyle({
      color: "#ff0000",
    });
  };
};

const makePlumeStyle = (custom) => {
  if (!custom) custom = {};
  return Object.assign(
    {
      opacity: 1,
      color: "rgb(165,165,165)",
      dashArray: "",
      lineCap: "butt",
      lineJoin: "miter",
      weight: 1.0,
      fill: true,
      fillOpacity: 1,
    },
    custom
  );
};

const makePotStyle = (custom) => {
  if (!custom) custom = {};
  return Object.assign(
    {
      opacity: 1,
      color: "#00a1bd",
      dashArray: "",
      lineCap: "butt",
      lineJoin: "miter",
      weight: 2.0,
      fill: true,
      fillOpacity: 1,
      fillColor: "rgba(82, 165, 237,0.0)",
    },
    custom
  );
};

const TEMPLATES = {
  transect: {
    label: "Transect Lines",
    legend: true,
    popup: (feature) => {
      const props = feature.feature.properties;
      return `
        <h6>Transect ${props.Name}</h6>
        <p>Click <a href="${props.hyperlink}" target="_blank"><b>here</b></a> to open Cross-Section Interactive Page.</p>
      `;
    },
    colorRampType: "category",
    limits: ["AA", "BB", "CC", "DD", "EE", "FF"],
    labels: [
      "Transect AA",
      "Transect BB",
      "Transect CC",
      "Transect DD",
      "Transect EE",
      "Transect FF",
    ],
    colors: ["#f56725", "#e0f525", "#1cad21", "#1c58ad", "#c149c9", "#64f5fa"],
    style: (feature) => {
      // if (
      //   feature.properties.layer.style &&
      //   feature.properties.layer.label !== "Transect Lines"
      // ) {
      //   return feature.properties.layer.style(feature);
      // }
      const props = feature.properties;
      let color;
      if (props.Name === "AA") color = "#f56725";
      else if (props.Name === "BB") color = "#e0f525";
      else if (props.Name === "CC") color = "#1cad21";
      else if (props.Name === "DD") color = "#1c58ad";
      else if (props.Name === "EE") color = "#c149c9";
      else if (props.Name === "FF") color = "#64f5fa";
      else color = "#FF0000";
      return {
        color: color,
        weight: 5,
      };
    },
  },
  tce: {
    label: "Trichloroethylene",
    analyte: "Trichloroethylene",
    limits: [5, 50, 100, 400, 1000, 5000, 10000],
    colors: [
      "rgba(0,255,0,1.0)",
      "rgba(0,255,197,1.0)",
      "rgba(233,255,190,1.0)",
      "rgba(255,255,0,1.0)",
      "rgba(255,235,175,1.0)",
      "rgba(255,170,0,1.0)",
      "rgba(255,0,0,1.0)",
      "rgba(132,0,168,1.0)",
    ],
    style: () => {
      return {
        radius: 6,
        color: "black",
        weight: 1,
      };
    },
  },
  cis: {
    label: "Dichloroethylene",
    analyte: "cis-1,2-Dichloroethylene",
    limits: [5, 70, 700, 7000, 10000, 70000, 140000],
    colors: [
      "rgba(0,255,0,1.0)",
      "rgba(0,255,0,1.0)",
      "rgba(233,255,190,1.0)",
      "rgba(255,255,0,1.0)",
      "rgba(255,235,175,1.0)",
      "rgba(255,170,0,1.0)",
      "rgba(255,0,0,1.0)",
      "rgba(132,0,168,1.0)",
    ],
  },
  vinyl: {
    label: "Vinyl chloride",
    analyte: "Vinyl chloride",
    limits: [2, 20, 200, 1000, 20000, 100000],
    colors: [
      "rgba(0,255,0,1.0)",
      "rgba(233,255,190,1.0)",
      "rgba(255,255,0,1.0)",
      "rgba(255,235,175,1.0)",
      "rgba(255,170,0,1.0)",
      "rgba(255,0,0,1.0)",
      "rgba(132,0,168,1.0)",
    ],
  },
  ethane: {
    label: "Ethane",
    analyte: "Ethane",
    limits: [2, 20, 200, 1000, 20000, 100000],
    colors: [
      "rgba(0,255,0,1.0)",
      "rgba(233,255,190,1.0)",
      "rgba(255,255,0,1.0)",
      "rgba(255,235,175,1.0)",
      "rgba(255,170,0,1.0)",
      "rgba(255,0,0,1.0)",
      "rgba(132,0,168,1.0)",
    ],
  },
  ethene: {
    label: "Ethene",
    analyte: "Ethene",
    limits: [60, 259, 586, 1240],
    colors: [
      "rgba(56,168,0,1.0)",
      "rgba(139,209,0,1.0)",
      "rgba(255,255,0,1.0)",
      "rgba(255,128,0,1.0)",
      "rgba(255,0,0,1.0)",
    ],
  },
  chromiumVI: {
    label: "Chromium",
    analyte: "Chromium (VI)",
    limits: [0, 12, 56],
    colors: [
      "rgba(56,168,0,1.0)",
      "rgba(139,209,0,1.0)",
      "rgba(255,128,0,1.0)",
      "rgba(255,0,0,1.0)",
    ],
  },
  chromium: {
    label: "Chromium",
    analyte: "Chromium (Total)",
    limits: [100, 3650, 9040, 19000],
    colors: [
      "rgba(56,168,0,1.0)",
      "rgba(139,209,0,1.0)",
      "rgba(255,255,0,1.0)",
      "rgba(255,128,0,1.0)",
      "rgba(255,0,0,1.0)",
    ],
  },
  c13: {
    label: "c13",
    analyte: null,
    limits: [-29, -27, -26, -24, -21],
    colors: [
      "rgba(56,168,0,1.0)",
      "rgba(139,209,0,1.0)",
      "rgba(255,255,0,1.0)",
      "rgba(255,128,0,1.0)",
      "rgba(255,0,0,1.0)",
    ],
  },
  sotce: {
    label: "Trichloroethylene",
    analyte: "Trichloroethylene",
    limits: [12, 100, 1000, 10000, 50000, 100000],
    colors: [
      "rgba(0,255,0,1.0)",
      "rgba(233,255,190,1.0)",
      "rgba(255,255,0,1.0)",
      "rgba(255,235,175,1.0)",
      "rgba(255,170,0,1.0)",
      "rgba(255,0,0,1.0)",
      "rgba(132,0,168,1.0)",
    ],
  },
  sodce: {
    label: "Dichloroethylene",
    analyte: "cis-1,2-Dichloroethylene",
    limits: [100, 500, 900],
    colors: [
      "rgba(0,255,0,1.0)",
      "rgba(255,255,0,1.0)",
      "rgba(255,128,0,1.0)",
      "rgba(255,0,0,1.0)",
    ],
  },
  sovinyl: {
    label: "Vinyl chloride",
    analyte: "Vinyl chloride",
    limits: [0, 5],
    colors: ["rgba(0,200,0,1.0)", "rgba(255,255,0,1.0)", "rgba(255,0,0,1.0)"],
    tooltip: (feature) => {
      const props = feature.feature.properties;
      return `Well ID: ${props.Well_ID}<br>Result: ${props.Result} μg/kg<br/>Date: ${props.SDate}`;
    },
    units: "μg/kg",
  },
  setce: {
    label: "Trichloroethylene",
    analyte: "Trichloroethylene",
    limits: [0, 44],
    colors: ["rgba(0,200,0,1.0)", "rgba(255,255,0,1.0)", "rgba(255,0,0,1.0)"],
    tooltip: (feature) => {
      const props = feature.feature.properties;
      return `Well ID: ${props.Well_ID}<br>Result: ${props.Result} μg/kg<br/>Date: ${props.SDate}`;
    },
    units: "μg/kg",
  },
  swtce: {
    label: "Trichloroethylene",
    analyte: "Trichloroethylene",
    limits: [1000, 10000, 100000, 500000, 10000000],
    colors: [
      "rgba(0,255,0,1.0)",
      "rgba(233,255,190,1.0)",
      "rgba(255,255,0,1.0)",
      "rgba(255,170,0,1.0)",
      "rgba(255,0,0,1.0)",
      "rgba(132,0,168,1.0)",
    ],
  },
  swdce: {
    label: "Dichloroethylene",
    analyte: "cis-1,2-Dichloroethylene",
    limits: [70, 100, 140, 260, 430],
    colors: [
      "rgba(0,255,0,1.0)",
      "rgba(233,255,190,1.0)",
      "rgba(255,255,0,1.0)",
      "rgba(255,170,0,1.0)",
      "rgba(255,0,0,1.0)",
      "rgba(132,0,168,1.0)",
    ],
  },
  swvinyl: {
    label: "Vinyl chloride",
    analyte: "Vinyl chloride",
    limits: [2, 200, 2000, 20000, 200000],
    colors: [
      "rgba(0,255,0,1.0)",
      "rgba(233,255,190,1.0)",
      "rgba(255,255,0,1.0)",
      "rgba(255,170,0,1.0)",
      "rgba(255,0,0,1.0)",
      "rgba(132,0,168,1.0)",
    ],
  },
  pot: {
    style: (feature) => {
      if (feature.properties.Color == 100) return makePotStyle();
      else if (feature.properties.Color == 210) {
        return makePotStyle({
          color: "#7000f0",
          dashArray: "4 3",
        });
      } else {
        return makePotStyle({
          color: "#00000000",
        });
      }
    },
    style_mp: (feature) => {
      if (feature.properties.Color == 130) return makePotStyle();
      else if (feature.properties.Color == 90) {
        return makePotStyle({
          color: "#7000f0",
          dashArray: "4 3",
        });
      } else {
        return makePotStyle({
          color: "#00000000",
        });
      }
    },
    style_ta: (feature) => {
      if (feature.properties.Color == 140) return makePotStyle();
      else if (feature.properties.Color == 24) {
        return makePotStyle({
          color: "#7000f0",
          dashArray: "4 3",
        });
      } else {
        return makePotStyle({
          color: "#00000000",
        });
      }
    },
  },
  pot_labels: {
    limits: [10000],
    colors: ["rgba(0,255,0,0)", "rgba(0,255,197,0)"],
    style: () => {
      return {
        radius: 1,
        color: "#FFFFFF00",
        weight: 1,
      };
    },
  },
};

const LAYERS = {
  MeanderingRoadCreek: Object.assign(
    makeLayer("Meandering Road Creek", "BIMeanderingRoadCreek7.json"),
    {
      tooltip: "Meandering Road Creek",
      tooltipOffset: [-140, -40],
      style: () => {
        return makeStyle({
          weight: 5,
          color: "#006aff",
          opacity: 0.9,
        });
      },
    }
  ),
  AFP4Boundary: Object.assign(
    makeLayer("AFP4 Boundary", "BIAFP4Boundary3.json"),
    {
      tooltip: "AFP4",
      // tooltipOffset: [-60, -400],
      tooltipOffset: [-60, 0],
      style: () => {
        return makeStyle();
      },
    }
  ),
  NASFWBoundary: Object.assign(
    makeLayer("NASFW boundary", "BINASFWboundary2.json"),
    {
      style: () => {
        return makeStyle({
          color: "#fc1ed0",
        });
      },
    }
  ),
  NASFW_N: Object.assign(
    makeLayer("North Boundary - Lake Worth", "storymap/s1_NASFW_N.json"),
    {
      tooltip: "Lake worth",
      tooltipOffset: [40, -80],
      style: () => {
        return makeStyle({
          color: "#ff6f00",
        });
      },
      dependencies: ["NASFWBoundary"],
    }
  ),
  NASFW_E: Object.assign(
    makeLayer(
      "East Boundary - Naval Air Station Fort Worth Joint Base",
      "storymap/s1_NASFW_E.json"
    ),
    {
      tooltip: "Naval Air Station",
      tooltipOffset: [40, -80],
      style: () => {
        return makeStyle({
          color: "#ff6f00",
        });
      },
      dependencies: ["NASFWBoundary"],
    }
  ),
  NASFW_SW: Object.assign(
    makeLayer(
      "South West Boundary - White Settlement",
      "storymap/s1_NASFW_SW.json"
    ),
    {
      tooltip: "White Settlement",
      tooltipOffset: [-140, 80],
      style: () => {
        return makeStyle({
          color: "#ff6f00",
        });
      },
      dependencies: ["NASFWBoundary"],
    }
  ),
  LF_01: Object.assign(
    makeLayer("French Drains 1 and 2", "storymap/s2_LF01.json"),
    {
      tooltip: "LF 1",
      tooltipOffset: [10, 0],
      style: makeRedStyle(),
    }
  ),
  LF_03: Object.assign(makeLayer("Landfill 3", "storymap/s2_LF03.json"), {
    tooltip: "LF 3",
    tooltipOffset: [-50, -50],
    style: makeRedStyle(),
  }),
  LF_04: Object.assign(makeLayer("Landfill 4", "storymap/s2_LF04.json"), {
    tooltip: "LF 4",
    tooltipOffset: [-40, -40],
    style: makeRedStyle(),
  }),
  CP_03: Object.assign(makeLayer("Chrome Pit 3", "storymap/s2_DP12.json"), {
    tooltip: "CP 3",
    tooltipOffset: [-55, -10],
    style: makeRedStyle(),
  }),
  B_181: Object.assign(makeLayer("Building 181", "storymap/s2_B181.json"), {
    tooltip: "Building 181",
    tooltipOffset: [-100, 10],
    style: makeRedStyle(),
  }),
  Window: Object.assign(
    makeLayer("Window Area", "storymap/s2_WindowArea.json"),
    {
      tooltip: "Window Area",
      tooltipOffset: [-30, 40],
      style: makeRedStyle(),
    }
  ),
  OTTO_22: Object.assign(makeLayer("OTTO22", "storymap/s2_CarswellPBR.json"), {
    tooltip: "OTTO22",
    tooltipOffset: [100, 10],
    style: makeRedStyle(),
    dependencies: ["Window"],
  }),
  TCE_2010: Object.assign(
    makeLayer(
      "TCE Concentrations: 2010 to present",
      "storymap/s3_CIS12DCE_lt_2010.json"
    ),
    {
      matrix: "GW",
      class: "chemdata",
      template: TEMPLATES.tce,
      style: () => {
        return makeStyle({
          radius: 6,
          color: "black",
          weight: 1,
        });
      },
    }
  ),
  DCE_2010: Object.assign(
    makeLayer(
      "cis-1,2-DCE Concentrations: 2010 to present",
      "storymap/s3_CIS12DCE_lt_2010.json"
    ),
    {
      matrix: "GW",
      class: "chemdata",
      template: TEMPLATES.cis,
      style: () => {
        return makeStyle({
          radius: 6,
          color: "black",
          weight: 1,
        });
      },
    }
  ),
  VC_2010: Object.assign(
    makeLayer(
      "VC Concentrations: 2010 to present",
      "storymap/s3_VC_lt_2010.json"
    ),
    {
      matrix: "GW",
      class: "chemdata",
      template: TEMPLATES.vinyl,
      style: () => {
        return makeStyle({
          radius: 6,
          color: "black",
          weight: 1,
        });
      },
    }
  ),
  Terrace_TCE: Object.assign(
    makeLayer("Terrace TCE 2023", "storymap/s4_Terrace_TCE_2023.json"),
    {
      class: "plumes",
      style: () => {
        return makePlumeStyle({
          fillColor: "rgb(255,0,0, 0.6)",
        });
      },
    }
  ),
  Terrace_cDCE: Object.assign(
    makeLayer("Terrace cDCE 2023", "storymap/s4_Terrace_cDCE_2023.json"),
    {
      class: "plumes",
      style: () => {
        return makePlumeStyle({
          fillColor: "rgba(206,115,0,0.6)",
        });
      },
    }
  ),
  Terrace_VC: Object.assign(
    makeLayer("Terrace VC 2023", "storymap/s4_Terrace_VC_2023.json"),
    {
      class: "plumes",
      style: () => {
        return makePlumeStyle({
          fillColor: "rgba(253,217,0,0.6)",
        });
      },
    }
  ),
  SC_TCE: Object.assign(
    makeLayer("Sand Channel TCE 2023", "storymap/s4_SandChannel_TCE_2023.json"),
    {
      class: "plumes",
      style: () => {
        return makePlumeStyle({
          fillColor: "rgba(0,255,21,0.6)",
        });
      },
    }
  ),
  SC_VC: Object.assign(
    makeLayer("Sand Channel VC 2023", "storymap/s4_SandChannel_VC_2023.json"),
    {
      class: "plumes",
      style: () => {
        return makePlumeStyle({
          fillColor: "rgba(0,155,21,0.6)",
        });
      },
    }
  ),
  SC_cDCE: Object.assign(
    makeLayer(
      "Sand Channel cDCE 2023",
      "storymap/s4_SandChannel_cDCE_2023.json"
    ),
    {
      class: "plumes",
      style: () => {
        return makePlumeStyle({
          fillColor: "rgba(163,238,0,0.6)",
        });
      },
    }
  ),
  Paluxy_TCE: Object.assign(
    makeLayer("Paluxy TCE 2023", "storymap/s4_Paluxy_TCE_2023.json"),
    {
      class: "plumes",
      style: () => {
        return makePlumeStyle({
          fillColor: "rgba(0,41,255,0.6)",
        });
      },
    }
  ),
  Paluxy_VC: Object.assign(
    makeLayer("Paluxy VC 2023", "storymap/s4_Paluxy_VC_2023.json"),
    {
      class: "plumes",
      style: () => {
        return makePlumeStyle({
          fillColor: "rgba(148,0,255,0.6)",
        });
      },
    }
  ),
  Paluxy_cDCE: Object.assign(
    makeLayer("Paluxy cDCE 2023", "storymap/s4_Paluxy_cDCE_2023.json"),
    {
      class: "plumes",
      style: () => {
        return makePlumeStyle({
          fillColor: "rgba(155,111,255,0.6)",
        });
      },
    }
  ),
  Transect: Object.assign(
    makeLayer("Transect Lines", "TranLineSeries214.json"),
    {
      class: "transects",
      style: TEMPLATES.transect.style,
      hoverStyle: {
        weight: 7,
        color: "#e1e1e1",
      },
      options: {
        style: TEMPLATES.transect.style,
        tooltip: TEMPLATES.transect.tooltip,
      },
      template: TEMPLATES.transect,
    }
  ),
  POT_UP_LABELS: Object.assign(
    makeLayer(
      "[LABELS] Upper Paluxy and Sand Channels",
      "storymap/s9_POT_UP_LABELS.json"
    ),
    {
      class: "labels",
      tooltip: (feature) => {
        return feature.properties.text;
      },
      tooltipOffset: [10, -20],
      template: TEMPLATES.pot_labels,
      style: () => {
        return makeStyle({
          color: "black",
        });
      },
    }
  ),
  POT_UP: Object.assign(
    makeLayer("Upper Paluxy and Sand Channels", "storymap/s9_POT_UP.json"),
    {
      class: "a",
      style: TEMPLATES.pot.style,
      hoverStyle: {
        weight: 7,
        color: "#e1e1e1",
      },
      options: {
        style: TEMPLATES.pot.style,
        // tooltip: TEMPLATES.transect.tooltip,
      },
      template: TEMPLATES.pot,
      dependencies: ["POT_UP_LABELS"],
    }
  ),
  POT_MP_LABELS: Object.assign(
    makeLayer("[LABELS] Middle Paluxy", "storymap/s9_POT_MP_LABELS.json"),
    {
      class: "labels",
      tooltip: (feature) => {
        return feature.properties.text;
      },
      tooltipOffset: [10, -20],
      template: TEMPLATES.pot_labels,
      style: () => {
        return makeStyle({
          color: "black",
        });
      },
    }
  ),
  POT_MP: Object.assign(makeLayer("Middle Paluxy", "storymap/s9_POT_MP.json"), {
    class: "a",
    style: TEMPLATES.pot.style_mp,
    hoverStyle: {
      weight: 7,
      color: "#e1e1e1",
    },
    options: {
      style: TEMPLATES.pot.style_mp,
    },
    template: TEMPLATES.pot,
    dependencies: ["POT_MP_LABELS"],
  }),
  POT_TA_LABELS: Object.assign(
    makeLayer("[LABELS] TA", "storymap/s9_POT_TA_LABELS.json"),
    {
      class: "labels",
      tooltip: (feature) => {
        return feature.properties.text;
      },
      tooltipOffset: [10, -20],
      template: TEMPLATES.pot_labels,
      style: () => {
        return makeStyle({
          color: "black",
        });
      },
    }
  ),
  POT_TA: Object.assign(makeLayer("TA", "storymap/s9_POT_TA.json"), {
    class: "a",
    style: TEMPLATES.pot.style_ta,
    hoverStyle: {
      weight: 7,
      color: "#e1e1e1",
    },
    options: {
      style: TEMPLATES.pot.style_ta,
    },
    template: TEMPLATES.pot,
    dependencies: ["POT_TA_LABELS"],
  }),
  AFP4BoundaryS2: null,
  NASFWBoundaryS2: null,
  MeanderingRoadCreekNoTooltip: null,
};

function override(extend, props) {
  const newLayer = Object.create(extend);
  for (let prop in props) {
    newLayer[prop] = props[prop];
  }
  return newLayer;
}

LAYERS.AFP4BoundaryS2 = override(LAYERS.AFP4Boundary, {
  tooltip: false,
  style: () => {
    return Object.assign(makeStyle(), { opacity: 0.5 });
  },
});

LAYERS.NASFWBoundaryS2 = override(LAYERS.NASFWBoundary, {
  tooltip: false,
  style: () => {
    return Object.assign(makeStyle(), { color: "#fc1ed0", opacity: 0.5 });
  },
});

LAYERS.MeanderingRoadCreekNoTooltip = override(LAYERS.MeanderingRoadCreek, {
  tooltip: false,
});

export const useStorymapStore = defineStore("storymap-store", {
  state: () => ({
    defaultMapCenter: [32.7713, -97.4366],
    defaultMapZoom: 14,
    lastClickedLayer: null,
    lastRemovedLayer: null,
    returnUrl: "",
    leftDrawerOpen: true,
    layers: LAYERS,
    activeTooltips: [],
    slides: [
      {
        title: "Air Force Plant 4. <br>A Walk Through",
        buttons: [
          {
            label: "Start",
            icon: "keyboard_double_arrow_down",
          },
        ],
        icon: "home",
        active: true,
      },
      {
        title: "A Basewide Overview of Environmental Conditions",
        description: [
          `AFP4 became operational in 1942 with the manufacturing of the B-24
          bomber for national defense during World War II. The plant has since
          produced B-36, B-58, F-111, F-16, and F-35 aircraft. Throughout most
          of AFP4’s history, waste oil, solvents, and fuels were disposed at
          onsite landfills or burned during fire training exercises. These
          practices, which have been discontinued, resulted in site-wide soil
          and groundwater contamination. These contaminated areas have been
          identified and have been, and are currently being, remediated in
          accordance with applicable regulations.`,
          `AFP4 is currently operated by Lockheed Martin Aeronautics (LM Aero),
          and is used for the production of military aircraft, radar units,
          and various aircraft and missile components. The facility shares
          active runways and taxiways with NASFW.`,
        ],
        contextLayers: [LAYERS.MeanderingRoadCreek],
        layers: [
          LAYERS.AFP4Boundary,
          LAYERS.NASFW_N,
          LAYERS.NASFW_E,
          LAYERS.NASFW_SW,
        ],
      },
      {
        title: "Environmental Investigation History",
        description: [
          `Environmental Investigations began in 1982. Since then, a series of
          focused site investigations, pilot studies and remediation efforts
          have been completed. Currently there are six active sites on base
          and include the following:`,
        ],
        contextLayers: [
          LAYERS.MeanderingRoadCreekNoTooltip,
          LAYERS.AFP4BoundaryS2,
          LAYERS.NASFWBoundaryS2,
        ],
        layers: [
          LAYERS.LF_01,
          LAYERS.LF_03,
          LAYERS.LF_04,
          LAYERS.CP_03,
          LAYERS.B_181,
          LAYERS.OTTO_22,
        ],
      },
      {
        title: "Current Conditions",
        description: [
          `Contamination detected in groundwater has been measured since 1982.
          Several remediation strategies have been implemented to reduce over
          all concentrations.`,
        ],
        contextLayers: [LAYERS.AFP4BoundaryS2, LAYERS.NASFWBoundaryS2],
        layers: [LAYERS.TCE_2010, LAYERS.DCE_2010, LAYERS.VC_2010],
      },
      {
        title: "Current Groundwater Plumes",
        description: [],
        contextLayers: [LAYERS.AFP4BoundaryS2, LAYERS.NASFWBoundaryS2],
        layers: [
          LAYERS.Terrace_TCE,
          LAYERS.Terrace_cDCE,
          LAYERS.Terrace_VC,
          LAYERS.SC_TCE,
          LAYERS.SC_VC,
          LAYERS.SC_cDCE,
          LAYERS.Paluxy_TCE,
          LAYERS.Paluxy_VC,
          LAYERS.Paluxy_cDCE,
        ],
      },
      {
        title: "The Conceptual Site Model",
        description: [
          `In 2017, AECOM completed a conceptual site model looking at regional
          stratigraphy, identification of water bearing units and assessment of
          groundwater flow within each water bearing unit. The CSM identified
          four stratagraphic units that dictate groundwater flow:`,
        ],
        actions: [
          {
            label: "Model Chart",
            title: "The Conceptual Site Model",
            action: {
              type: "modal",
              content: [
                {
                  img: "img/s5_6.png",
                },
              ],
            },
          },
        ],
      },
      {
        title: "Lithologic Evaluation",
        description: [
          `Seven hydro-stratigraphic cross sections were developed to better
          understand fate and transport of contamination.`,
        ],
        contextLayers: [LAYERS.AFP4BoundaryS2, LAYERS.NASFWBoundaryS2],
        layers: [LAYERS.Transect],
      },
      {
        title: "Groundwater Potentiometric Surfaces",
        description: [
          `Groundwater Potentiometric surface maps are developed yearly and
          help predict concentration migration. Understanding the potential of
          groundwater to flow in a certain direction supports the selection of
          groundwater wells to be sampled. Sampling results show that off-base
          production wells located in the Paluxy Formation are consistently
          protected from on-base contamination.`,
        ],
        contextLayers: [LAYERS.AFP4BoundaryS2, LAYERS.NASFWBoundaryS2],
        layers: [LAYERS.POT_UP, LAYERS.POT_MP, LAYERS.POT_TA],
      },
      {
        title: "AFP4 Summary",
        description: [
          `Several remedial systems have been implemented at AFP4 and NASFW over
          the past two decades, including groundwater treatment systems, electrical
          resistance heating, dense non-aqueous phase liquid (i.e., pure phase
          contaminant) recovery, a biowall, a permeable reactive barrier, and
          multiple amendment injection campaigns. Currently, remediation by
          monitored natural attenuation and enhanced natural source zone
          depletion are being evaluated. Long term monitoring activities are
          conducted on a regular basis to assist in determining the effectiveness
          of the various treatment systems, and to monitor plume contaminant
          concentrations, size, and location. Groundwater monitoring analytical
          data and analyses of contaminant trends over the past two decades
          indicate that ongoing natural attenuation is contributing to the
          remediation of TCE and its degradation products in all contaminated
          groundwater bearing zones.`,
          `<strong>Proposed plan</strong><br><a href="https://ar.afcec-cloud.af.mil/"
          target="_blank">https://ar.afcec-cloud.af.mil/</a> (AR#13154)`,
        ],
      },
    ],
    selectedFeature: null,
    sections: {
      labels: {},
      a: {},
      chemdata: {
        legend: true,
        color: "black",
        opacity: 1,
        hoverStyle: {
          fillOpacity: 0.8,
          radius: 10,
        },
        units: "μg/L",
        tooltip: (feature) => {
          const props = feature.feature.properties;
          return `Well ID: ${props.Well_ID}<br>Result: ${props.Result} μg/L<br/>Date: ${props.SDate}`;
        },
      },
      plumes: {
        opacity: 1,
        color: "rgb(165,165,165)",
        dashArray: "",
        lineCap: "butt",
        lineJoin: "miter",
        weight: 1.0,
        fill: true,
        fillOpacity: 1,
        tooltip: (feature) => {
          const props = feature.feature.properties;
          return props.Name;
        },
      },
      transects: {
        legend: false,
        color: "#e0f525",
        fillColor: "#f4d442",
        weight: 5,
        radius: 6,
        fillOpacity: 1,
        tooltip: (feature) => {
          return `<p>Transect ${feature.feature.properties.Name}</p>`;
        },
        popup: (feature) => {
          const props = feature.feature.properties;
          return `
            <h6>${props.name}</h6>
            <p><img width="600" height="400" src="${props.urlhtml}" alt="${props.Name}"></p>
          `;
        },
      },
      wells: {
        legend: false,
        color: "black",
        fillColor: "#9eeb34",
        radius: 6,
        opacity: 1,
        fillOpacity: 1,
        weight: 1,
        hoverStyle: {
          fillOpacity: 0.8,
          radius: 10,
        },
        tooltip: (feature) => {
          const props = feature.feature.properties;
          return `Well ID: ${props.Well_ID}`;
        },
      },
      bi: {
        weight: 5,
        color: "#006aff",
        opacity: 0.9,
        hoverStyle: {
          weight: 7,
          color: "#e1e3dc",
        },
      },
      media: {
        color: "#e3eb7a",
        fillColor: "transparent",
        weight: 5,
        radius: 6,
        opacity: 0.9,
        hoverStyle: {
          radius: 10,
          color: "#e1e3dc",
        },
        fillOpacity: 1,
      },
    },
  }),
  getters: {
    getSelectedFeatureStyle: (state) => {
      const feature = state.selectedFeature.feature;
      const template = state.selectedFeature.options;
      const step = template.limits.find((limit) => {
        return feature.properties.Result <= limit;
      });
      const index = template.limits.indexOf(step);
      const color =
        index !== -1
          ? template.colors[index]
          : template.colors[template.colors.length - 1];
      return Object.assign(template, {
        fillColor: color,
        fillOpacity: 1,
        radius: 6,
        weight: 1,
      });
    },
  },
  actions: {
    async saveLoginState(username) {
      const now = new Date();
      const expires = now.getTime() + this.expiration_length * 60000;
      this.user = {
        name: username,
        expires: expires,
      };
      localStorage.setItem("user", username);
      localStorage.setItem("expires", expires);
    },
    saveLogoutState() {
      this.user = { name: null, expires: new Date() };
      localStorage.setItem("user", null);
      localStorage.setItem("expires", new Date());
    },
  },
});