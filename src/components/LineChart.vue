<template>
  <Line
    ref="chart"
    v-if="chartData.labels"
    :chart-options="chartOptions"
    :chart-data="chartData"
    :chart-id="chartId"
    :dataset-id-key="datasetIdKey"
    :plugins="plugins"
    :css-classes="cssClasses"
    :styles="styles"
    :width="width"
    :height="height"
    :style="style"
  />
</template>

<script>
import { defineComponent, computed, ref } from "vue";
import getValueStyle from "src/utils.js";
import { Line } from "vue-chartjs";
import { useMapStore } from "src/stores/map-store";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler
);

export default defineComponent({
  name: "LineChart",
  components: { Line },
  props: {
    chartId: {
      type: String,
      default: "bar-chart",
    },
    datasetIdKey: {
      type: String,
      default: "label",
    },
    width: {
      type: Number,
      default: 400,
    },
    height: {
      type: Number,
      default: 400,
    },
    cssClasses: {
      default: "",
      type: String,
    },
    feature: {
      type: Object,
      default: () => {},
    },
    style: {
      type: String,
    },
    styles: {
      type: Object,
      default: () => {},
    },
    plugins: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const $store = useMapStore();
    const chart = ref(null);

    const chartData = computed(() => {
      if (!$store.selectedFeature)
        return {
          labels: [],
          datasets: [],
        };
      const layer = $store.selectedFeature.feature.properties.layer;
      const wellID = $store.selectedFeature.feature.properties.Well_ID;
      const analyte = layer.template.analyte;
      const matrix = layer.matrix;
      const data = tcedata.filter((item) => {
        return (
          item.Well_ID === wellID &&
          item.Analyte === analyte &&
          item.Matrix === matrix
        );
      });
      return {
        labels: data.map((item) => item.date),
        datasets: [
          {
            label: layer.template.label,
            data: data.map((item) => item.close),
          },
        ],
      };
    });

    return {
      chart,
      chartData,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        fill: "origin",
        pointHitRadius: 100,
        pointRadius: 6,
        pointHoverRadius: 10,
        tension: 0.5,
        showLine: false,
        backgroundColor: "#e0e5d0",
        pointBackgroundColor: (context) => {
          if (!$store.selectedFeature) return "#FFF";
          const value = context.dataset.data[context.dataIndex];
          const style = getValueStyle(
            value,
            $store.selectedFeature.feature.properties.layer.template
          );
          return style.fillColor;
        },
        scales: {
          xAxis: {
            grid: {
              display: false,
            },
          },
        },
      },
    };
  },
});
</script>
