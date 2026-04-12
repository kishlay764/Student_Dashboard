import { useState, useEffect } from "react";
import "../styles/timer.css";

function Timer() {

    const [seconds, setSeconds] = useState(1500)
    const [running, setRunning] = useState(false)

    useEffect(() => {
        let interval = null

        if (running) {
            interval = setInterval(() => {
                setSeconds(prev => prev - 1)
            }, 1000)
        }

        return () => clearInterval(interval)

    }, [running])

    const minutes = Math.floor(seconds / 60)
    const sec = seconds % 60

    return (
        <div className="timer">

            <h3>Pomodoro Timer</h3>

            <h1>{minutes}:{sec < 10 ? "0" + sec : sec}</h1>

            <button onClick={() => setRunning(true)}>Start</button>
            <button onClick={() => setRunning(false)}>Stop</button>
            <button onClick={() => { setRunning(false); setSeconds(1500) }}>Reset</button>

        </div>
    )
}

export default Timer;