// import logo from "./logo.svg";
import "./App.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import React, { useState, useEffect } from "react";
import DayRecord from "./Components/DayRecord";
import Form from "./Components/Form";

const apiPath = (process.env.API_PATH || 'http://localhost:3001')

function App() {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [record, setRecord] = useState([]);
  const [date, setDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [time, setTime] = useState("");

  const [formUser, setFormUser] = useState("");
  const [formEmail, setFormEmail] = useState("");

  const getRecord = () => {
    fetch(`${apiPath}/api/getHoursTaken`)
      .then((res) => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setRecord(result);
          console.log("record response: ", result);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  };
  const handleFormClose = () => {
    setShowForm(false);
  };
  const handleSumbit = () => {
    const dateString = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()} ${time}Z`;
    console.log(dateString);
    console.log("to send: ", formUser, formEmail, dateString);
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: formUser,
        "start-date": dateString,
        email: formEmail,
      }),
    };
    fetch(`${apiPath}/api/addApointment`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        getRecord();
      });
    handleFormClose();
  };
  const handleClick = (time) => {
    setTime(time);
    setShowForm(true);
  };
  // 1 time when component mounts
  useEffect(() => {
    console.log("APP USEEFFECT");
    getRecord();
  }, []);
  return (
    <div className="App">
      <Form show={showForm} handleClose={handleFormClose}>
        <h2>Appointment Reservation Form</h2>
        <h3>
          Date selected: {date.getDate()}/{date.getMonth()}/{date.getFullYear()}{" "}
          {time}-{time.split(":").map((e) => Number(e))[0] + 1}:
          {time.split(":")[1]}
        </h3>
        <div className="form-group">
          <label>Enter Name:</label>
          <input
            type="text"
            value={formUser}
            name="formUser"
            onChange={(e) => setFormUser(e.target.value)}
            className="form-control"
          />
          <label>Enter Email:</label>
          <input
            type="text"
            value={formEmail}
            name="formEmail"
            onChange={(e) => setFormEmail(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <button onClick={handleSumbit} type="button">
            Submit
          </button>
        </div>
      </Form>
      <Calendar onChange={setDate} value={date} />
      <DayRecord
        record={record}
        dateSelected={date}
        handleClick={handleClick}
      />
    </div>
  );
}

export default App;
