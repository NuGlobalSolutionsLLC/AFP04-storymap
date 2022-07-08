<template>
  <Line
    :chart-options="chartOptions"
    :chart-data="chartData"
    :chart-id="chartId"
    :dataset-id-key="datasetIdKey"
    :plugins="plugins"
    :css-classes="cssClasses"
    :styles="styles"
    :width="width"
    :height="height"
  />
</template>

<script>
import { defineComponent, computed } from 'vue'
import getValueStyle from 'src/utils.js'
import { Line } from 'vue-chartjs'
import { useMapStore } from 'src/stores/map-store'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Filler
)

export default defineComponent({
  name: 'LineChart',
  components: { Line },
  props: {
    chartId: {
      type: String,
      default: 'bar-chart'
    },
    datasetIdKey: {
      type: String,
      default: 'label'
    },
    width: {
      type: Number,
      default: 400
    },
    height: {
      type: Number,
      default: 400
    },
    cssClasses: {
      default: '',
      type: String
    },
    feature: {
      type: Object,
      default: () => {}
    },
    styles: {
      type: Object,
      default: () => {}
    },
    plugins: {
      type: Array,
      default: () => []
    }
  },
  setup (props) {
    const $store = useMapStore()

    const chartData = computed(() => {
      const wellID = $store.selectedFeature.feature.properties.Well_ID
      const analyte = $store.selectedFeature.options.label
      const matrix = $store.selectedFeature.layer.matrix
      const data = tcedata.filter(item => {
        return item.Well_ID === wellID && item.Analyte === analyte && item.Matrix === matrix
      })
      return {
        labels: data.map(item => item.date),
        datasets: [
          {
            label: $store.selectedFeature.options.label,
            data: data.map(item => item.close)
          }
        ]
      }
    })

    return {
      chartData,
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        fill: 'origin',
        pointHitRadius: 100,
        pointRadius: 6,
        pointHoverRadius: 10,
        tension: 0.5,
        showLine: false,
        backgroundColor: '#e0e5d0',
        pointBackgroundColor: (context) => {
          const value = context.dataset.data[context.dataIndex]
          const style = getValueStyle(value, $store.selectedFeature.options)
          return style.fillColor
        },
        scales: {
          xAxis: {
            grid: {
              display: false
            }
          }
        }
      }
    }
  }
})
</script>
