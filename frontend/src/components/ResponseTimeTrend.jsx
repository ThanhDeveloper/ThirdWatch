import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
} from "@material-tailwind/react";
import Chart from 'react-apexcharts';
import { 
  getStatusColor, 
  HEALTH_STATUS 
} from '@/services/healthCheckService';

/**
 * Component hiển thị response time trend với mini sparkline
 * @param {Array} healthHistory - Lịch sử health check
 * @param {string} endpointId - ID của endpoint
 */
export function ResponseTimeTrend({ healthHistory, endpointId }) {
  const [chartData, setChartData] = useState({ series: [], options: {} });

  useEffect(() => {
    if (!healthHistory || healthHistory.length === 0) return;

    // Lọc data cho endpoint này
    const endpointData = healthHistory.filter(item => item.id === endpointId);
    
    if (endpointData.length === 0) return;

    // Chuẩn bị data cho chart
    const responseTimeData = endpointData.map(item => item.responseTime).slice(-10); // Lấy 10 điểm gần nhất
    const timeLabels = endpointData.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }).slice(-10);

    // Xác định màu sắc dựa trên status cuối cùng
    const lastStatus = endpointData[endpointData.length - 1]?.status || HEALTH_STATUS.DOWN;
    const statusConfig = getStatusColor(lastStatus);
    
    let chartColor = '#10B981'; // green
    if (lastStatus === HEALTH_STATUS.WARNING) chartColor = '#F59E0B'; // yellow
    if (lastStatus === HEALTH_STATUS.DOWN) chartColor = '#EF4444'; // red

    const options = {
      chart: {
        type: 'line',
        height: 60,
        sparkline: {
          enabled: true
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3,
        colors: [chartColor]
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.1,
          stops: [0, 100],
          colorStops: [{
            offset: 0,
            color: chartColor,
            opacity: 0.7
          }, {
            offset: 100,
            color: chartColor,
            opacity: 0.1
          }]
        }
      },
      markers: {
        size: 0,
        hover: {
          size: 6
        }
      },
      tooltip: {
        enabled: true,
        theme: 'dark',
        x: {
          show: false
        },
        y: {
          formatter: function(value) {
            return value + 'ms';
          }
        },
        marker: {
          show: false
        }
      },
      grid: {
        show: false
      },
      xaxis: {
        labels: {
          show: false
        },
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        }
      },
      yaxis: {
        labels: {
          show: false
        }
      }
    };

    setChartData({
      series: [{
        name: 'Response Time',
        data: responseTimeData
      }],
      options
    });

  }, [healthHistory, endpointId]);

  if (!chartData.series.length) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-1">
        <Typography variant="small" className="text-gray-600 text-xs font-medium">
          Response Trend
        </Typography>
        <Typography variant="small" className="text-gray-500 text-xs">
          Last 10 checks
        </Typography>
      </div>
      <div className="h-12 w-full">
        <Chart
          options={chartData.options}
          series={chartData.series}
          type="line"
          height={48}
        />
      </div>
    </div>
  );
}

export default ResponseTimeTrend;