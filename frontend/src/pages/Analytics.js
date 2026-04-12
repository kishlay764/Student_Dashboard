import "../styles/analytics.css";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function Analytics() {

    const data = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                label: "Study Hours",
                data: [2, 3, 1, 4, 2, 5, 3],
                backgroundColor: "#667eea"
            }
        ]
    }

    return (
        <div className="analytics">

            <h1>Productivity Analytics</h1>

            <div className="chart-box">
                <Bar data={data} />
            </div>

        </div>
    )
}

export default Analytics;