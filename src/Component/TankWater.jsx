import React, { useEffect, useState } from "react";
import "./TankWater.css";
import Chart from "react-apexcharts";
import axios from "axios";

function TankWater() {
  const [tankData, setTankData] = useState(null);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateObj) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${dayNames[dateObj.getDay()]} ${dateObj.getDate()} ${
      monthNames[dateObj.getMonth()]
    } ${dateObj.getFullYear()} ${dateObj.toLocaleTimeString()}`;
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(
          "https://hamariswari.com/api/getWaterLevel?device_id=A0B765057D38"
        );
        console.log("API Response:", res.data);
        const d = res.data;
        const tank = d.data;
        if (!tank) throw new Error("Missing .data in response");
        setTankData(tank);

        // Check where historical data is located
        const history = tank.history || tank.chartData?.series?.[0]?.data;
        console.log("History Array:", history);

        if (!Array.isArray(history) || history.length === 0) {
          console.warn("No valid history data");
          setSeries([]);
          return;
        }

        const chartPoints = history
          .map((pt) => ({
            x: new Date(Number(pt.timestamp || pt.x)),
            y: Number(pt.level || pt.y),
          }))
          .filter((pt) => !isNaN(pt.x) && !isNaN(pt.y));

        console.log("Chart Points:", chartPoints);
        setSeries([{ name: "Water Level (%)", data: chartPoints }]);
      } catch (err) {
        console.error("Fetch error:", err);
        setTankData(null);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

 const options = {
  chart: {
    type: "area",
    height: 350,
    zoom: { enabled: false },
    toolbar: { show: false },
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth" },
  xaxis: {
    type: "datetime",
    tickAmount: 24, // 👈 24 ticks (one per hour for 24 hours)
    labels: {
      datetimeUTC: false,
      format: "hh:mm ", // 12-hour format like 01:00 PM
    },
  },
  yaxis: {
    min: 0,
    max: 100,
    title: { text: "Water Level (%)" },
  },
  tooltip: {
    x: { format: "hh:mm " },
  },
};


  if (loading) return <p>Loading…</p>;
  if (!tankData)
    return <p>Failed to load data. Check console logs for format.</p>;

  return (
    <div className="Container">
      <div className="Heading">  <h1>Water Tank Monitoring System</h1></div>
    

      <div className="tank-water1">
        {/* Tank visualization */}
        <div className="tank-visualization">
          <h2>Tank Visualization</h2>
          <hr />
          <div className="tank-image">
            <div className="tank-image-upper">
               <button></button>
            </div>
            <div
              className="tank-image-container"
              style={{ height: `${tankData.percentage || 0}%` }}
            >
              {/* SVG waves */}
              <svg
                className="waves"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 24 150 28"
                preserveAspectRatio="none"
              >
                <defs>
                  <path
                    id="gentle-wave"
                    d="M-160 44c30 0 58-18 88-18s58 18 88 18
         58-18 88-18 58 18 88 18 v44h-352z"
                  />
                </defs>
                <g className="parallax">
                  <use
                    href="#gentle-wave"
                    x="48"
                    y="0"
                    fill="rgb(53, 158, 255)"
                  />
                  <use
                    href="#gentle-wave"
                    x="48"
                    y="3"
                    fill="rgb(39, 134, 223)"
                  />
                  <use
                    href="#gentle-wave"
                    x="48"
                    y="5"
                    fill="rgb(56, 145, 228)"
                  />
                  <use
                    href="#gentle-wave"
                    x="48"
                    y="7"
                    fill="rgb(46, 154, 255)"
                  />
                </g>
              </svg>

              <p>
                <b>{parseFloat(tankData.percentage).toFixed(0)}%</b>
              </p>
            </div>
          </div>
        </div>

        {/* Tank info */}
        <div className="tank-info">
          <h2>Tank Details Info</h2>
          <hr />
          <p>
            Status: <span className="status-online">Online</span>
          </p>
          <p>Sensor: {tankData.currentReading} cm</p>
          <p>Height: {tankData.waterHeight} cm</p>
          <p>Percent: {parseFloat(tankData.percentage).toFixed(2)} %</p>
          <p>Capacity: {parseFloat(tankData.maxCapacity).toFixed(2)} L</p>
          <p>Volume: {parseFloat(tankData.volume).toFixed(2)} L</p>
          <p>Last Updated: {formatDate(new Date())}</p>
        </div>
      </div>

      {/* Chart section */}
      <div className="tank-water2">
        <h2>Last 24 Hours Data</h2>
        <hr />
        <div className="chart-container">
          <Chart options={options} series={series} type="area" height={350} />
        </div>
      </div>
    </div>
  );
}

export default TankWater;
