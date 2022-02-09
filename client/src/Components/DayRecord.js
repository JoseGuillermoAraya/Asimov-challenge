import { isSameDay } from "date-fns";
import React, { useState, useEffect } from "react";

const UNCLICKABLE = [33, 34, 35];

const getPaintIdxs = (startIndex) => {
  return [...Array(4).keys()].map((e) => e + startIndex);
};
const getTimeFromIdx = (idx) => {
  return `${9 + ~~((idx * 15) / 60)}:${
    (idx * 15) % 60 === 0 ? "00" : (idx * 15) % 60
  }`;
};
const getIdxFromTime = (hr, min) => {
  return (hr - 9) * 4 + min / 15;
};
const idxWillCollide = (idx, paintIdxs) => {
  return [...Array(4).keys()].some((e) => paintIdxs.includes(idx + e));
};
const isUnclickable = (idx, paintIdxs, dateSelected, timeSelected) => {
  const dayN = dateSelected.getDay();
  return (
    alreadyPassed(dateSelected, timeSelected) ||
    dayN === 0 ||
    dayN === 6 ||
    UNCLICKABLE.includes(idx) ||
    idxWillCollide(idx, paintIdxs)
  );
};
const handleHover = (el, idx, paintIdxs, dateSelected, timeSelected, color) => {
  if (isUnclickable(idx, paintIdxs, dateSelected, timeSelected)) {
    el.target.style.cursor = "initial";
  } else {
    el.target.style.background = color;
    el.target.style.cursor = "pointer";
  }
};
const alreadyPassed = (dateSelected, timeSelected) => {
  const [hrSelected, minSelected] = timeSelected.split(":");
  const selected = new Date(
    Date.UTC(
      dateSelected.getFullYear(),
      dateSelected.getMonth(),
      dateSelected.getDate(),
      hrSelected,
      minSelected
    )
  );
  const now = new Date();
  const nowUTC = new Date(
    Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes()
    )
  );
  return selected < nowUTC;
};
const getCellInfo = (idx, paintIdxs, dateSelected, timeSelected) => {
  const dayN = dateSelected.getDay();
  if (alreadyPassed(dateSelected, timeSelected))
    return { message: "Already passed", color: "red" };
  else if (dayN === 0 || dayN === 6)
    return { message: "Out of office hours", color: "red" };
  else if (paintIdxs.includes(idx)) return { message: "Taken", color: "blue" };
  else if (idxWillCollide(idx, paintIdxs))
    return { message: "Not enough time", color: "yellow" };
  else return { message: "Free", color: "white" };
};
const DayRecord = (props) => {
  const [paintIdxs, setPaintIdxs] = useState([]);
  const { record, dateSelected, handleClick } = props;
  const handleAnyClick = (el, idx, paintIdxs, dSelected, timeSelected) => {
    if (!isUnclickable(idx, paintIdxs, dSelected, timeSelected)) {
      handleClick(getTimeFromIdx(idx));
    }
  };
  useEffect(() => {
    console.log("use effect dayrecord");
    const dayRecord = record
      .map((e) => new Date(e))
      .filter((e) => isSameDay(dateSelected, e));
    console.log("dateSelected", dateSelected.toUTCString());
    console.log(
      "dayRecord",
      dayRecord.map((e) => e.toUTCString())
    );
    let newPaintIdxs = [];
    dayRecord.forEach((r) => {
      const partialNewPaintIdxs = getPaintIdxs(
        getIdxFromTime(r.getUTCHours(), r.getMinutes())
      );
      console.log("partialNewPaintIdxs", partialNewPaintIdxs);
      newPaintIdxs = newPaintIdxs.concat(partialNewPaintIdxs);
    });
    console.log("newPaintIdxs", newPaintIdxs);
    setPaintIdxs(newPaintIdxs);
  }, [dateSelected, record]);

  const NROWS = (17 - 9 + 1) * 4;
  const rowsAux = [...Array(NROWS).keys()];
  const rows = rowsAux
    .map((e) => [
      <div key={e} className={`row${e} recordRow`}>
        {getTimeFromIdx(e)}-{getTimeFromIdx(e + 1)}
      </div>,
      <div
        key={`rowMessage${e}`}
        className={`row-msg row-msg${e}`}
        style={{
          backgroundColor: getCellInfo(
            e,
            paintIdxs,
            dateSelected,
            getTimeFromIdx(e)
          ).color,
        }}
        onMouseOver={(el) =>
          handleHover(el, e, paintIdxs, dateSelected, getTimeFromIdx(e), "gray")
        }
        onMouseLeave={(el) =>
          handleHover(
            el,
            e,
            paintIdxs,
            dateSelected,
            getTimeFromIdx(e),
            "white"
          )
        }
        onClick={(el) => handleAnyClick(el, e, paintIdxs, dateSelected, getTimeFromIdx(e))}
      >
        {getCellInfo(e, paintIdxs, dateSelected, getTimeFromIdx(e)).message}
      </div>,
    ])
    .flat();

  return (
    <div className="DayRecord">
      <h2>Day Record</h2>
      <div className="row-container">{rows}</div>
    </div>
  );
};
export default DayRecord;
